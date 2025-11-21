# Prawnik AI - Legal SaaS Platform

> Multi-tenant SaaS platform dla kancelarii prawnych z AI-powered RAG i automatycznym generowaniem dokumentów prawnych.

## 📋 Project Status

**Phase:** Design & Documentation ✅  
**Version:** 1.0 MVP  
**Last Updated:** 2024-11-16

## 🎯 Core Features (MVP)

- ✅ **Multi-tenant Architecture** - Pełna separacja danych per kancelaria (RLS)
- ✅ **Matter Management** - Zarządzanie sprawami i klientami
- ✅ **PDF Ingestion** - Upload, parsing, chunking, embedding (LlamaIndex + OpenAI)
- ✅ **RAG System** - Semantic search & chat (LlamaIndex) z pgvector
- ✅ **Q&A Interface** - Zadawanie pytań z kontekstem sprawy
- ✅ **Legal Task Engine** - Automatyczne generowanie dokumentów prawnych
- ✅ **Subscription Management** - Stripe integration
- ✅ **Audit Logging** - Pełna historia operacji
- ✅ **GDPR Compliance** - Data privacy i security

## 🏗️ Tech Stack

### Frontend/Backend
- **Next.js 15** (App Router, React Server Components)
- **TypeScript** (strict mode)
- **Tailwind CSS** + **shadcn/ui**
- **Vercel** (hosting, edge functions)

### Data Layer
- **Supabase Postgres** (database, auth, storage)
- **pgvector** (HNSW indexes dla embeddings)
- **Row Level Security** (multi-tenancy)

### AI/ML & RAG
- **LlamaIndex** (RAG orchestration framework)
  - PGVectorStore (native Supabase pgvector integration)
  - Query & Chat Engines (semantic search, Q&A)
- **OpenAI text-embedding-3-large** (1536 dims)
- **OpenAI o1-mini** (reasoning, legal analysis)
- **OpenAI GPT-4o** (generation, 128K context)

### Infrastructure
- **Upstash QStash** (serverless task queue)
- **Stripe** (payments, subscriptions)
- **SendGrid** (transactional emails)
- **Sentry** (error tracking)

## 📚 Documentation

| Document | Description |
|----------|-------------|
| [PLANNING.md](./PLANNING.md) | Project overview, tech stack, conventions |
| [ARCHITECTURE.md](./ARCHITECTURE.md) | System architecture, data flows, diagrams |
| [DATABASE.md](./DATABASE.md) | Complete database schema, RLS policies |
| [SECURITY.md](./SECURITY.md) | Security threats, mitigations, GDPR compliance |
| [PROJECT_STRUCTURE.md](./PROJECT_STRUCTURE.md) | Folder structure, naming conventions |
| [TEMPLATES_ANALYSIS.md](./TEMPLATES_ANALYSIS.md) | Template evaluation & cherry-pick strategy |
| [IMPLEMENTATION_PLAN.md](./IMPLEMENTATION_PLAN.md) | **⭐ Week-by-week implementation plan** |
| [LLAMAINDEX_GUIDE.md](./LLAMAINDEX_GUIDE.md) | **🤖 LlamaIndex RAG integration guide** |
| [TASK.md](./TASK.md) | Development tasks checklist |
| [schema.sql](./schema.sql) | Complete SQL schema (ready to run) |

## 🚀 Quick Start (After Implementation)

### Prerequisites
- Node.js 18+
- pnpm 8+
- Supabase account
- OpenAI API key
- Stripe account

### Installation

```bash
# Clone repository
git clone https://github.com/your-org/prawnik-ai.git
cd prawnik-ai

# Install dependencies
pnpm install

# Setup environment variables
cp .env.local.example .env.local
# Edit .env.local with your keys

# Run database migrations
pnpm supabase db push

# Start development server
pnpm dev
```

### Environment Variables

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
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

## 📊 Architecture Overview

```
CLIENT (Browser)
    ↓
VERCEL EDGE NETWORK (Next.js 15)
    ↓
┌─────────────┬─────────────┬─────────────┐
│  SUPABASE   │   UPSTASH   │   OPENAI    │
│  (Data)     │   (Queue)   │   (AI)      │
└─────────────┴─────────────┴─────────────┘
    ↓
EXTERNAL SERVICES (Stripe, SendGrid, Sentry)
```

## 🔐 Security Features

- ✅ HTTPS everywhere (TLS 1.3)
- ✅ Row Level Security (RLS) on all tables
- ✅ JWT-based authentication
- ✅ Multi-tenant data isolation
- ✅ Input validation (Zod)
- ✅ Rate limiting (per tenant)
- ✅ Audit logging
- ✅ GDPR compliance
- ✅ Encryption at rest (AES-256)
- ✅ Encryption in transit (TLS 1.3)

## 📈 Performance Targets (MVP)

- ⚡ TTFB: < 200ms
- ⚡ FCP: < 1.5s
- ⚡ LCP: < 2.5s
- ⚡ RAG query: < 3s
- ⚡ PDF processing: < 30s per document

## 💰 Pricing Strategy

| Plan | Price | Users | Documents | Storage |
|------|-------|-------|-----------|---------|
| **Starter** | $199/mo | 1-5 | 1,000 | 10 GB |
| **Professional** | $499/mo | 6-20 | 10,000 | 100 GB |
| **Enterprise** | Custom | Unlimited | Unlimited | Unlimited |

## 🗺️ Development Roadmap

### Phase 1: Foundation (Week 1-2) ✅ CURRENT
- [ ] Project setup (Next.js, TypeScript, Tailwind)
- [ ] Database schema design
- [ ] Supabase project setup
- [ ] Authentication flow
- [ ] Basic UI components

### Phase 2: Core Features (Week 3-4)
- [ ] Multi-tenant setup
- [ ] Matter management
- [ ] Document upload
- [ ] User management

### Phase 3: AI Integration (Week 5-6)
- [ ] PDF processing pipeline
- [ ] Vector search
- [ ] RAG implementation
- [ ] Chat interface

### Phase 4: Legal Task Engine (Week 7-8)
- [ ] Task management
- [ ] Context collection
- [ ] Multi-stage generation
- [ ] Task UI

### Phase 5: Billing & Polish (Week 9-10)
- [ ] Stripe integration
- [ ] Email notifications
- [ ] Audit logging
- [ ] UI polish

### Phase 6: Testing & Launch (Week 11-12)
- [ ] Testing (unit, integration, e2e)
- [ ] Performance optimization
- [ ] Security audit
- [ ] Beta launch

## 🧪 Testing

```bash
# Unit tests
pnpm test

# E2E tests
pnpm test:e2e

# Type checking
pnpm type-check

# Linting
pnpm lint
```

## 📦 Deployment

```bash
# Deploy to Vercel
vercel deploy

# Run migrations
pnpm supabase db push --linked

# Verify deployment
pnpm test:smoke
```

## 🤝 Contributing

See [CONTRIBUTING.md](./CONTRIBUTING.md) for development guidelines.

## 📄 License

Proprietary - All rights reserved

## 👥 Team

- **Senior Full-Stack Architect** - System design, implementation
- **Senior AI Engineer** - RAG, embeddings, LLM integration
- **Security Lead** - Security audit, GDPR compliance

## 📞 Support

- **Email:** support@prawnik.ai
- **Documentation:** https://docs.prawnik.ai
- **Status:** https://status.prawnik.ai

## 🙏 Acknowledgments

- **Supabase** - Database, Auth, Storage
- **OpenAI** - AI models
- **Vercel** - Hosting
- **shadcn/ui** - UI components

---

**Built with ❤️ for Polish law firms**

**Last Updated:** 2024-11-16
