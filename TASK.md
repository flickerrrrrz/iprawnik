# Task List - Prawnik AI MVP

## Phase 1: Foundation (Week 1-2) 🚀 CURRENT

### Setup & Configuration
- [x] Initialize Next.js 15 project with Vercel with-supabase template
  - [x] Run `pnpm create next-app --example with-supabase app-code`
  - [x] Verify TypeScript strict mode
  - [x] Verify Tailwind CSS setup
  - [x] Verify shadcn/ui installation
  - [x] Verify import aliases (@/)
  - [x] Update Vercel CLI to latest (v48.10.2)
  - [x] Install additional dependencies (ai, openai, stripe, pdf-parse, tiktoken, qstash)
  - [x] Dev server running on localhost:3000
  - **Date:** 2024-11-16 ✅ COMPLETED
  - **Location:** `/app-code/` directory
  
- [x] Setup Supabase project ✅ COMPLETED
  - [x] Create Supabase project (tskfjodbbnaozfmctjne)
  - [x] Install Supabase CLI (v2.58.5)
  - [x] Initialize local project
  - [x] Configure credentials (.env.local)
  - [x] Create migration structure
  - [x] Enable pgvector extension (v0.8.0)
  - [x] Run initial migration (9 tables created)
  - [x] Link project with cloud
  - [x] Verify connection (/test-connection)
  - [ ] Configure authentication (next)
  - [ ] Setup Storage buckets (next)
  - **Date:** 2024-11-16 ✅ COMPLETED

- [x] Implement Multi-Tenancy Foundation ✅ COMPLETED
  - [x] Create lib/auth/tenant.ts with utilities
  - [x] Update middleware.ts for tenant propagation
  - [x] Create lib/db/actions.ts with helper functions
  - [x] Implement withTenantContext() wrapper
  - [x] Create /dashboard demo page
  - **Date:** 2024-11-16 ✅ COMPLETED

- [ ] Configure development environment
  - [x] Setup .env.local ✅
  - [ ] Install ESLint + Prettier
  - [ ] Configure VSCode settings
  - [ ] Setup Git hooks (husky)
  - **Date:** Partial

### Database Schema
- [x] Create initial migration ✅
  - [ ] Tenants table
  - [ ] Users table
  - [ ] Matters table
  - [ ] Documents table
  - [ ] Document chunks table (with pgvector)
  - **Date:** TBD
  - **File:** `supabase/migrations/20241116000000_initial_schema.sql`

- [ ] Create RLS policies
  - [ ] Tenant isolation policies
  - [ ] User access policies
  - [ ] Matter access policies
  - [ ] Document access policies
  - **Date:** TBD
  - **File:** `supabase/migrations/20241116000001_rls_policies.sql`

- [ ] Create indexes
  - [ ] HNSW index dla embeddings
  - [ ] GIN index dla full-text search
  - [ ] Composite indexes dla queries
  - **Date:** TBD
  - **File:** `supabase/migrations/20241116000002_indexes.sql`

### Authentication
- [ ] Implement auth flow
  - [ ] Login page
  - [ ] Register page
  - [ ] Password reset
  - [ ] Email verification
  - **Date:** TBD

- [ ] Setup JWT custom claims
  - [ ] Add tenant_id to JWT
  - [ ] Add role to JWT
  - [ ] Create helper functions
  - **Date:** TBD

- [ ] Implement middleware
  - [ ] Auth middleware
  - [ ] Tenant propagation
  - [ ] Role-based access
  - **Date:** TBD

### UI Components (shadcn/ui)
- [ ] Install base components
  - [ ] Button
  - [ ] Input
  - [ ] Card
  - [ ] Dialog
  - [ ] Table
  - [ ] Badge
  - [ ] Avatar
  - [ ] Toast
  - **Date:** TBD

- [ ] Create layout components
  - [ ] Header
  - [ ] Sidebar
  - [ ] Footer
  - [ ] Breadcrumbs
  - **Date:** TBD

---

## Phase 2: Core Features (Week 3-4)

### Multi-Tenant Setup
- [ ] Implement tenant creation
  - [ ] Tenant registration flow
  - [ ] Stripe customer creation
  - [ ] Trial period setup
  - **Date:** TBD

- [ ] Tenant settings
  - [ ] Profile page
  - [ ] Team management
  - [ ] Billing page
  - **Date:** TBD

### Matter Management
- [ ] Create matter CRUD
  - [ ] Matter list page
  - [ ] Matter detail page
  - [ ] Create matter form
  - [ ] Edit matter form
  - [ ] Delete matter
  - **Date:** TBD

- [ ] Matter features
  - [ ] Matter filters
  - [ ] Matter search
  - [ ] Matter stats
  - [ ] Matter assignment
  - **Date:** TBD

### Document Management
- [ ] Implement document upload
  - [ ] File validation
  - [ ] Signed URL generation
  - [ ] Direct upload to Storage
  - [ ] Progress indicator
  - **Date:** TBD

- [ ] Document listing
  - [ ] Document list page
  - [ ] Document filters
  - [ ] Document preview
  - **Date:** TBD

### User Management
- [ ] User CRUD
  - [ ] User list
  - [ ] Invite user
  - [ ] Edit user
  - [ ] Deactivate user
  - **Date:** TBD

- [ ] Role management
  - [ ] Assign roles
  - [ ] Permission checks
  - [ ] RBAC implementation
  - **Date:** TBD

---

## Phase 3: AI Integration (Week 5-6)

### PDF Processing Pipeline
- [ ] Implement PDF worker
  - [ ] Download PDF from Storage
  - [ ] Text extraction (pdf-parse)
  - [ ] OCR fallback (Tesseract)
  - [ ] Metadata extraction
  - **Date:** TBD
  - **File:** `app/api/workers/process-document/route.ts`

- [ ] Implement chunking
  - [ ] Token-aware chunking (tiktoken)
  - [ ] 512 tokens per chunk
  - [ ] 128 token overlap
  - [ ] Preserve page boundaries
  - **Date:** TBD
  - **File:** `lib/pdf/chunker.ts`

- [ ] Implement embedding generation
  - [ ] OpenAI API integration
  - [ ] Batch processing
  - [ ] Error handling
  - [ ] Cost tracking
  - **Date:** TBD
  - **File:** `lib/openai/embeddings.ts`

- [ ] Database insertion
  - [ ] Bulk insert chunks
  - [ ] Update document status
  - [ ] Error handling
  - **Date:** TBD

### Vector Search
- [ ] Implement hybrid search
  - [ ] Vector search (pgvector)
  - [ ] Full-text search (pg_trgm)
  - [ ] Reciprocal Rank Fusion (RRF)
  - [ ] Tenant filtering
  - **Date:** TBD
  - **File:** `lib/rag/search.ts`

- [ ] Create search function
  - [ ] SQL function dla hybrid search
  - [ ] Test with sample data
  - [ ] Optimize performance
  - **Date:** TBD
  - **File:** `supabase/migrations/20241116000003_functions.sql`

### RAG Implementation
- [ ] Context building
  - [ ] Collect relevant chunks
  - [ ] Format dla LLM
  - [ ] Add matter context
  - [ ] Token limit handling
  - **Date:** TBD
  - **File:** `lib/rag/context.ts`

- [ ] LLM integration
  - [ ] OpenAI chat completion
  - [ ] Streaming support
  - [ ] Error handling
  - [ ] Cost tracking
  - **Date:** TBD
  - **File:** `lib/openai/chat.ts`

- [ ] RAG API endpoint
  - [ ] POST /api/rag/query
  - [ ] Authentication
  - [ ] Rate limiting
  - [ ] Response formatting
  - **Date:** TBD
  - **File:** `app/api/rag/query/route.ts`

### Chat Interface
- [ ] Create chat UI
  - [ ] Chat input
  - [ ] Message list
  - [ ] Source citations
  - [ ] Loading states
  - **Date:** TBD
  - **File:** `components/rag/ChatInterface.tsx`

- [ ] Implement streaming
  - [ ] Server-Sent Events (SSE)
  - [ ] Streaming response
  - [ ] Error handling
  - **Date:** TBD

---

## Phase 4: Legal Task Engine (Week 7-8)

### Task Management
- [ ] Create task CRUD
  - [ ] Task list page
  - [ ] Task detail page
  - [ ] Create task form
  - [ ] Task types
  - **Date:** TBD

- [ ] Task attachments
  - [ ] Link documents to tasks
  - [ ] View attachments
  - **Date:** TBD

### Context Collection
- [ ] Implement collectContextForTask
  - [ ] Fetch matter documents
  - [ ] Fetch legal knowledge base
  - [ ] Fetch firm templates
  - [ ] Fetch matter metadata
  - **Date:** TBD
  - **File:** `lib/tasks/context-collector.ts`

### Multi-Stage Generation
- [ ] Stage 1: Analysis (o1-mini)
  - [ ] Analyze documents
  - [ ] Extract key points
  - [ ] Identify legal issues
  - [ ] JSON output
  - **Date:** TBD

- [ ] Stage 2: Outline (GPT-4o)
  - [ ] Create document structure
  - [ ] Section headings
  - [ ] Key arguments
  - [ ] Markdown output
  - **Date:** TBD

- [ ] Stage 3: Generation (GPT-4o)
  - [ ] Full document generation
  - [ ] Legal language
  - [ ] Citations
  - [ ] Formatting
  - **Date:** TBD

### Task Execution
- [ ] Create task worker
  - [ ] QStash integration
  - [ ] Multi-stage execution
  - [ ] Error handling
  - [ ] Progress updates
  - **Date:** TBD
  - **File:** `app/api/workers/generate-task/route.ts`

- [ ] Task versioning
  - [ ] Save task runs
  - [ ] Version history
  - [ ] Iteration support
  - **Date:** TBD

### Task UI
- [ ] Task viewer
  - [ ] Display generated document
  - [ ] Show sources
  - [ ] Version selector
  - **Date:** TBD

- [ ] Iteration dialog
  - [ ] Request changes
  - [ ] Additional instructions
  - [ ] Re-generate
  - **Date:** TBD

---

## Phase 5: Billing & Polish (Week 9-10)

### Stripe Integration
- [ ] Setup Stripe
  - [ ] Create products
  - [ ] Create prices
  - [ ] Setup webhooks
  - **Date:** TBD

- [ ] Subscription flow
  - [ ] Checkout session
  - [ ] Customer portal
  - [ ] Subscription sync
  - **Date:** TBD

- [ ] Usage tracking
  - [ ] Track document uploads
  - [ ] Track RAG queries
  - [ ] Track task generations
  - [ ] Enforce limits
  - **Date:** TBD

### Email Notifications
- [ ] Setup SendGrid
  - [ ] Configure templates
  - [ ] Test emails
  - **Date:** TBD

- [ ] Notification triggers
  - [ ] Welcome email
  - [ ] Document processed
  - [ ] Task completed
  - [ ] Trial ending
  - [ ] Invoice paid
  - **Date:** TBD

### Audit Logging
- [ ] Implement audit log
  - [ ] Log all mutations
  - [ ] Capture user context
  - [ ] Store IP address
  - **Date:** TBD

- [ ] Audit log UI
  - [ ] View logs
  - [ ] Filter logs
  - [ ] Export logs
  - **Date:** TBD

### Polish
- [ ] Error handling
  - [ ] Global error boundary
  - [ ] API error responses
  - [ ] User-friendly messages
  - **Date:** TBD

- [ ] Loading states
  - [ ] Skeleton loaders
  - [ ] Progress indicators
  - [ ] Optimistic updates
  - **Date:** TBD

- [ ] Responsive design
  - [ ] Mobile layout
  - [ ] Tablet layout
  - [ ] Desktop layout
  - **Date:** TBD

---

## Phase 6: Testing & Launch (Week 11-12)

### Testing
- [ ] Unit tests
  - [ ] RAG functions
  - [ ] PDF processing
  - [ ] Task engine
  - [ ] Utilities
  - **Date:** TBD

- [ ] Integration tests
  - [ ] API endpoints
  - [ ] Database queries
  - [ ] RLS policies
  - **Date:** TBD

- [ ] E2E tests
  - [ ] Auth flow
  - [ ] Matter management
  - [ ] Document upload
  - [ ] RAG queries
  - [ ] Task generation
  - **Date:** TBD

### Performance Optimization
- [ ] Database optimization
  - [ ] Query optimization
  - [ ] Index tuning
  - [ ] Connection pooling
  - **Date:** TBD

- [ ] Frontend optimization
  - [ ] Code splitting
  - [ ] Image optimization
  - [ ] Bundle analysis
  - **Date:** TBD

- [ ] Caching
  - [ ] API response caching
  - [ ] Embedding caching
  - [ ] Static asset caching
  - **Date:** TBD

### Security Audit
- [ ] Run security checklist
  - [ ] HTTPS everywhere
  - [ ] RLS enabled
  - [ ] Input validation
  - [ ] Rate limiting
  - **Date:** TBD

- [ ] Penetration testing
  - [ ] SQL injection
  - [ ] XSS
  - [ ] CSRF
  - [ ] Data leakage
  - **Date:** TBD

### Documentation
- [ ] API documentation
  - [ ] Endpoint descriptions
  - [ ] Request/response examples
  - [ ] Error codes
  - **Date:** TBD

- [ ] User documentation
  - [ ] Getting started guide
  - [ ] Feature tutorials
  - [ ] FAQ
  - **Date:** TBD

- [ ] Developer documentation
  - [ ] Setup guide
  - [ ] Architecture overview
  - [ ] Contributing guide
  - **Date:** TBD

### Deployment
- [ ] Setup CI/CD
  - [ ] GitHub Actions
  - [ ] Preview deployments
  - [ ] Production deployments
  - **Date:** TBD

- [ ] Configure monitoring
  - [ ] Sentry error tracking
  - [ ] Vercel analytics
  - [ ] Supabase monitoring
  - **Date:** TBD

- [ ] Launch checklist
  - [ ] Domain setup
  - [ ] SSL certificate
  - [ ] Environment variables
  - [ ] Database backups
  - **Date:** TBD

### Beta Launch
- [ ] Invite beta users
  - [ ] 5-10 law firms
  - [ ] Onboarding calls
  - [ ] Feedback collection
  - **Date:** TBD

- [ ] Monitor & iterate
  - [ ] Track usage
  - [ ] Fix bugs
  - [ ] Implement feedback
  - **Date:** TBD

---

## Discovered During Work

_(Tasks discovered during development will be added here)_

---

## Completed Tasks

_(Completed tasks will be moved here with completion dates)_

---

**Last Updated:** 2024-11-16  
**Next Review:** After Phase 1 completion
