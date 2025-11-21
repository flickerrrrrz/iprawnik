# System Architecture - Prawnik AI

## 1. High-Level System Diagram

```
CLIENT LAYER
├── Browser (Next.js)
├── Mobile (Future)
└── API Clients
    │
    ▼
VERCEL EDGE NETWORK
├── Next.js 15 App Router
│   ├── Pages (RSC)
│   ├── API Routes
│   └── Server Actions
    │
    ▼
SERVICES LAYER
├── Supabase
│   ├── Postgres + pgvector
│   ├── Auth (JWT)
│   └── Storage (S3)
├── Upstash QStash (Task Queue)
├── OpenAI
│   ├── Embeddings API
│   ├── GPT-4o
│   └── o1-mini
└── External Services
    ├── Stripe (Billing)
    ├── SendGrid (Email)
    └── Sentry (Monitoring)
```

## 2. Multi-Tenancy Architecture

### 2.1 Tenant Isolation Strategy

**3-Layer Isolation:**

1. **Database Layer (RLS)**
```sql
-- All tables have tenant_id
CREATE TABLE matters (
  id UUID PRIMARY KEY,
  tenant_id UUID NOT NULL REFERENCES tenants(id),
  ...
);

-- RLS enforces isolation
CREATE POLICY "tenant_isolation" ON matters
  FOR ALL USING (tenant_id = auth.jwt() ->> 'tenant_id');
```

2. **Storage Layer (Path-based)**
```
/documents
  /{tenant_id}
    /{matter_id}
      /document_123.pdf
```

3. **Application Layer (JWT)**
```json
{
  "sub": "user_uuid",
  "tenant_id": "firm_abc",
  "role": "lawyer"
}
```

### 2.2 Tenant Propagation Flow

```
1. User logs in
   ↓
2. Supabase Auth generates JWT with custom claims
   ↓
3. JWT stored in httpOnly cookie
   ↓
4. Every request includes JWT
   ↓
5. Middleware extracts tenant_id
   ↓
6. RLS automatically filters by tenant_id
```

## 3. Data Flow - RAG Query

```
1. User Query
   "Jakie są terminy odwołania od wyroku?"
   ↓
2. Authentication (JWT validation)
   ↓
3. Query Embedding (OpenAI, ~50ms)
   ↓
4. Hybrid Search (Parallel)
   ├── Vector Search (pgvector HNSW, ~20ms)
   └── Full-Text Search (pg_trgm, ~10ms)
   ↓
5. Reciprocal Rank Fusion (RRF)
   ↓
6. Context Building (~4000 tokens)
   ↓
7. LLM Generation (GPT-4o, ~2-5s)
   ↓
8. Response + Citations

Total: ~3-6s
```

## 4. Data Flow - PDF Ingest

```
1. File Upload (Client)
   - Validation (size, type)
   - Virus scan
   ↓
2. Signed URL Generation (Server)
   ↓
3. Direct Upload to Supabase Storage
   ↓
4. Database Record Creation
   ↓
5. Enqueue Processing Job (QStash)
   ↓
6. Async Processing (Worker)
   ├── Download PDF
   ├── Text Extraction (pdf-parse)
   ├── Chunking (512 tokens, 128 overlap)
   ├── Embedding Generation (Batch)
   └── Database Insert (Bulk)
   ↓
7. Notification (Realtime + Email)

Total: ~20-40s dla 50-page document
```

## 5. Data Flow - Legal Task Engine

```
1. Task Creation
   - Type: "response_to_lawsuit"
   - Attachments: [pozew.pdf, umowa.pdf]
   ↓
2. Context Collection
   ├── Matter Documents
   ├── Legal Knowledge Base (Global)
   ├── Firm Templates
   └── Matter Metadata
   ↓
3. Multi-Stage Generation
   ├── STAGE 1: Analysis (o1-mini, ~10-20s)
   │   → Identify claims, legal basis, weaknesses
   ├── STAGE 2: Outline (GPT-4o, ~5-10s)
   │   → Structure document sections
   └── STAGE 3: Generation (GPT-4o, ~15-30s)
       → Full legal document
   ↓
4. Versioning & Storage
   ↓
5. User Review & Iteration

Total: ~30-60s dla initial generation
```

## 6. Security Architecture

### 6.1 Authentication Flow

```
1. User submits credentials
   ↓
2. Supabase Auth validates
   ↓
3. Generate JWT with custom claims:
   {
     "sub": "user_uuid",
     "tenant_id": "firm_abc",
     "role": "lawyer",
     "permissions": ["read_matters", "create_documents"]
   }
   ↓
4. Store JWT in httpOnly cookie
   ↓
5. Client includes cookie in all requests
   ↓
6. Server validates JWT signature
   ↓
7. RLS uses JWT claims for authorization
```

### 6.2 Authorization Matrix

| Role | Read Matters | Create Matters | Edit Matters | Delete Matters | Manage Users | Billing |
|------|--------------|----------------|--------------|----------------|--------------|---------|
| Owner | ✅ All | ✅ | ✅ All | ✅ All | ✅ | ✅ |
| Admin | ✅ All | ✅ | ✅ All | ✅ All | ✅ | ❌ |
| Lawyer | ✅ Assigned | ✅ | ✅ Assigned | ❌ | ❌ | ❌ |
| Paralegal | ✅ Assigned | ❌ | ✅ Assigned | ❌ | ❌ | ❌ |
| Viewer | ✅ Assigned | ❌ | ❌ | ❌ | ❌ | ❌ |

### 6.3 Data Protection Layers

1. **Transport Security**
   - HTTPS everywhere
   - TLS 1.3
   - HSTS headers

2. **Storage Security**
   - Encryption at rest (AES-256)
   - Signed URLs (time-limited)
   - RLS on buckets

3. **Database Security**
   - RLS on all tables
   - Prepared statements (SQL injection prevention)
   - Connection pooling (PgBouncer)

4. **Application Security**
   - CSRF protection
   - Rate limiting (per tenant)
   - Input validation (Zod)
   - XSS prevention (React auto-escaping)

## 7. Scalability Strategy

### 7.1 Database Scaling

**Vertical Scaling (Supabase Compute)**
```
MVP: Large (8GB RAM)
  → 100 tenants
  → 1M vectors
  → ~$200/month

Growth: XL (16GB RAM)
  → 500 tenants
  → 5M vectors
  → ~$400/month

Scale: 2XL (32GB RAM)
  → 1000+ tenants
  → 10M+ vectors
  → ~$800/month
```

**Horizontal Scaling (Future)**
- Sharding by tenant_id
- Read replicas dla analytics
- Separate DB dla global corpus

### 7.2 Vector Search Optimization

**HNSW Index Tuning**
```sql
-- For 1536-dim embeddings
CREATE INDEX ON document_chunks
USING hnsw (embedding vector_cosine_ops)
WITH (m = 24, ef_construction = 56);

-- Query-time tuning
SET hnsw.ef_search = 100;  -- Higher = better accuracy, slower
```

**Performance Targets**
- Query latency: < 50ms (p95)
- Throughput: 100 QPS per tenant
- Accuracy: > 0.95 recall@10

### 7.3 Caching Strategy

**1. Application Cache (Vercel KV)**
```typescript
// Cache embeddings
const cacheKey = `embedding:${hash(text)}`;
const cached = await kv.get(cacheKey);
if (cached) return cached;

const embedding = await openai.embeddings.create(...);
await kv.set(cacheKey, embedding, { ex: 86400 }); // 24h
```

**2. CDN Cache (Vercel Edge)**
```typescript
// Cache static assets
export const revalidate = 3600; // 1 hour

// Cache API responses
return new Response(data, {
  headers: {
    'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=300'
  }
});
```

**3. Database Cache (Postgres)**
```sql
-- Materialized views dla analytics
CREATE MATERIALIZED VIEW tenant_stats AS
SELECT tenant_id, COUNT(*) as matter_count, ...
FROM matters
GROUP BY tenant_id;

-- Refresh hourly
REFRESH MATERIALIZED VIEW CONCURRENTLY tenant_stats;
```

## 8. Monitoring & Observability

### 8.1 Metrics to Track

**Application Metrics**
- Request latency (p50, p95, p99)
- Error rate (4xx, 5xx)
- Throughput (requests/sec)
- Active users (concurrent)

**AI Metrics**
- Embedding generation time
- LLM response time
- Token usage (per tenant)
- Cost per query

**Database Metrics**
- Query latency
- Connection pool usage
- Cache hit rate
- Index usage

**Business Metrics**
- MAU (Monthly Active Users)
- Documents processed
- Tasks completed
- Revenue per tenant

### 8.2 Alerting Rules

```yaml
# Vercel Monitoring
alerts:
  - name: High Error Rate
    condition: error_rate > 5%
    duration: 5m
    action: slack + pagerduty
    
  - name: Slow Queries
    condition: p95_latency > 3s
    duration: 10m
    action: slack
    
  - name: High Cost
    condition: openai_cost > $1000/day
    duration: 1h
    action: email + slack
```

### 8.3 Logging Strategy

**Structured Logging**
```typescript
logger.info('RAG query executed', {
  tenant_id,
  matter_id,
  query_length: query.length,
  results_count: results.length,
  latency_ms: elapsed,
  tokens_used: usage.total_tokens,
  cost_usd: cost
});
```

**Log Retention**
- Application logs: 30 days (Vercel)
- Audit logs: 7 years (Supabase)
- Error logs: 90 days (Sentry)

## 9. Disaster Recovery

### 9.1 Backup Strategy

**Database Backups (Supabase)**
- Automated daily backups (retained 7 days)
- Point-in-time recovery (PITR) - 7 days
- Manual backups before major changes

**Storage Backups**
- Supabase Storage has built-in redundancy
- Consider S3 cross-region replication dla critical data

### 9.2 Recovery Procedures

**Database Restore**
```bash
# Restore from backup
supabase db restore --backup-id <id>

# Verify data integrity
psql -c "SELECT COUNT(*) FROM tenants;"
```

**Application Rollback**
```bash
# Vercel instant rollback
vercel rollback <deployment-url>
```

### 9.3 RTO/RPO Targets

- **RTO (Recovery Time Objective):** < 1 hour
- **RPO (Recovery Point Objective):** < 15 minutes
- **Data Loss Tolerance:** Zero dla financial data

---

**Last Updated:** 2024-11-16
