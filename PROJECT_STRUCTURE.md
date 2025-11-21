# Project Structure - Prawnik AI

## Complete Folder Structure

```
prawnik-ai/
├── .github/
│   └── workflows/
│       ├── ci.yml                    # CI pipeline
│       ├── deploy-preview.yml        # Preview deployments
│       └── deploy-production.yml     # Production deployments
│
├── .vscode/
│   ├── settings.json                 # VSCode settings
│   ├── extensions.json               # Recommended extensions
│   └── launch.json                   # Debug configurations
│
├── app/                              # Next.js 15 App Router
│   ├── (auth)/                       # Auth layout group
│   │   ├── login/
│   │   │   └── page.tsx
│   │   ├── register/
│   │   │   └── page.tsx
│   │   ├── forgot-password/
│   │   │   └── page.tsx
│   │   └── layout.tsx
│   │
│   ├── (dashboard)/                  # Dashboard layout group
│   │   ├── dashboard/
│   │   │   └── page.tsx              # Main dashboard
│   │   │
│   │   ├── matters/
│   │   │   ├── page.tsx              # Matters list
│   │   │   ├── [id]/
│   │   │   │   ├── page.tsx          # Matter detail
│   │   │   │   ├── documents/
│   │   │   │   │   └── page.tsx      # Documents tab
│   │   │   │   ├── tasks/
│   │   │   │   │   └── page.tsx      # Tasks tab
│   │   │   │   └── chat/
│   │   │   │       └── page.tsx      # RAG chat tab
│   │   │   └── new/
│   │   │       └── page.tsx          # Create matter
│   │   │
│   │   ├── documents/
│   │   │   ├── page.tsx              # All documents
│   │   │   └── [id]/
│   │   │       └── page.tsx          # Document viewer
│   │   │
│   │   ├── tasks/
│   │   │   ├── page.tsx              # All tasks
│   │   │   ├── [id]/
│   │   │   │   └── page.tsx          # Task detail
│   │   │   └── new/
│   │   │       └── page.tsx          # Create task
│   │   │
│   │   ├── settings/
│   │   │   ├── page.tsx              # Settings redirect
│   │   │   ├── profile/
│   │   │   │   └── page.tsx
│   │   │   ├── team/
│   │   │   │   └── page.tsx
│   │   │   ├── billing/
│   │   │   │   └── page.tsx
│   │   │   └── security/
│   │   │       └── page.tsx
│   │   │
│   │   └── layout.tsx                # Dashboard layout
│   │
│   ├── api/                          # API Routes
│   │   ├── auth/
│   │   │   ├── callback/
│   │   │   │   └── route.ts          # OAuth callback
│   │   │   └── signout/
│   │   │       └── route.ts
│   │   │
│   │   ├── matters/
│   │   │   ├── route.ts              # GET, POST
│   │   │   └── [id]/
│   │   │       ├── route.ts          # GET, PATCH, DELETE
│   │   │       └── documents/
│   │   │           └── route.ts      # GET documents dla matter
│   │   │
│   │   ├── documents/
│   │   │   ├── route.ts              # GET, POST
│   │   │   ├── [id]/
│   │   │   │   └── route.ts          # GET, DELETE
│   │   │   └── upload-url/
│   │   │       └── route.ts          # Generate signed URL
│   │   │
│   │   ├── rag/
│   │   │   ├── query/
│   │   │   │   └── route.ts          # POST - RAG query
│   │   │   └── chat/
│   │   │       └── route.ts          # POST - Streaming chat
│   │   │
│   │   ├── tasks/
│   │   │   ├── route.ts              # GET, POST
│   │   │   ├── [id]/
│   │   │   │   ├── route.ts          # GET, PATCH
│   │   │   │   └── run/
│   │   │   │       └── route.ts      # POST - Execute task
│   │   │   └── [id]/runs/
│   │   │       └── route.ts          # GET task runs
│   │   │
│   │   ├── webhooks/
│   │   │   ├── stripe/
│   │   │   │   └── route.ts          # Stripe webhooks
│   │   │   └── supabase/
│   │   │       └── route.ts          # Supabase webhooks
│   │   │
│   │   └── workers/
│   │       ├── process-document/
│   │       │   └── route.ts          # QStash worker
│   │       └── generate-task/
│   │           └── route.ts          # QStash worker
│   │
│   ├── layout.tsx                    # Root layout
│   ├── page.tsx                      # Landing page
│   ├── error.tsx                     # Error boundary
│   ├── not-found.tsx                 # 404 page
│   └── global.css                    # Global styles
│
├── components/                       # React components
│   ├── ui/                           # shadcn/ui components
│   │   ├── button.tsx
│   │   ├── input.tsx
│   │   ├── dialog.tsx
│   │   ├── dropdown-menu.tsx
│   │   ├── table.tsx
│   │   ├── card.tsx
│   │   ├── badge.tsx
│   │   ├── avatar.tsx
│   │   ├── toast.tsx
│   │   └── ...
│   │
│   ├── matters/
│   │   ├── MatterCard.tsx
│   │   ├── MatterList.tsx
│   │   ├── MatterForm.tsx
│   │   ├── MatterFilters.tsx
│   │   └── MatterStats.tsx
│   │
│   ├── documents/
│   │   ├── DocumentCard.tsx
│   │   ├── DocumentList.tsx
│   │   ├── DocumentUpload.tsx
│   │   ├── DocumentViewer.tsx
│   │   └── DocumentPreview.tsx
│   │
│   ├── tasks/
│   │   ├── TaskCard.tsx
│   │   ├── TaskList.tsx
│   │   ├── TaskForm.tsx
│   │   ├── TaskRunViewer.tsx
│   │   └── TaskIterationDialog.tsx
│   │
│   ├── rag/
│   │   ├── ChatInterface.tsx
│   │   ├── ChatMessage.tsx
│   │   ├── ChatInput.tsx
│   │   ├── SourceCard.tsx
│   │   └── SourceList.tsx
│   │
│   ├── layout/
│   │   ├── Header.tsx
│   │   ├── Sidebar.tsx
│   │   ├── Footer.tsx
│   │   ├── Breadcrumbs.tsx
│   │   └── UserMenu.tsx
│   │
│   └── shared/
│       ├── LoadingSpinner.tsx
│       ├── EmptyState.tsx
│       ├── ErrorBoundary.tsx
│       ├── Pagination.tsx
│       └── SearchInput.tsx
│
├── lib/                              # Utility libraries
│   ├── supabase/
│   │   ├── client.ts                 # Browser client
│   │   ├── server.ts                 # Server client
│   │   ├── middleware.ts             # Auth middleware
│   │   └── types.ts                  # Generated types
│   │
│   ├── openai/
│   │   ├── client.ts                 # OpenAI client
│   │   ├── embeddings.ts             # Embedding functions
│   │   ├── chat.ts                   # Chat functions
│   │   └── streaming.ts              # Streaming helpers
│   │
│   ├── rag/
│   │   ├── search.ts                 # Hybrid search
│   │   ├── context.ts                # Context building
│   │   ├── prompt.ts                 # Prompt templates
│   │   └── citations.ts              # Citation extraction
│   │
│   ├── pdf/
│   │   ├── parser.ts                 # PDF parsing
│   │   ├── chunker.ts                # Text chunking
│   │   ├── validator.ts              # File validation
│   │   └── metadata.ts               # Metadata extraction
│   │
│   ├── tasks/
│   │   ├── engine.ts                 # Task engine
│   │   ├── context-collector.ts     # Context collection
│   │   ├── generators.ts             # Document generators
│   │   └── templates.ts              # Task templates
│   │
│   ├── stripe/
│   │   ├── client.ts                 # Stripe client
│   │   ├── webhooks.ts               # Webhook handlers
│   │   └── subscriptions.ts          # Subscription logic
│   │
│   ├── qstash/
│   │   ├── client.ts                 # QStash client
│   │   ├── enqueue.ts                # Enqueue jobs
│   │   └── verify.ts                 # Signature verification
│   │
│   ├── auth/
│   │   ├── session.ts                # Session management
│   │   ├── permissions.ts            # Permission checks
│   │   └── rbac.ts                   # Role-based access
│   │
│   ├── db/
│   │   ├── queries.ts                # Common queries
│   │   ├── mutations.ts              # Common mutations
│   │   └── helpers.ts                # DB helpers
│   │
│   ├── validations/
│   │   ├── matter.ts                 # Matter schemas
│   │   ├── document.ts               # Document schemas
│   │   ├── task.ts                   # Task schemas
│   │   └── user.ts                   # User schemas
│   │
│   └── utils/
│       ├── format.ts                 # Formatting helpers
│       ├── date.ts                   # Date helpers
│       ├── string.ts                 # String helpers
│       ├── file.ts                   # File helpers
│       └── cn.ts                     # Tailwind merge
│
├── hooks/                            # React hooks
│   ├── use-matters.ts
│   ├── use-documents.ts
│   ├── use-tasks.ts
│   ├── use-rag.ts
│   ├── use-user.ts
│   ├── use-tenant.ts
│   ├── use-toast.ts
│   └── use-debounce.ts
│
├── types/                            # TypeScript types
│   ├── database.ts                   # Supabase generated
│   ├── api.ts                        # API types
│   ├── matter.ts
│   ├── document.ts
│   ├── task.ts
│   ├── user.ts
│   └── index.ts
│
├── config/                           # Configuration
│   ├── site.ts                       # Site config
│   ├── nav.ts                        # Navigation config
│   ├── plans.ts                      # Subscription plans
│   └── constants.ts                  # App constants
│
├── supabase/                         # Supabase files
│   ├── migrations/
│   │   ├── 20241116000000_initial_schema.sql
│   │   ├── 20241116000001_rls_policies.sql
│   │   ├── 20241116000002_indexes.sql
│   │   ├── 20241116000003_functions.sql
│   │   └── 20241116000004_triggers.sql
│   │
│   ├── functions/                    # Edge Functions
│   │   └── _shared/
│   │       └── cors.ts
│   │
│   ├── seed.sql                      # Seed data
│   └── config.toml                   # Supabase config
│
├── public/                           # Static files
│   ├── images/
│   ├── fonts/
│   └── favicon.ico
│
├── tests/                            # Tests
│   ├── e2e/
│   │   ├── auth.spec.ts
│   │   ├── matters.spec.ts
│   │   ├── documents.spec.ts
│   │   ├── tasks.spec.ts
│   │   └── rag.spec.ts
│   │
│   ├── integration/
│   │   ├── api/
│   │   │   ├── matters.test.ts
│   │   │   ├── documents.test.ts
│   │   │   └── tasks.test.ts
│   │   └── db/
│   │       └── rls.test.ts
│   │
│   └── unit/
│       ├── lib/
│       │   ├── rag.test.ts
│       │   ├── pdf.test.ts
│       │   └── tasks.test.ts
│       └── utils/
│           └── format.test.ts
│
├── scripts/                          # Utility scripts
│   ├── generate-types.ts             # Generate Supabase types
│   ├── seed-db.ts                    # Seed database
│   ├── migrate.ts                    # Run migrations
│   └── check-env.ts                  # Validate env vars
│
├── docs/                             # Documentation
│   ├── PLANNING.md                   # ✅ Created
│   ├── ARCHITECTURE.md               # ✅ Created
│   ├── DATABASE.md                   # ✅ Created
│   ├── SECURITY.md                   # ✅ Created
│   ├── API.md                        # API documentation
│   ├── DEPLOYMENT.md                 # Deployment guide
│   └── CONTRIBUTING.md               # Contribution guide
│
├── .env.local.example                # Example env vars
├── .env.local                        # Local env vars (gitignored)
├── .eslintrc.json                    # ESLint config
├── .prettierrc                       # Prettier config
├── .gitignore
├── next.config.js                    # Next.js config
├── tailwind.config.ts                # Tailwind config
├── tsconfig.json                     # TypeScript config
├── package.json
├── pnpm-lock.yaml
├── vitest.config.ts                  # Vitest config
├── playwright.config.ts              # Playwright config
└── README.md
```

---

## Key Architectural Decisions

### 1. App Router Structure

**Route Groups:**
- `(auth)` - Public authentication pages
- `(dashboard)` - Protected dashboard pages

**Benefits:**
- Clean URL structure
- Shared layouts
- Easy to add new route groups (e.g., `(admin)`, `(public)`)

### 2. Component Organization

**Principles:**
- `ui/` - Generic, reusable UI components (shadcn/ui)
- `{feature}/` - Feature-specific components
- `layout/` - Layout components
- `shared/` - Shared utility components

**Naming:**
- PascalCase dla components
- Descriptive names (e.g., `MatterCard`, not `Card`)

### 3. Library Organization

**Principles:**
- One folder per service (e.g., `supabase/`, `openai/`)
- Separate client/server code
- Reusable functions

**Example:**
```typescript
// lib/supabase/client.ts - Browser client
export const supabase = createBrowserClient(...)

// lib/supabase/server.ts - Server client
export const createServerClient = () => createServerSupabaseClient(...)
```

### 4. Type Safety

**Strategy:**
- Generate types from Supabase schema
- Zod schemas dla validation
- Strict TypeScript mode

**Example:**
```typescript
// types/database.ts (generated)
export type Database = { ... }

// lib/validations/matter.ts
export const matterSchema = z.object({
  title: z.string().min(1).max(255),
  matter_type: z.enum(['civil', 'criminal', 'administrative', 'other']),
  ...
});
```

### 5. API Design

**Principles:**
- RESTful routes
- Consistent response format
- Error handling
- Rate limiting

**Example:**
```typescript
// app/api/matters/route.ts
export async function GET(req: Request) {
  try {
    const { data, error } = await supabase
      .from('matters')
      .select('*');
    
    if (error) throw error;
    
    return Response.json({ data });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}
```

---

## File Naming Conventions

### Components
```
PascalCase.tsx
Examples: MatterCard.tsx, DocumentUpload.tsx
```

### Utilities
```
camelCase.ts
Examples: formatDate.ts, parseQuery.ts
```

### API Routes
```
kebab-case/route.ts
Examples: api/matters/route.ts, api/upload-url/route.ts
```

### Database
```
snake_case
Examples: matter_documents, document_chunks
```

### Tests
```
{name}.test.ts (unit)
{name}.spec.ts (e2e)
Examples: rag.test.ts, auth.spec.ts
```

---

## Import Aliases

```typescript
// tsconfig.json
{
  "compilerOptions": {
    "paths": {
      "@/*": ["./*"],
      "@/components/*": ["./components/*"],
      "@/lib/*": ["./lib/*"],
      "@/hooks/*": ["./hooks/*"],
      "@/types/*": ["./types/*"],
      "@/config/*": ["./config/*"]
    }
  }
}
```

**Usage:**
```typescript
// ✅ Good
import { Button } from '@/components/ui/button';
import { supabase } from '@/lib/supabase/client';
import { useMatter } from '@/hooks/use-matters';

// ❌ Bad
import { Button } from '../../../components/ui/button';
```

---

## Code Organization Best Practices

### 1. Component Structure

```typescript
// 1. Imports (grouped)
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { formatDate } from '@/lib/utils/date';

// 2. Types
interface MatterCardProps {
  matter: Matter;
  onEdit?: (id: string) => void;
}

// 3. Component
export function MatterCard({ matter, onEdit }: MatterCardProps) {
  // 4. Hooks
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  
  // 5. Handlers
  const handleClick = () => {
    router.push(`/matters/${matter.id}`);
  };
  
  // 6. Render
  return (
    <div>...</div>
  );
}
```

### 2. API Route Structure

```typescript
// 1. Imports
import { NextRequest } from 'next/server';
import { createServerClient } from '@/lib/supabase/server';
import { matterSchema } from '@/lib/validations/matter';

// 2. Types
interface Context {
  params: { id: string };
}

// 3. Handlers
export async function GET(req: NextRequest, { params }: Context) {
  // Auth
  const supabase = createServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });
  
  // Logic
  const { data, error } = await supabase
    .from('matters')
    .select('*')
    .eq('id', params.id)
    .single();
  
  // Response
  if (error) return Response.json({ error: error.message }, { status: 500 });
  return Response.json({ data });
}
```

### 3. Utility Function Structure

```typescript
// 1. Imports
import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

// 2. Types
type FormatDateOptions = {
  locale?: string;
  format?: 'short' | 'long';
};

// 3. Function
export function formatDate(date: Date, options?: FormatDateOptions): string {
  const { locale = 'pl-PL', format = 'short' } = options || {};
  
  return new Intl.DateTimeFormat(locale, {
    dateStyle: format,
  }).format(date);
}

// 4. Exports
export { cn } from './cn';
```

---

**Last Updated:** 2024-11-16
