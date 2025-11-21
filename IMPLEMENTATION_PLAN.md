# Implementation Plan - Prawnik AI MVP

**Date:** 2024-11-16  
**Status:** Ready to Start  
**Estimated Time:** 12 weeks

---

## 🎯 Executive Summary

### Base Strategy
- ✅ Start with **Vercel with-supabase template**
- ✅ Deploy to **Vercel** (production + previews)
- ✅ Develop **locally** with hot reload
- ✅ Cherry-pick code from reference templates
- ✅ Follow our custom `schema.sql` and architecture

### Why with-supabase Template?
1. **Official & Maintained:** Vercel + Supabase official integration
2. **SSR-Ready:** Supabase Auth with cookies (works everywhere)
3. **Modern Stack:** Next.js 15, App Router, TypeScript, shadcn/ui
4. **Minimal:** Easy to extend, no bloat
5. **Production-Ready:** Best practices built-in

---

## 📅 Week-by-Week Plan

### Week 1: Project Initialization & Core Setup

#### Day 1: Project Bootstrap (TODAY)
```bash
# 1. Update Vercel CLI
pnpm add -g vercel@latest

# 2. Create project from template
pnpm create next-app --example with-supabase prawnik-ai

# 3. Navigate to project
cd prawnik-ai

# 4. Install additional dependencies
pnpm add ai openai
pnpm add stripe @stripe/stripe-js
pnpm add pdf-parse tiktoken
pnpm add @upstash/qstash
pnpm add date-fns
pnpm add -D @types/pdf-parse

# 5. Initialize git (if not already)
git init
git add .
git commit -m "Initial commit from with-supabase template"

# 6. Create Vercel project
vercel link

# 7. Start dev server
pnpm dev
```

**Verification:**
- [x] App runs on `localhost:3000` ✅
- [x] TypeScript compiles without errors ✅
- [x] Tailwind CSS works ✅
- [x] shadcn/ui components render ✅

---

#### Day 2: Supabase Setup ✅ IN PROGRESS

**What was completed:**

1. ✅ **Supabase Project Created**
   - Project ID: `tskfjodbbnaozfmctjne`
   - Project URL: `https://tskfjodbbnaozfmctjne.supabase.co`
   - Region: EU Central 1 (Frankfurt)

2. ✅ **Supabase CLI Installed** (v2.58.5)
   ```bash
   brew install supabase/tap/supabase
   ```

3. ✅ **Local Project Initialized**
   ```bash
   supabase init
   # Created: supabase/ directory with config.toml
   ```

4. ✅ **Credentials Configured**
   - Created `SUPABASE_CREDENTIALS.md` (gitignored)
   - Updated `.env.local` with real credentials
   - Publishable Key: `sb_publishable_wU-erO71HyX8SQweE_zdvg_08Ld_Abs`

5. ✅ **Migration Structure Created**
   - `supabase/migrations/` - Universal migrations
   - `supabase/migrations/local/` - Local-only migrations
   - Created `MIGRATIONS_README.md` with strategy

6. ✅ **Connection Test Page**
   - Created `/test-connection` route
   - Visual test of Supabase connection
   - Shows configuration status

**Next Steps:**

```bash
# 1. Login to Supabase CLI (REQUIRED)
supabase login
# Follow browser prompt to authenticate

# 2. Link local project to cloud
supabase link --project-ref tskfjodbbnaozfmctjne

# 3. Enable pgvector extension
# In Supabase SQL Editor:
CREATE EXTENSION IF NOT EXISTS vector;
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

# 4. Create initial migration from schema.sql
supabase migration new initial_schema
# Copy content from ../schema.sql

# 5. Push migration to cloud
supabase db push

# 6. Setup Storage buckets
# In Supabase Dashboard > Storage:
# - Create "documents" bucket (private)
# - Create "avatars" bucket (public)

# 7. Configure Auth settings
# In Supabase Dashboard > Auth > URL Configuration:
# - Site URL: http://localhost:3000
# - Redirect URLs: http://localhost:3000/auth/callback
```

**Verification:**
- [x] Supabase CLI installed (v2.58.5) ✅
- [x] Local project initialized ✅
- [x] Credentials configured ✅
- [x] Migration structure created ✅
- [x] CLI logged in ✅
- [x] Project linked to cloud ✅
- [x] pgvector extension enabled (v0.8.0) ✅
- [x] Schema migrated (9 tables) ✅
- [x] RLS policies active ✅
- [ ] Storage buckets created (Day 3)
- [ ] Auth configured (Day 3)

**Test Connection:**
✅ Visit: http://localhost:3000/test-connection (Shows "✅ Connected")

**Database Tables Created:**
- `tenants` (Kancelarie)
- `users` (Użytkownicy)
- `matters` (Sprawy)
- `documents` (Dokumenty)
- `document_chunks` (Fragmenty dokumentów z wektorami)
- `tasks` (Zadania Legal Task Engine)
- `task_runs` (Wykonania zadań)
- `task_attachments` (Załączniki do zadań)
- `audit_logs` (Logi audytowe)

**Extensions Enabled:**
- ✅ vector (v0.8.0) - Vector embeddings
- ✅ uuid-ossp (v1.1) - UUID generation  
- ✅ pgcrypto (v1.3) - Cryptographic functions
- ✅ pg_trgm (v1.6) - Fuzzy text search

---

#### Day 3: Multi-Tenancy Foundation ✅ COMPLETED

**What was completed:**

1. ✅ **Created `lib/auth/tenant.ts`**
   - `getUserTenant()` - Get current user's tenant info
   - `setTenantContext()` - Set tenant context for RLS
   - `getTenantIdFromCookie()` - Fast access from cookie
   - `verifyTenantAccess()` - Verify user belongs to tenant
   - `hasRole()` / `isAdmin()` - Role-based checks
   - `getTenantUsers()` - List users in tenant
   - `getTenantBySlug()` - Get tenant by slug

2. ✅ **Updated `lib/supabase/middleware.ts`**
   - Automatically gets user's tenant_id on each request
   - Sets `tenant_id` cookie (httpOnly, 7 days)
   - Sets `user_role` cookie for RBAC
   - Cookies used for fast access without DB queries

3. ✅ **Created `lib/db/actions.ts`**
   - `withTenantContext()` wrapper for all queries
   - CRUD operations for Matters
   - CRUD operations for Documents
   - CRUD operations for Tasks
   - Search functions (matters, documents)
   - All queries automatically scoped to tenant via RLS

4. ✅ **Created `/dashboard` demo page**
   - Shows tenant information
   - Shows user information
   - Verifies cookie propagation
   - Lists multi-tenancy features

**Verification:**
- [x] Tenant utilities created ✅
- [x] Middleware propagates tenant_id ✅
- [x] withTenantContext() wrapper works ✅
- [x] Dashboard page displays tenant info ✅

**Files Created:**
- `lib/auth/tenant.ts` (175 lines)
- `lib/db/actions.ts` (315 lines)
- `app/dashboard/page.tsx` (145 lines)

**Files Modified:**
- `lib/supabase/middleware.ts` (+25 lines)

**Test Multi-Tenancy:**
Visit: http://localhost:3000/dashboard (requires authentication)

---

**Original plan for reference:**

1. **`lib/auth/tenant.ts`** - Tenant utilities
```typescript
import { createServerClient } from '@/lib/supabase/server';

export async function getUserTenant(userId: string) {
  const supabase = createServerClient();
  
  const { data: user } = await supabase
    .from('users')
    .select('tenant_id, role')
    .eq('id', userId)
    .single();
  
  return user;
}

export async function setTenantContext(tenantId: string) {
  const supabase = createServerClient();
  await supabase.rpc('set_tenant_context', { tenant_id: tenantId });
}
```

2. **`middleware.ts`** - Tenant propagation
```typescript
import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value;
        },
        set(name: string, value: string, options: any) {
          response.cookies.set({ name, value, ...options });
        },
        remove(name: string, options: any) {
          response.cookies.set({ name, value: '', ...options });
        },
      },
    }
  );

  const { data: { user } } = await supabase.auth.getUser();

  if (user) {
    // Get tenant_id from users table
    const { data: userData } = await supabase
      .from('users')
      .select('tenant_id, role')
      .eq('id', user.id)
      .single();

    if (userData) {
      // Add tenant context to headers
      response.headers.set('x-tenant-id', userData.tenant_id);
      response.headers.set('x-user-role', userData.role);
    }
  }

  return response;
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
```

**Verification:**
- [ ] Middleware propagates tenant_id
- [ ] RLS policies enforce tenant isolation
- [ ] Test with multiple users

---

#### Day 4-5: Dashboard Layout

**Cherry-pick from SaaS Boilerplate:**

1. **`components/layout/Sidebar.tsx`**
2. **`components/layout/Header.tsx`**
3. **`components/layout/UserMenu.tsx`**
4. **`app/(dashboard)/layout.tsx`**

**Create pages:**
- `app/(dashboard)/dashboard/page.tsx` - Main dashboard
- `app/(dashboard)/matters/page.tsx` - Matters list
- `app/(dashboard)/documents/page.tsx` - Documents list
- `app/(dashboard)/settings/page.tsx` - Settings

**Verification:**
- [ ] Dashboard layout renders
- [ ] Navigation works
- [ ] User menu shows correct data
- [ ] Responsive design works

---

### Week 2: Matter & Document Management

#### Day 6-7: Matter CRUD

**Files to Create:**

1. **`app/api/matters/route.ts`** - GET, POST
2. **`app/api/matters/[id]/route.ts`** - GET, PATCH, DELETE
3. **`components/matters/MatterCard.tsx`**
4. **`components/matters/MatterForm.tsx`**
5. **`hooks/use-matters.ts`**

**Verification:**
- [ ] Create matter
- [ ] List matters
- [ ] Edit matter
- [ ] Delete matter
- [ ] RLS enforced

---

#### Day 8-9: Document Upload

**Cherry-pick from Supabase RAG Template:**
- PDF validation logic
- Signed URL generation
- Direct upload to Storage

**Files to Create:**

1. **`app/api/documents/upload-url/route.ts`**
2. **`components/documents/DocumentUpload.tsx`**
3. **`lib/pdf/validator.ts`**

**Verification:**
- [ ] Upload PDF
- [ ] File validation works
- [ ] Progress indicator
- [ ] Storage path correct

---

#### Day 10: Document Processing Queue

**Files to Create:**

1. **`app/api/workers/process-document/route.ts`** - QStash worker
2. **`lib/pdf/parser.ts`** - PDF text extraction
3. **`lib/pdf/chunker.ts`** - Text chunking

**Verification:**
- [ ] QStash receives job
- [ ] PDF parsed correctly
- [ ] Text chunked properly
- [ ] Error handling works

---

### Week 3-4: AI Integration (RAG with LlamaIndex)

#### Day 11-12: LlamaIndex Setup & PDF Processing

**Using LlamaIndex Framework:**
- PGVectorStore for Supabase integration
- SimpleDirectoryReader for PDF ingestion
- SentenceSplitter for chunking

**Files to Create:**

1. **`lib/llamaindex/config.ts`** - LlamaIndex configuration
```typescript
import { OpenAI, Settings } from 'llamaindex'
import { PGVectorStore } from 'llamaindex/storage/vectorStore/PGVectorStore'

// Configure OpenAI
Settings.llm = new OpenAI({
  model: 'gpt-4o',
  apiKey: process.env.OPENAI_API_KEY,
})

Settings.embedModel = new OpenAI({
  model: 'text-embedding-3-large',
  dimensions: 1536,
})
```

2. **`lib/llamaindex/ingest.ts`** - Document ingestion
```typescript
import { SimpleDirectoryReader, VectorStoreIndex } from 'llamaindex'
import { getPGVectorStore } from './store'

export async function ingestDocument(filePath: string, matterId: string, tenantId: string) {
  const reader = new SimpleDirectoryReader()
  const documents = await reader.loadData(filePath)
  
  const vectorStore = await getPGVectorStore(tenantId)
  const index = await VectorStoreIndex.fromDocuments(documents, {
    vectorStore,
  })
  
  return index
}
```

3. **`lib/llamaindex/store.ts`** - PGVectorStore setup
```typescript
import { PGVectorStore } from 'llamaindex/storage/vectorStore/PGVectorStore'

export async function getPGVectorStore(tenantId: string) {
  return new PGVectorStore({
    connectionString: process.env.DATABASE_URL,
    schemaName: 'public',
    tableName: 'document_chunks',
    dimensions: 1536,
    // Add tenant filtering
    queryFilter: { tenant_id: tenantId },
  })
}
```

**Verification:**
- [ ] LlamaIndex configured
- [ ] PDF reading works (SimpleDirectoryReader)
- [ ] Chunking works (SentenceSplitter)
- [ ] Embeddings generated automatically
- [ ] Stored in pgvector via PGVectorStore
- [ ] Tenant isolation enforced

---

#### Day 13-14: Query Engine & Retrieval

**Using LlamaIndex Query Engines:**
- VectorIndexRetriever for semantic search
- RetrieverQueryEngine for Q&A
- Custom post-processors for re-ranking

**Files to Create:**

1. **`lib/llamaindex/query.ts`** - Query engine setup
```typescript
import { VectorStoreIndex, RetrieverQueryEngine } from 'llamaindex'
import { getPGVectorStore } from './store'

export async function createQueryEngine(tenantId: string, matterId?: string) {
  const vectorStore = await getPGVectorStore(tenantId)
  const index = await VectorStoreIndex.fromVectorStore(vectorStore)
  
  const retriever = index.asRetriever({
    similarityTopK: 10,
  })
  
  const queryEngine = new RetrieverQueryEngine(retriever)
  
  return queryEngine
}
```

2. **`app/api/rag/query/route.ts`** - Query endpoint
```typescript
'use server'
import { createQueryEngine } from '@/lib/llamaindex/query'

export async function POST(request: Request) {
  const { query, matterId } = await request.json()
  const tenantId = await getTenantIdFromCookie()
  
  const queryEngine = await createQueryEngine(tenantId, matterId)
  const response = await queryEngine.query(query)
  
  return Response.json({
    answer: response.response,
    sources: response.sourceNodes,
  })
}
```

**Verification:**
- [ ] Query engine created
- [ ] Semantic search works (vector retrieval)
- [ ] Full-text fallback works (pg_trgm)
- [ ] Tenant filtering enforced
- [ ] Matter-scoped queries work
- [ ] Source citations returned

---

#### Day 15-17: Chat Interface with LlamaIndex

**Using LlamaIndex Chat Engines:**
- CondensePlusContextChatEngine for conversational RAG
- Vercel AI SDK for streaming

**Files to Create:**

1. **`lib/llamaindex/chat.ts`** - Chat engine
```typescript
import { CondensePlusContextChatEngine, VectorStoreIndex } from 'llamaindex'
import { getPGVectorStore } from './store'

export async function createChatEngine(tenantId: string, matterId?: string) {
  const vectorStore = await getPGVectorStore(tenantId)
  const index = await VectorStoreIndex.fromVectorStore(vectorStore)
  
  const retriever = index.asRetriever({ similarityTopK: 5 })
  
  const chatEngine = new CondensePlusContextChatEngine({
    retriever,
    systemPrompt: "You are a legal AI assistant...",
  })
  
  return chatEngine
}
```

2. **`app/api/rag/chat/route.ts`** - Streaming endpoint with Vercel AI SDK
```typescript
import { createChatEngine } from '@/lib/llamaindex/chat'
import { LlamaIndexStream, StreamingTextResponse } from 'ai'

export async function POST(request: Request) {
  const { messages, matterId } = await request.json()
  const tenantId = await getTenantIdFromCookie()
  
  const chatEngine = await createChatEngine(tenantId, matterId)
  const stream = await chatEngine.chat({
    message: messages[messages.length - 1].content,
    chatHistory: messages.slice(0, -1),
    stream: true,
  })
  
  return new StreamingTextResponse(LlamaIndexStream(stream))
}
```

3. **`components/rag/ChatInterface.tsx`** - UI
```typescript
'use client'
import { useChat } from 'ai/react'

export function ChatInterface({ matterId }: { matterId?: string }) {
  const { messages, input, handleInputChange, handleSubmit } = useChat({
    api: '/api/rag/chat',
    body: { matterId },
  })
  
  // ... UI implementation
}
```

**Verification:**
- [ ] Chat engine works
- [ ] Streaming responses work
- [ ] Context retrieved from documents
- [ ] Citations shown with source
- [ ] Chat history maintained
- [ ] Matter context filters results

---

### Week 5-6: Legal Task Engine

#### Day 18-20: Task Management

**Files to Create:**

1. **`app/api/tasks/route.ts`** - CRUD
2. **`components/tasks/TaskCard.tsx`**
3. **`components/tasks/TaskForm.tsx`**

**Verification:**
- [ ] Create task
- [ ] List tasks
- [ ] Attach documents

---

#### Day 21-24: Multi-Stage Generation

**Files to Create:**

1. **`lib/tasks/engine.ts`** - Task engine
2. **`lib/tasks/context-collector.ts`** - Context collection
3. **`lib/tasks/generators.ts`** - Stage generators
4. **`app/api/workers/generate-task/route.ts`** - Worker

**Verification:**
- [ ] Stage 1: Analysis (o1-mini)
- [ ] Stage 2: Outline (GPT-4o)
- [ ] Stage 3: Generation (GPT-4o)
- [ ] Versioning works
- [ ] Iteration works

---

### Week 7-8: Billing & Polish

#### Day 25-27: Stripe Integration

**Cherry-pick from Stripe Template:**
- Webhook handler
- Checkout session

**Files to Create:**

1. **`lib/stripe/client.ts`**
2. **`app/api/webhooks/stripe/route.ts`**
3. **`app/api/billing/checkout/route.ts`**
4. **`components/billing/PricingTable.tsx`**

**Verification:**
- [ ] Checkout works
- [ ] Webhooks sync
- [ ] Subscription status updates
- [ ] Usage limits enforced

---

#### Day 28-30: UI Polish

**Tasks:**
- [ ] Loading states
- [ ] Error boundaries
- [ ] Empty states
- [ ] Responsive design
- [ ] Accessibility
- [ ] Performance optimization

---

### Week 9-10: Testing

#### Day 31-35: Unit & Integration Tests

**Setup:**
```bash
pnpm add -D vitest @testing-library/react @testing-library/jest-dom
```

**Test Files:**
- `lib/rag/search.test.ts`
- `lib/pdf/chunker.test.ts`
- `lib/tasks/engine.test.ts`

---

#### Day 36-40: E2E Tests

**Setup:**
```bash
pnpm add -D @playwright/test
```

**Test Files:**
- `tests/e2e/auth.spec.ts`
- `tests/e2e/matters.spec.ts`
- `tests/e2e/documents.spec.ts`
- `tests/e2e/rag.spec.ts`

---

### Week 11-12: Launch Preparation

#### Day 41-45: Security Audit

**Tasks:**
- [ ] Run security checklist (SECURITY.md)
- [ ] Penetration testing
- [ ] RLS policy verification
- [ ] Input validation audit
- [ ] Rate limiting verification

---

#### Day 46-50: Performance Optimization

**Tasks:**
- [ ] Database query optimization
- [ ] Index tuning
- [ ] Caching strategy
- [ ] Bundle size optimization
- [ ] Lighthouse audit

---

#### Day 51-55: Documentation & Beta Launch

**Tasks:**
- [ ] API documentation
- [ ] User guide
- [ ] Admin guide
- [ ] Beta user onboarding
- [ ] Feedback collection

---

## 🚀 First Action (RIGHT NOW)

### Initialize Project

```bash
# Navigate to project directory
cd "/Users/michal/.codeium/windsurf/Projects/Development/Prawnik AI"

# Update Vercel CLI
pnpm add -g vercel@latest

# Create project from template
pnpm create next-app --example with-supabase .

# Install additional dependencies
pnpm add ai openai stripe @stripe/stripe-js pdf-parse tiktoken @upstash/qstash date-fns
pnpm add -D @types/pdf-parse

# Start dev server
pnpm dev
```

**Expected Result:**
- Project initialized in current directory
- Dependencies installed
- Dev server running on `localhost:3000`
- Template app visible in browser

---

## 📋 Daily Checklist

### Every Morning:
1. [ ] Pull latest changes
2. [ ] Review TASK.md
3. [ ] Check Supabase dashboard
4. [ ] Review Vercel deployments

### Every Evening:
1. [ ] Commit changes
2. [ ] Update TASK.md
3. [ ] Push to GitHub
4. [ ] Verify preview deployment

---

## 🎯 Success Criteria

### Week 1:
- ✅ Project initialized
- ✅ Supabase connected
- ✅ Multi-tenancy working
- ✅ Dashboard layout complete

### Week 2:
- ✅ Matter CRUD working
- ✅ Document upload working
- ✅ PDF processing pipeline working

### Week 4:
- ✅ RAG query working
- ✅ Chat interface working
- ✅ Context retrieval accurate

### Week 6:
- ✅ Task generation working
- ✅ Multi-stage generation working
- ✅ Versioning working

### Week 8:
- ✅ Stripe integration working
- ✅ Subscription management working
- ✅ UI polished

### Week 12:
- ✅ All tests passing
- ✅ Security audit complete
- ✅ Beta launch ready

---

**Last Updated:** 2024-11-16  
**Next Update:** After Week 1 completion
