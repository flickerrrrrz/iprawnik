# Prawnik AI - SaaS Platform for Law Firms
## Project Planning & Architecture

**Version:** 1.0 MVP  
**Date:** 2024-11-16  
**Status:** Design Phase → Ready for Implementation  
**Deployment:** Vercel (production) + Local development  
**Base Template:** Vercel with-supabase starter (modified)

---

## 1. Project Overview

Prawnik AI to wielodostępna (multi-tenant) platforma SaaS dla kancelarii prawnych oferująca:

### Core Features (MVP)
- ✅ **Multi-tenant architecture** - pełna separacja danych per kancelaria
- ✅ **Matter management** - zarządzanie sprawami i dokumentami
- ✅ **PDF ingestion** - upload, parsing, chunking, embedding
- ✅ **RAG system** - wyszukiwanie hybrydowe (vector + full-text)
- ✅ **Q&A interface** - zadawanie pytań z kontekstem sprawy
- ✅ **Legal Task Engine** - generowanie dokumentów prawnych
- ✅ **Subscription management** - Stripe integration
- ✅ **Audit logging** - pełna historia operacji
- ✅ **GDPR compliance** - data privacy i security

### Future Features (Post-MVP)
- 🔄 API wydawnictwa prawnego (zamiast PDF upload)
- 🔄 Advanced analytics i reporting
- 🔄 Mobile apps (iOS/Android)
- 🔄 Email integration
- 🔄 Calendar integration
- 🔄 E-signature integration

---

## 2. Technology Stack - Verified & Optimized

### Frontend/Backend
- **Next.js 15** (App Router, React Server Components)
- **TypeScript** (strict mode)
- **Vercel** (hosting, edge functions, analytics)
- **Tailwind CSS** + **shadcn/ui** (styling, components)
- **React Hook Form** + **Zod** (forms, validation)

### Data Layer
- **Supabase Postgres** (database, connection pooling)
- **Supabase Auth** (authentication, JWT, MFA)
- **Supabase Storage** (S3-compatible file storage)
- **pgvector** (HNSW indexes dla embeddings)
- **pg_trgm** (full-text search, Polish support)

### AI/ML & RAG
- **LlamaIndex** (RAG orchestration framework)
  - PGVectorStore (native Supabase integration)
  - SimpleDirectoryReader (PDF processing)
  - VectorStoreIndex (semantic search)
  - Query Engine (Q&A, chat, retrieval)
- **OpenAI text-embedding-3-large** (1536 dims, $0.13/1M tokens)
- **OpenAI o1-mini** (reasoning, legal analysis)
- **OpenAI GPT-4o** (generation, 128K context)
- **OpenAI GPT-4o-mini** (cheap Q&A)

### Infrastructure
- **Upstash QStash** (serverless task queue)
- **Vercel Workflow** (long-running operations)
- **Stripe** (payments, subscriptions, invoicing)
- **SendGrid** (transactional emails)
- **Sentry** (error tracking, performance monitoring)

### Development Tools
- **pnpm** (package manager)
- **ESLint** + **Prettier** (code quality)
- **Vitest** (unit tests)
- **Playwright** (e2e tests)
- **GitHub Actions** (CI/CD)

---

## 3. Architecture Decisions

### Why Next.js 15?
✅ React Server Components - reduced bundle size  
✅ Server Actions - secure mutations without API routes  
✅ Streaming SSR - better UX for long operations  
✅ Partial Prerendering - optimal performance  
✅ Built-in optimizations (fonts, images, scripts)

### Why Supabase?
✅ Native pgvector support (HNSW indexes)  
✅ Row Level Security - perfect dla multi-tenancy  
✅ Real-time subscriptions  
✅ Auto-generated REST API  
✅ Built-in Auth + Storage

### Why HNSW over IVFFlat?
✅ Better performance (see Supabase benchmarks)  
✅ No rebuilds needed when data changes  
✅ More robust dla production workloads  
✅ Recommended by Supabase dla 1536-dim embeddings

### Why QStash over Redis?
✅ HTTP-based (no persistent connections)  
✅ Perfect dla serverless environments  
✅ Built-in retries + DLQ  
✅ Scheduled tasks support  
✅ No connection pooling issues

### Why LlamaIndex for RAG?
✅ **Native Supabase integration** - PGVectorStore dla pgvector  
✅ **Production-ready** - battle-tested w enterprise  
✅ **PDF processing** - SimpleDirectoryReader, PDFReader out-of-the-box  
✅ **Query engines** - RetrieverQueryEngine, ChatEngine, CondensePlusContextChatEngine  
✅ **Chunking strategies** - SentenceSplitter, RecursiveCharacterTextSplitter  
✅ **Flexibility** - custom retrievers, post-processors, response synthesizers  
✅ **Multi-modal** - wsparcie dla różnych typów dokumentów  
✅ **Active development** - regularne updates, dobra dokumentacja  
✅ **TypeScript support** - llamaindex.ts dla Next.js

**vs Custom Implementation:**
- ❌ Custom: Więcej kodu, więcej błędów, więcej maintenance
- ❌ Custom: Trzeba wymyślić chunking, retrieval, re-ranking
- ❌ Custom: Brak gotowych optymalizacji
- ✅ LlamaIndex: Przetestowane rozwiązania, best practices, community support

---

## 4. Project Structure

See: `ARCHITECTURE.md` for detailed architecture diagrams  
See: `DATABASE.md` for complete database schema  
See: `SECURITY.md` for security guidelines  
See: `API.md` for API documentation

---

## 5. Development Phases

### Phase 1: Foundation (Week 1-2) ✅ CURRENT
- [ ] Project setup (Next.js, TypeScript, Tailwind)
- [ ] Database schema design
- [ ] Supabase project setup
- [ ] Authentication flow
- [ ] Basic UI components (shadcn/ui)

### Phase 2: Core Features (Week 3-4)
- [ ] Multi-tenant setup (RLS policies)
- [ ] Matter management (CRUD)
- [ ] PDF upload + storage
- [ ] User management
- [ ] Dashboard layout

### Phase 3: AI Integration (Week 5-6)
- [ ] PDF processing pipeline
- [ ] Embedding generation
- [ ] Vector search implementation
- [ ] RAG query endpoint
- [ ] Q&A interface

### Phase 4: Legal Task Engine (Week 7-8)
- [ ] Task creation flow
- [ ] Context collection
- [ ] Multi-stage generation
- [ ] Document versioning
- [ ] Iteration support

### Phase 5: Billing & Polish (Week 9-10)
- [ ] Stripe integration
- [ ] Subscription plans
- [ ] Usage tracking
- [ ] Email notifications
- [ ] Audit logging

### Phase 6: Testing & Launch (Week 11-12)
- [ ] E2E tests
- [ ] Performance optimization
- [ ] Security audit
- [ ] Documentation
- [ ] Beta launch

---

## 6. Code Style & Conventions

### File Naming
- Components: `PascalCase.tsx` (e.g., `MatterList.tsx`)
- Utilities: `camelCase.ts` (e.g., `formatDate.ts`)
- API routes: `kebab-case/route.ts` (e.g., `api/matters/route.ts`)
- Database: `snake_case` (e.g., `matter_documents`)

### Component Structure
```typescript
// 1. Imports (grouped: React, Next, external, internal)
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { formatDate } from '@/lib/utils'

// 2. Types
interface MatterCardProps {
  matter: Matter
  onEdit: (id: string) => void
}

// 3. Component
export function MatterCard({ matter, onEdit }: MatterCardProps) {
  // 4. Hooks
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  
  // 5. Handlers
  const handleClick = () => {
    router.push(`/matters/${matter.id}`)
  }
  
  // 6. Render
  return (
    <div>...</div>
  )
}
```

### Database Conventions
- All tables have `id` (UUID, primary key)
- All tables have `created_at` (timestamptz, default now())
- All tables have `updated_at` (timestamptz, auto-updated)
- All tables have `tenant_id` (UUID, foreign key to tenants)
- All RLS policies check `tenant_id`
- All indexes include `tenant_id` as first column

### API Response Format
```typescript
// Success
{
  "data": { ... },
  "meta": {
    "page": 1,
    "limit": 20,
    "total": 100
  }
}

// Error
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid input",
    "details": { ... }
  }
}
```

---

## 7. Environment Variables

```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=

# OpenAI
OPENAI_API_KEY=

# Upstash
QSTASH_URL=
QSTASH_TOKEN=

# Stripe
STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=

# SendGrid
SENDGRID_API_KEY=

# Sentry
SENTRY_DSN=

# App
NEXT_PUBLIC_APP_URL=
```

---

## 8. Key Metrics & Targets (MVP)

### Performance
- ⚡ Time to First Byte (TTFB): < 200ms
- ⚡ First Contentful Paint (FCP): < 1.5s
- ⚡ Largest Contentful Paint (LCP): < 2.5s
- ⚡ RAG query latency: < 3s
- ⚡ PDF processing: < 30s per document

### Scalability
- 📈 Support 100 tenants (MVP)
- 📈 10,000 documents per tenant
- 📈 1M vector embeddings total
- 📈 1000 concurrent users

### Cost (per tenant/month)
- 💰 Supabase: ~$25 (Pro plan)
- 💰 OpenAI: ~$50 (embeddings + generation)
- 💰 Vercel: ~$20 (Pro plan)
- 💰 Total: ~$95/tenant/month

### Pricing Strategy
- 💵 Starter: $199/month (1-5 users, 1000 docs)
- 💵 Professional: $499/month (6-20 users, 10000 docs)
- 💵 Enterprise: Custom (unlimited)

---

## 9. Template Strategy & Implementation Approach

### Decision: Use Vercel with-supabase Starter + Cherry-pick

**Base Template:** `vercel/next.js/examples/with-supabase`

**Why this template?**
- ✅ Official Vercel + Supabase integration
- ✅ Next.js 15 App Router
- ✅ Supabase Auth with cookies (SSR-ready)
- ✅ shadcn/ui pre-configured
- ✅ Tailwind CSS setup
- ✅ TypeScript strict mode
- ✅ Minimal boilerplate (easy to extend)

**What we'll add:**
1. Multi-tenancy (tenant_id propagation)
2. PDF ingestion pipeline (from Supabase RAG template)
3. Vector search + RAG (from AI SDK template)
4. Legal Task Engine (custom)
5. Stripe subscriptions (from Stripe template)
6. Dashboard layout (from SaaS Boilerplate)

**See `TEMPLATES_ANALYSIS.md` for detailed cherry-pick strategy.**

---

## 10. Deployment Strategy

### Development Environment
- **Local:** `localhost:3000` (Next.js dev server)
- **Supabase:** Local instance via `supabase start` (optional)
- **Database:** Supabase cloud (shared dev project)

### Production Environment
- **Hosting:** Vercel (automatic deployments from `main` branch)
- **Database:** Supabase (production project)
- **Domain:** TBD (custom domain via Vercel)
- **CDN:** Vercel Edge Network
- **Monitoring:** Vercel Analytics + Sentry

### CI/CD Pipeline
- **Preview:** Auto-deploy on PR (Vercel preview deployments)
- **Staging:** `staging` branch → staging.prawnik.ai
- **Production:** `main` branch → prawnik.ai

**Vercel CLI Status:** ✅ Installed (v47.0.5, logged in as michalpawlikpl-2701)

---

## 11. Next Steps

1. ✅ Read this document
2. ✅ Review `ARCHITECTURE.md` for system design
3. ✅ Review `DATABASE.md` for schema details
4. ✅ Review `SECURITY.md` for security guidelines
5. ✅ Review `TEMPLATES_ANALYSIS.md` for cherry-pick strategy
6. 🚀 **NEXT:** Initialize project with `with-supabase` template
7. ⏳ Setup Supabase project
8. ⏳ Run database migrations
9. ⏳ Implement multi-tenancy middleware
10. ⏳ Cherry-pick PDF ingestion code

---

**Last Updated:** 2024-11-16  
**Next Review:** After Phase 1 completion
