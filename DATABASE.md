# Database Schema - Prawnik AI

## Overview

Complete PostgreSQL schema with:
- ✅ Multi-tenant isolation (RLS)
- ✅ pgvector dla embeddings
- ✅ Full-text search (Polish)
- ✅ Audit logging
- ✅ Soft deletes
- ✅ Optimized indexes

---

## Core Tables

### 1. Tenants (Kancelarie)

```sql
CREATE TABLE tenants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  
  -- Subscription
  subscription_status TEXT NOT NULL DEFAULT 'trial'
    CHECK (subscription_status IN ('trial', 'active', 'past_due', 'canceled')),
  subscription_plan TEXT NOT NULL DEFAULT 'starter'
    CHECK (subscription_plan IN ('starter', 'professional', 'enterprise')),
  trial_ends_at TIMESTAMPTZ,
  
  -- Limits
  max_users INTEGER NOT NULL DEFAULT 5,
  max_documents INTEGER NOT NULL DEFAULT 1000,
  max_storage_gb INTEGER NOT NULL DEFAULT 10,
  
  -- Billing
  stripe_customer_id TEXT UNIQUE,
  stripe_subscription_id TEXT,
  
  -- Metadata
  settings JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  deleted_at TIMESTAMPTZ
);

-- Indexes
CREATE INDEX idx_tenants_slug ON tenants(slug);
CREATE INDEX idx_tenants_stripe_customer ON tenants(stripe_customer_id);
CREATE INDEX idx_tenants_deleted ON tenants(deleted_at) WHERE deleted_at IS NULL;

-- RLS
ALTER TABLE tenants ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own tenant"
  ON tenants FOR SELECT
  USING (id = (auth.jwt() ->> 'tenant_id')::uuid);

CREATE POLICY "Only owners can update tenant"
  ON tenants FOR UPDATE
  USING (
    id = (auth.jwt() ->> 'tenant_id')::uuid
    AND auth.jwt() ->> 'role' = 'owner'
  );
```

### 2. Users

```sql
CREATE TABLE users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  
  -- Profile
  email TEXT NOT NULL,
  full_name TEXT NOT NULL,
  avatar_url TEXT,
  
  -- Role & Permissions
  role TEXT NOT NULL DEFAULT 'lawyer'
    CHECK (role IN ('owner', 'admin', 'lawyer', 'paralegal', 'viewer')),
  permissions JSONB DEFAULT '[]'::jsonb,
  
  -- Status
  is_active BOOLEAN NOT NULL DEFAULT true,
  last_seen_at TIMESTAMPTZ,
  
  -- Metadata
  settings JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  deleted_at TIMESTAMPTZ
);

-- Indexes
CREATE INDEX idx_users_tenant ON users(tenant_id);
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(tenant_id, role);

-- RLS
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view users in their tenant"
  ON users FOR SELECT
  USING (tenant_id = (auth.jwt() ->> 'tenant_id')::uuid);

CREATE POLICY "Admins can manage users"
  ON users FOR ALL
  USING (
    tenant_id = (auth.jwt() ->> 'tenant_id')::uuid
    AND auth.jwt() ->> 'role' IN ('owner', 'admin')
  );
```

### 3. Matters (Sprawy)

```sql
CREATE TABLE matters (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  
  -- Basic Info
  title TEXT NOT NULL,
  matter_number TEXT NOT NULL,
  description TEXT,
  
  -- Classification
  matter_type TEXT NOT NULL
    CHECK (matter_type IN ('civil', 'criminal', 'administrative', 'other')),
  status TEXT NOT NULL DEFAULT 'active'
    CHECK (status IN ('active', 'pending', 'closed', 'archived')),
  priority TEXT NOT NULL DEFAULT 'medium'
    CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
  
  -- Client
  client_name TEXT NOT NULL,
  client_email TEXT,
  client_phone TEXT,
  client_address TEXT,
  
  -- Dates
  opened_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  closed_at TIMESTAMPTZ,
  deadline_at TIMESTAMPTZ,
  
  -- Assignment
  assigned_to UUID[] DEFAULT ARRAY[]::UUID[],
  created_by UUID NOT NULL REFERENCES users(id),
  
  -- Metadata
  tags TEXT[] DEFAULT ARRAY[]::TEXT[],
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  deleted_at TIMESTAMPTZ
);

-- Indexes
CREATE INDEX idx_matters_tenant ON matters(tenant_id);
CREATE INDEX idx_matters_status ON matters(tenant_id, status);
CREATE INDEX idx_matters_assigned ON matters USING GIN(assigned_to);
CREATE INDEX idx_matters_deadline ON matters(deadline_at) WHERE deadline_at IS NOT NULL;
CREATE INDEX idx_matters_tags ON matters USING GIN(tags);

-- Full-text search
ALTER TABLE matters ADD COLUMN search_vector tsvector
  GENERATED ALWAYS AS (
    setweight(to_tsvector('polish', coalesce(title, '')), 'A') ||
    setweight(to_tsvector('polish', coalesce(description, '')), 'B') ||
    setweight(to_tsvector('polish', coalesce(client_name, '')), 'C')
  ) STORED;

CREATE INDEX idx_matters_search ON matters USING GIN(search_vector);

-- RLS
ALTER TABLE matters ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view matters in their tenant"
  ON matters FOR SELECT
  USING (
    tenant_id = (auth.jwt() ->> 'tenant_id')::uuid
    AND (
      auth.jwt() ->> 'role' IN ('owner', 'admin')
      OR auth.uid() = ANY(assigned_to)
    )
  );

CREATE POLICY "Users can create matters"
  ON matters FOR INSERT
  WITH CHECK (
    tenant_id = (auth.jwt() ->> 'tenant_id')::uuid
    AND auth.jwt() ->> 'role' IN ('owner', 'admin', 'lawyer')
  );

CREATE POLICY "Users can update assigned matters"
  ON matters FOR UPDATE
  USING (
    tenant_id = (auth.jwt() ->> 'tenant_id')::uuid
    AND (
      auth.jwt() ->> 'role' IN ('owner', 'admin')
      OR auth.uid() = ANY(assigned_to)
    )
  );
```

### 4. Documents

```sql
CREATE TABLE documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  matter_id UUID REFERENCES matters(id) ON DELETE CASCADE,
  
  -- File Info
  filename TEXT NOT NULL,
  file_path TEXT NOT NULL,
  file_size_bytes BIGINT NOT NULL,
  mime_type TEXT NOT NULL,
  
  -- Classification
  document_type TEXT NOT NULL DEFAULT 'other'
    CHECK (document_type IN (
      'lawsuit', 'contract', 'court_decision', 'correspondence',
      'evidence', 'legal_act', 'template', 'other'
    )),
  
  -- Processing Status
  status TEXT NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending', 'processing', 'processed', 'failed')),
  processing_error TEXT,
  processed_at TIMESTAMPTZ,
  
  -- Stats
  chunk_count INTEGER DEFAULT 0,
  page_count INTEGER,
  
  -- Metadata
  metadata JSONB DEFAULT '{}'::jsonb,
  uploaded_by UUID NOT NULL REFERENCES users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  deleted_at TIMESTAMPTZ
);

-- Indexes
CREATE INDEX idx_documents_tenant ON documents(tenant_id);
CREATE INDEX idx_documents_matter ON documents(matter_id);
CREATE INDEX idx_documents_status ON documents(tenant_id, status);
CREATE INDEX idx_documents_type ON documents(tenant_id, document_type);

-- RLS
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view documents in their tenant"
  ON documents FOR SELECT
  USING (
    tenant_id = (auth.jwt() ->> 'tenant_id')::uuid
    AND (
      matter_id IS NULL  -- Global documents
      OR EXISTS (
        SELECT 1 FROM matters m
        WHERE m.id = documents.matter_id
        AND (
          auth.jwt() ->> 'role' IN ('owner', 'admin')
          OR auth.uid() = ANY(m.assigned_to)
        )
      )
    )
  );

CREATE POLICY "Users can upload documents"
  ON documents FOR INSERT
  WITH CHECK (
    tenant_id = (auth.jwt() ->> 'tenant_id')::uuid
  );
```

### 5. Document Chunks (with Embeddings)

```sql
-- Enable pgvector extension
CREATE EXTENSION IF NOT EXISTS vector;

CREATE TABLE document_chunks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  document_id UUID NOT NULL REFERENCES documents(id) ON DELETE CASCADE,
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  matter_id UUID REFERENCES matters(id) ON DELETE CASCADE,
  
  -- Content
  content TEXT NOT NULL,
  chunk_index INTEGER NOT NULL,
  
  -- Vector Embedding (1536 dimensions dla OpenAI text-embedding-3-large)
  embedding vector(1536),
  
  -- Metadata
  page_number INTEGER,
  metadata JSONB DEFAULT '{}'::jsonb,
  
  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  
  -- Constraints
  UNIQUE(document_id, chunk_index)
);

-- Indexes
CREATE INDEX idx_chunks_document ON document_chunks(document_id);
CREATE INDEX idx_chunks_tenant ON document_chunks(tenant_id);
CREATE INDEX idx_chunks_matter ON document_chunks(matter_id);

-- HNSW Index dla vector search (CRITICAL dla performance)
CREATE INDEX idx_chunks_embedding ON document_chunks
USING hnsw (embedding vector_cosine_ops)
WITH (m = 24, ef_construction = 56);

-- Full-text search index
ALTER TABLE document_chunks ADD COLUMN search_vector tsvector
  GENERATED ALWAYS AS (to_tsvector('polish', content)) STORED;

CREATE INDEX idx_chunks_search ON document_chunks USING GIN(search_vector);

-- Composite index dla filtered vector search
CREATE INDEX idx_chunks_tenant_matter_embedding ON document_chunks(tenant_id, matter_id);

-- RLS
ALTER TABLE document_chunks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view chunks in their tenant"
  ON document_chunks FOR SELECT
  USING (
    tenant_id = (auth.jwt() ->> 'tenant_id')::uuid
    AND (
      matter_id IS NULL
      OR EXISTS (
        SELECT 1 FROM matters m
        WHERE m.id = document_chunks.matter_id
        AND (
          auth.jwt() ->> 'role' IN ('owner', 'admin')
          OR auth.uid() = ANY(m.assigned_to)
        )
      )
    )
  );
```

### 6. Tasks (Legal Task Engine)

```sql
CREATE TABLE tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  matter_id UUID NOT NULL REFERENCES matters(id) ON DELETE CASCADE,
  
  -- Task Info
  task_type TEXT NOT NULL
    CHECK (task_type IN (
      'response_to_lawsuit',
      'lawsuit_draft',
      'contract_review',
      'legal_opinion',
      'appeal',
      'motion',
      'other'
    )),
  title TEXT NOT NULL,
  instructions TEXT,
  
  -- Status
  status TEXT NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending', 'processing', 'completed', 'failed')),
  
  -- Assignment
  created_by UUID NOT NULL REFERENCES users(id),
  assigned_to UUID REFERENCES users(id),
  
  -- Metadata
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  deleted_at TIMESTAMPTZ
);

-- Indexes
CREATE INDEX idx_tasks_tenant ON tasks(tenant_id);
CREATE INDEX idx_tasks_matter ON tasks(matter_id);
CREATE INDEX idx_tasks_status ON tasks(tenant_id, status);
CREATE INDEX idx_tasks_assigned ON tasks(assigned_to);

-- RLS
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view tasks in their matters"
  ON tasks FOR SELECT
  USING (
    tenant_id = (auth.jwt() ->> 'tenant_id')::uuid
    AND EXISTS (
      SELECT 1 FROM matters m
      WHERE m.id = tasks.matter_id
      AND (
        auth.jwt() ->> 'role' IN ('owner', 'admin')
        OR auth.uid() = ANY(m.assigned_to)
      )
    )
  );

CREATE POLICY "Users can create tasks"
  ON tasks FOR INSERT
  WITH CHECK (
    tenant_id = (auth.jwt() ->> 'tenant_id')::uuid
    AND auth.jwt() ->> 'role' IN ('owner', 'admin', 'lawyer')
  );
```

### 7. Task Runs (Versioning)

```sql
CREATE TABLE task_runs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  task_id UUID NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  
  -- Version
  version INTEGER NOT NULL,
  
  -- Generation Results
  analysis_result JSONB,
  outline_result TEXT,
  final_result TEXT NOT NULL,
  
  -- AI Metrics
  tokens_used INTEGER,
  cost_usd NUMERIC(10, 4),
  duration_ms INTEGER,
  model_used TEXT,
  
  -- Status
  status TEXT NOT NULL DEFAULT 'completed'
    CHECK (status IN ('completed', 'failed')),
  error_message TEXT,
  
  -- Metadata
  metadata JSONB DEFAULT '{}'::jsonb,
  created_by UUID NOT NULL REFERENCES users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  
  -- Constraints
  UNIQUE(task_id, version)
);

-- Indexes
CREATE INDEX idx_task_runs_task ON task_runs(task_id);
CREATE INDEX idx_task_runs_version ON task_runs(task_id, version DESC);

-- RLS
ALTER TABLE task_runs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view task runs in their matters"
  ON task_runs FOR SELECT
  USING (
    tenant_id = (auth.jwt() ->> 'tenant_id')::uuid
    AND EXISTS (
      SELECT 1 FROM tasks t
      JOIN matters m ON t.matter_id = m.id
      WHERE t.id = task_runs.task_id
      AND (
        auth.jwt() ->> 'role' IN ('owner', 'admin')
        OR auth.uid() = ANY(m.assigned_to)
      )
    )
  );
```

### 8. Task Attachments

```sql
CREATE TABLE task_attachments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  task_id UUID NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
  document_id UUID NOT NULL REFERENCES documents(id) ON DELETE CASCADE,
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  
  -- Metadata
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  
  -- Constraints
  UNIQUE(task_id, document_id)
);

-- Indexes
CREATE INDEX idx_task_attachments_task ON task_attachments(task_id);
CREATE INDEX idx_task_attachments_document ON task_attachments(document_id);

-- RLS
ALTER TABLE task_attachments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view task attachments"
  ON task_attachments FOR SELECT
  USING (tenant_id = (auth.jwt() ->> 'tenant_id')::uuid);
```

### 9. Audit Logs

```sql
CREATE TABLE audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  
  -- Actor
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  user_email TEXT NOT NULL,
  
  -- Action
  action TEXT NOT NULL,
  resource_type TEXT NOT NULL,
  resource_id UUID,
  
  -- Details
  changes JSONB,
  metadata JSONB DEFAULT '{}'::jsonb,
  
  -- Context
  ip_address INET,
  user_agent TEXT,
  
  -- Timestamp
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Indexes
CREATE INDEX idx_audit_logs_tenant ON audit_logs(tenant_id);
CREATE INDEX idx_audit_logs_user ON audit_logs(user_id);
CREATE INDEX idx_audit_logs_resource ON audit_logs(resource_type, resource_id);
CREATE INDEX idx_audit_logs_created ON audit_logs(created_at DESC);

-- Partitioning by month (dla performance)
CREATE TABLE audit_logs_y2024m11 PARTITION OF audit_logs
  FOR VALUES FROM ('2024-11-01') TO ('2024-12-01');

-- RLS
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view audit logs in their tenant"
  ON audit_logs FOR SELECT
  USING (
    tenant_id = (auth.jwt() ->> 'tenant_id')::uuid
    AND auth.jwt() ->> 'role' IN ('owner', 'admin')
  );
```

---

## Helper Functions

### 1. Update updated_at Trigger

```sql
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply to all tables
CREATE TRIGGER update_tenants_updated_at
  BEFORE UPDATE ON tenants
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_users_updated_at
  BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_matters_updated_at
  BEFORE UPDATE ON matters
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_documents_updated_at
  BEFORE UPDATE ON documents
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_tasks_updated_at
  BEFORE UPDATE ON tasks
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
```

### 2. Audit Log Trigger

```sql
CREATE OR REPLACE FUNCTION log_audit()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO audit_logs (
    tenant_id,
    user_id,
    user_email,
    action,
    resource_type,
    resource_id,
    changes,
    ip_address
  ) VALUES (
    COALESCE(NEW.tenant_id, OLD.tenant_id),
    auth.uid(),
    auth.jwt() ->> 'email',
    TG_OP,
    TG_TABLE_NAME,
    COALESCE(NEW.id, OLD.id),
    jsonb_build_object(
      'old', to_jsonb(OLD),
      'new', to_jsonb(NEW)
    ),
    inet_client_addr()
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Apply to sensitive tables
CREATE TRIGGER audit_matters
  AFTER INSERT OR UPDATE OR DELETE ON matters
  FOR EACH ROW EXECUTE FUNCTION log_audit();

CREATE TRIGGER audit_documents
  AFTER INSERT OR UPDATE OR DELETE ON documents
  FOR EACH ROW EXECUTE FUNCTION log_audit();

CREATE TRIGGER audit_tasks
  AFTER INSERT OR UPDATE OR DELETE ON tasks
  FOR EACH ROW EXECUTE FUNCTION log_audit();
```

### 3. Hybrid Search Function

```sql
CREATE OR REPLACE FUNCTION hybrid_search(
  p_tenant_id UUID,
  p_matter_id UUID,
  p_query_embedding vector(1536),
  p_query_text TEXT,
  p_limit INTEGER DEFAULT 10
)
RETURNS TABLE (
  id UUID,
  content TEXT,
  similarity FLOAT,
  rank FLOAT,
  combined_score FLOAT
) AS $$
BEGIN
  RETURN QUERY
  WITH vector_search AS (
    SELECT
      dc.id,
      dc.content,
      1 - (dc.embedding <=> p_query_embedding) AS similarity,
      ROW_NUMBER() OVER (ORDER BY dc.embedding <=> p_query_embedding) AS rank
    FROM document_chunks dc
    WHERE dc.tenant_id = p_tenant_id
      AND (p_matter_id IS NULL OR dc.matter_id = p_matter_id)
    ORDER BY dc.embedding <=> p_query_embedding
    LIMIT 20
  ),
  fts_search AS (
    SELECT
      dc.id,
      dc.content,
      ts_rank(dc.search_vector, to_tsquery('polish', p_query_text)) AS rank,
      ROW_NUMBER() OVER (ORDER BY ts_rank(dc.search_vector, to_tsquery('polish', p_query_text)) DESC) AS rank_number
    FROM document_chunks dc
    WHERE dc.tenant_id = p_tenant_id
      AND (p_matter_id IS NULL OR dc.matter_id = p_matter_id)
      AND dc.search_vector @@ to_tsquery('polish', p_query_text)
    ORDER BY rank DESC
    LIMIT 20
  ),
  combined AS (
    SELECT
      COALESCE(vs.id, fts.id) AS id,
      COALESCE(vs.content, fts.content) AS content,
      COALESCE(vs.similarity, 0) AS similarity,
      COALESCE(fts.rank, 0) AS fts_rank,
      (COALESCE(1.0 / (60 + vs.rank), 0) + COALESCE(1.0 / (60 + fts.rank_number), 0)) AS combined_score
    FROM vector_search vs
    FULL OUTER JOIN fts_search fts ON vs.id = fts.id
  )
  SELECT
    c.id,
    c.content,
    c.similarity,
    c.fts_rank,
    c.combined_score
  FROM combined c
  ORDER BY c.combined_score DESC
  LIMIT p_limit;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

---

**Last Updated:** 2024-11-16
