# Vercel Templates Analysis & Cherry-Pick Strategy

**Date:** 2024-11-16  
**Decision:** Start from scratch, cherry-pick specific implementations

---

## 🎯 Final Decision: NO Full Template Usage

### Why NOT use templates as base?

1. **Technology Conflicts:**
   - Vercel AI SDK template → Uses Drizzle ORM (we need Supabase)
   - Stripe template → Uses Vercel Postgres (we need Supabase)
   - SaaS Boilerplate → Uses Clerk Auth (we need Supabase Auth)

2. **Over-engineering Risk:**
   - Merging 3-4 templates = immediate tech debt
   - Conflicting opinions and patterns
   - Difficult debugging of unfamiliar code

3. **We Have Better Architecture:**
   - Our `schema.sql` is more comprehensive
   - Our RLS policies are production-ready
   - Our folder structure is optimized for legal-tech

---

## 📦 Cherry-Pick Strategy

### Template 1: Supabase RAG Template ⭐⭐⭐⭐⭐
**Repo:** `github.com/supabase-community/nextjs-openai-doc-search`

**What to Copy:**
```typescript
// PDF Processing
lib/pdf/
  ├── parser.ts          // pdf-parse implementation
  ├── chunker.ts         // Token-aware chunking (tiktoken)
  └── embeddings.ts      // Batch embedding generation

// Vector Search
lib/rag/
  └── hybrid-search.ts   // RRF (Reciprocal Rank Fusion)

// SQL Functions
supabase/functions/
  └── hybrid-search.sql  // Vector + FTS combination
```

**Adaptation Required:**
- Add tenant_id filtering to all queries
- Update to use our RLS policies
- Modernize to Next.js 15 App Router

---

### Template 2: Vercel AI SDK Template ⭐⭐⭐⭐
**Repo:** `vercel.com/templates/next.js/ai-sdk-rag`

**What to Copy:**
```typescript
// Streaming Chat
app/api/chat/route.ts:
import { streamText } from 'ai';

export async function POST(req: Request) {
  const result = await streamText({
    model: openai('gpt-4o'),
    messages,
    system: systemPrompt,
  });
  
  return result.toDataStreamResponse();
}

// Client Hook
components/chat/ChatInterface.tsx:
import { useChat } from 'ai/react';

export function ChatInterface() {
  const { messages, input, handleSubmit, isLoading } = useChat({
    api: '/api/chat',
  });
}
```

**Adaptation Required:**
- Add RAG context injection
- Add tenant_id to requests
- Integrate with our Matter context

---

### Template 3: shadcn SaaS Boilerplate ⭐⭐⭐⭐⭐
**Repo:** `github.com/ixartz/SaaS-Boilerplate`

**What to Copy:**
```typescript
// Multi-tenant Middleware
middleware.ts:
export async function middleware(req: NextRequest) {
  const tenantId = await getTenantFromRequest(req);
  req.headers.set('x-tenant-id', tenantId);
  return NextResponse.next();
}

// Dashboard Layout
app/(dashboard)/layout.tsx:
<div className="flex h-screen">
  <Sidebar />
  <main className="flex-1 overflow-y-auto p-8">
    {children}
  </main>
</div>

// UI Components
components/
  ├── layout/
  │   ├── Sidebar.tsx        // Navigation
  │   ├── Header.tsx         // Top bar
  │   └── UserMenu.tsx       // User dropdown
  └── teams/
      ├── TeamSwitcher.tsx   // Tenant switcher
      └── MemberList.tsx     // Team management
```

**Adaptation Required:**
- Replace Clerk → Supabase Auth
- Add our role-based permissions
- Integrate with our `users` table schema

---

### Template 4: Stripe Subscription Template ⭐⭐⭐⭐
**Repo:** `vercel.com/templates/next.js/subscription-starter`

**What to Copy:**
```typescript
// Webhook Handler
app/api/webhooks/stripe/route.ts:
export async function POST(req: Request) {
  const sig = req.headers.get('stripe-signature');
  const event = stripe.webhooks.constructEvent(body, sig, secret);
  
  switch (event.type) {
    case 'customer.subscription.updated':
      await syncSubscription(event.data.object);
      break;
    case 'invoice.payment_succeeded':
      await handlePaymentSuccess(event.data.object);
      break;
  }
}

// Checkout Flow
lib/stripe/checkout.ts:
export async function createCheckoutSession(tenantId: string, priceId: string) {
  const session = await stripe.checkout.sessions.create({
    customer: tenant.stripe_customer_id,
    line_items: [{ price: priceId, quantity: 1 }],
    mode: 'subscription',
    success_url: `${APP_URL}/dashboard?success=true`,
    cancel_url: `${APP_URL}/settings/billing`,
  });
  
  return session;
}
```

**Adaptation Required:**
- Add multi-tenant subscription logic
- Sync with our `tenants` table
- Add usage-based billing tracking

---

## 🛠️ Implementation Plan

### Phase 1: Project Initialization (Day 1)

```bash
# 1. Create Next.js project
pnpm create next-app@latest prawnik-ai \
  --typescript \
  --tailwind \
  --app \
  --src-dir=false \
  --import-alias="@/*"

# 2. Install core dependencies
pnpm add @supabase/supabase-js @supabase/auth-helpers-nextjs
pnpm add ai openai
pnpm add stripe @stripe/stripe-js
pnpm add zod react-hook-form @hookform/resolvers
pnpm add pdf-parse tiktoken
pnpm add @upstash/qstash

# 3. Install dev dependencies
pnpm add -D @types/pdf-parse
pnpm add -D eslint-config-prettier prettier
pnpm add -D husky lint-staged

# 4. Setup shadcn/ui
pnpm dlx shadcn-ui@latest init
pnpm dlx shadcn-ui@latest add button input card dialog table badge avatar toast dropdown-menu
```

### Phase 2: Clone Templates for Reference (Day 1)

```bash
# Create reference directory
mkdir -p _reference

# Clone templates
cd _reference
git clone https://github.com/supabase-community/nextjs-openai-doc-search.git supabase-rag
git clone https://github.com/ixartz/SaaS-Boilerplate.git saas-boilerplate
git clone https://github.com/vercel/next.js.git vercel-examples

# Note: These are for REFERENCE ONLY, not to be merged
```

### Phase 3: Cherry-Pick Files (Day 2-3)

**Priority 1: Core Infrastructure**
1. Copy and adapt Supabase client setup
2. Copy and adapt middleware for tenant propagation
3. Copy and adapt auth helpers

**Priority 2: PDF Processing**
1. Copy PDF parser logic
2. Copy chunking algorithm
3. Adapt to our schema

**Priority 3: UI Components**
1. Copy dashboard layout
2. Copy sidebar component
3. Adapt to our navigation structure

**Priority 4: AI Integration**
1. Copy Vercel AI SDK streaming setup
2. Adapt to our RAG context
3. Add tenant filtering

---

## 📋 Files to Cherry-Pick

### Must-Have (Week 1):

| Source | Destination | Adaptation |
|--------|-------------|------------|
| `supabase-rag/lib/pdf-parser.ts` | `lib/pdf/parser.ts` | Add error handling |
| `supabase-rag/lib/chunking.ts` | `lib/pdf/chunker.ts` | Add page boundary preservation |
| `ai-sdk-template/app/api/chat/route.ts` | `app/api/rag/chat/route.ts` | Add RAG context |
| `saas-boilerplate/middleware.ts` | `middleware.ts` | Replace Clerk → Supabase |
| `saas-boilerplate/components/Sidebar.tsx` | `components/layout/Sidebar.tsx` | Update navigation |

### Nice-to-Have (Week 2+):

| Source | Destination | Adaptation |
|--------|-------------|------------|
| `stripe-template/webhooks/stripe.ts` | `app/api/webhooks/stripe/route.ts` | Add tenant sync |
| `saas-boilerplate/components/TeamSwitcher.tsx` | `components/layout/TenantSwitcher.tsx` | Update for our schema |
| `saas-boilerplate/app/(landing)/page.tsx` | `app/page.tsx` | Rebrand for Prawnik AI |

---

## ⚠️ What NOT to Copy

- ❌ Database schemas (we have better `schema.sql`)
- ❌ Auth implementation (using Supabase Auth directly)
- ❌ ORM layers (using Supabase client)
- ❌ Migration systems (using Supabase migrations)
- ❌ Environment config (we have our own)

---

## 🎓 Key Learnings

1. **Templates are references, not foundations**
   - Use for implementation patterns
   - Don't merge entire codebases
   - Adapt to our architecture

2. **Supabase-first approach is correct**
   - Most templates use different stacks
   - Our schema is more comprehensive
   - RLS policies are production-ready

3. **Cherry-picking > Full template**
   - Avoid tech debt from day 1
   - Keep codebase clean and understandable
   - Easier to maintain and debug

---

**Last Updated:** 2024-11-16  
**Next Review:** After Phase 1 completion
