# Day 4-5: Dashboard Layout & Matter Management - Implementation Brief

## 📋 Context Summary

**Project:** Prawnik AI - Multi-tenant SaaS dla kancelarii prawnych  
**Current Status:** Day 3 completed  
**Location:** `/Users/michal/.codeium/windsurf/Projects/Development/Prawnik AI/app-code/`  
**Next Phase:** Days 4-5 - Dashboard Layout & Matter Management

---

## ✅ What's Been Completed (Days 1-3)

### Day 1: Project Bootstrap
- ✅ Next.js 15 + Supabase template initialized
- ✅ All dependencies installed (ai, openai, stripe, pdf-parse, tiktoken, etc.)
- ✅ Dev server running on localhost:3000
- ✅ Vercel CLI updated (v48.10.2)

### Day 2: Supabase Setup
- ✅ Supabase project created (ID: tskfjodbbnaozfmctjne)
- ✅ Supabase CLI installed and linked
- ✅ Extensions enabled: vector (v0.8.0), uuid-ossp, pgcrypto, pg_trgm
- ✅ Complete schema migrated (9 tables)
- ✅ RLS policies active
- ✅ Connection verified at /test-connection

### Day 3: Multi-Tenancy Foundation
- ✅ `lib/auth/tenant.ts` - Tenant utilities created
- ✅ `lib/supabase/middleware.ts` - Tenant propagation implemented
- ✅ `lib/db/actions.ts` - Helper functions with RLS
- ✅ `/dashboard` demo page created
- ✅ Cookie-based tenant_id propagation working

---

## 🎯 Your Task: Days 4-5 Implementation

### Phase Overview
Implement a **production-ready dashboard layout** with **Matter Management** features, cherry-picking from shadcn SaaS Boilerplate and following our architecture.

---

## 📁 Files to Create

### 1. Layout Components (`components/layout/`)

#### `components/layout/app-sidebar.tsx`
**Purpose:** Main navigation sidebar  
**Features:**
- Logo and tenant switcher (future)
- Navigation menu with icons (Dashboard, Matters, Documents, Tasks)
- User menu at bottom
- Collapsible on mobile
- Active route highlighting

**Cherry-pick from:** shadcn SaaS Boilerplate sidebar  
**UI Components:** Use shadcn/ui `Sheet`, `Button`, `ScrollArea`

#### `components/layout/header.tsx`
**Purpose:** Top header bar  
**Features:**
- Breadcrumbs
- Search bar (global)
- Notifications icon
- Theme switcher
- User avatar dropdown

**Cherry-pick from:** shadcn Boilerplate header  
**UI Components:** `DropdownMenu`, `Avatar`, `Input`

#### `components/layout/dashboard-layout.tsx`
**Purpose:** Wrapper layout for all app pages  
**Structure:**
```tsx
<div className="flex min-h-screen">
  <AppSidebar />
  <main className="flex-1">
    <Header />
    <div className="container py-6">
      {children}
    </div>
  </main>
</div>
```

---

### 2. Matter Management (`app/(dashboard)/matters/`)

#### `app/(dashboard)/matters/page.tsx`
**Purpose:** List all matters for current tenant  
**Features:**
- Data table with sorting/filtering
- Columns: Title, Client, Status, Assigned To, Created Date
- Search bar
- "New Matter" button
- Status badges (active/pending/closed/archived)
- Quick actions (view, edit, delete)

**Data Source:** Use `getMatters()` from `lib/db/actions.ts`  
**UI Components:** `DataTable`, `Badge`, `Button`, `Input`

#### `app/(dashboard)/matters/[id]/page.tsx`
**Purpose:** Matter detail page  
**Features:**
- Matter header with client info
- Tabs: Overview, Documents, Tasks, Activity
- Edit mode toggle
- Document upload section
- Task creation section

**Data Source:** `getMatter(id)` from `lib/db/actions.ts`  
**UI Components:** `Tabs`, `Card`, `Form`

#### `app/(dashboard)/matters/new/page.tsx`
**Purpose:** Create new matter form  
**Features:**
- Form with validation (react-hook-form + zod)
- Fields: Title, Description, Client Name/Email/Phone, Matter Type, Status
- Assign to user dropdown
- Cancel/Save buttons

**Action:** Use `createMatter()` from `lib/db/actions.ts`  
**UI Components:** `Form`, `Input`, `Textarea`, `Select`, `Button`

#### `components/matters/matter-card.tsx`
**Purpose:** Reusable matter display card  
**Features:**
- Client name and matter title
- Status badge
- Assigned user avatar
- Quick actions menu
- Last updated timestamp

---

### 3. Shared Components (`components/ui/`)

All shadcn/ui components needed:
- `data-table` - For matter list
- `badge` - For status displays
- `card` - For content sections
- `form` - Form wrapper
- `input` - Text inputs
- `textarea` - Multi-line inputs
- `select` - Dropdowns
- `tabs` - Tab navigation
- `avatar` - User avatars
- `dropdown-menu` - Action menus
- `sheet` - Mobile sidebar
- `breadcrumb` - Navigation trail
- `dialog` - Modals

**Install command:**
```bash
npx shadcn@latest add data-table badge card form input textarea select tabs avatar dropdown-menu sheet breadcrumb dialog
```

---

### 4. Form Schemas (`lib/schemas/`)

#### `lib/schemas/matter.ts`
```typescript
import { z } from 'zod'

export const createMatterSchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters'),
  description: z.string().optional(),
  client_name: z.string().min(2, 'Client name is required'),
  client_email: z.string().email().optional().or(z.literal('')),
  client_phone: z.string().optional(),
  matter_type: z.string().optional(),
  status: z.enum(['active', 'pending', 'closed', 'archived']).default('active'),
  assigned_to: z.string().uuid().optional(),
})

export type CreateMatterInput = z.infer<typeof createMatterSchema>
```

---

## 🎨 Design Guidelines

### Color Scheme
- Primary: Keep default (blue)
- Success: Green (#22c55e)
- Warning: Yellow (#eab308)
- Error: Red (#ef4444)
- Muted: Gray (#71717a)

### Status Colors
```typescript
const statusColors = {
  active: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
  pending: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300',
  closed: 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300',
  archived: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300',
}
```

### Typography
- Headings: Font Geist Sans (already configured)
- Body: Default system font
- Code/Mono: Geist Mono

### Spacing
- Page padding: `py-6`
- Card padding: `p-6`
- Section gaps: `space-y-6`

---

## 🔒 Security Requirements

### All forms must:
1. Validate on client (zod)
2. Validate on server (zod)
3. Use Server Actions (`use server`)
4. Call `withTenantContext()` wrapper
5. Handle errors gracefully

### Example Server Action:
```typescript
'use server'

import { createMatter } from '@/lib/db/actions'
import { createMatterSchema } from '@/lib/schemas/matter'
import { revalidatePath } from 'next/cache'

export async function createMatterAction(formData: FormData) {
  const parsed = createMatterSchema.safeParse({
    title: formData.get('title'),
    client_name: formData.get('client_name'),
    // ...
  })

  if (!parsed.success) {
    return { error: parsed.error.flatten().fieldErrors }
  }

  try {
    const matter = await createMatter(parsed.data)
    revalidatePath('/matters')
    return { success: true, matter }
  } catch (error) {
    return { error: 'Failed to create matter' }
  }
}
```

---

## 📊 Data Flow

### Matter List Page:
```
Page (RSC) 
  → getMatters() 
  → withTenantContext() 
  → Supabase query 
  → RLS filters by tenant_id 
  → Return data
```

### Create Matter:
```
Form submit 
  → createMatterAction() 
  → validate 
  → createMatter() 
  → withTenantContext() 
  → setTenantContext() 
  → Supabase insert 
  → revalidatePath() 
  → redirect
```

---

## 🧪 Testing Checklist

After implementation, verify:

- [ ] Dashboard layout renders
- [ ] Sidebar navigation works
- [ ] Matter list displays (empty state & with data)
- [ ] Matter creation form validates
- [ ] Matter creation saves to DB
- [ ] Matter detail page shows correct data
- [ ] RLS policies prevent cross-tenant access
- [ ] Mobile responsive design works
- [ ] Dark mode works
- [ ] Loading states show during async operations
- [ ] Error states display user-friendly messages

---

## 📝 Implementation Order

### Day 4 (Priority Order):

1. **Install shadcn/ui components**
   ```bash
   npx shadcn@latest add badge card form input textarea select button
   ```

2. **Create layout components**
   - `components/layout/app-sidebar.tsx`
   - `components/layout/header.tsx`
   - `components/layout/dashboard-layout.tsx`

3. **Update app structure**
   - Create `app/(dashboard)/layout.tsx` using `<DashboardLayout>`
   - Move existing `/dashboard/page.tsx` to `app/(dashboard)/dashboard/page.tsx`

4. **Matter list page**
   - `app/(dashboard)/matters/page.tsx`
   - Display matters from `getMatters()`

### Day 5 (Priority Order):

5. **Matter creation**
   - `lib/schemas/matter.ts` - Validation schema
   - `app/(dashboard)/matters/new/page.tsx` - Form
   - Server action for creation

6. **Matter detail page**
   - `app/(dashboard)/matters/[id]/page.tsx`
   - Display matter data
   - Basic tabs (Overview, Documents, Tasks)

7. **Polish & Testing**
   - Add loading states
   - Add error handling
   - Test multi-tenancy isolation
   - Verify RLS policies

---

## 🚨 Critical Notes

### Multi-Tenancy
- **ALWAYS** use `withTenantContext()` wrapper for DB operations
- **NEVER** query without tenant context
- **VERIFY** RLS policies are working (test with different tenant_ids)

### Authentication
- Redirect unauthenticated users to `/auth/login`
- Check `getUserTenant()` returns data before rendering

### Performance
- Use React Server Components (RSC) by default
- Only use `'use client'` for interactive components
- Leverage Next.js caching (`revalidatePath`, `revalidateTag`)

---

## 📚 Reference Files

**Read before starting:**
1. `PLANNING.md` - Architecture overview
2. `DATABASE.md` - Schema details
3. `lib/auth/tenant.ts` - Tenant utilities
4. `lib/db/actions.ts` - Database actions
5. `IMPLEMENTATION_PLAN.md` - Original plan

**Existing components to reference:**
- `/test-connection/page.tsx` - Example RSC page
- `/dashboard/page.tsx` - Example tenant info display

---

## 🎯 Success Criteria

At the end of Day 5, you should have:

1. ✅ **Working Dashboard Layout**
   - Sidebar with navigation
   - Header with user menu
   - Responsive design
   - Dark mode support

2. ✅ **Matter Management**
   - List all matters (with empty state)
   - Create new matter (with validation)
   - View matter details
   - Basic tabs structure

3. ✅ **Multi-Tenancy Verified**
   - Users only see their tenant's matters
   - RLS policies enforced
   - Tenant context propagation working

4. ✅ **Production-Ready Code**
   - TypeScript strict mode
   - Error handling
   - Loading states
   - Form validation
   - Server Actions

---

## 🔗 Cherry-Pick Resources

**shadcn/ui:**
- SaaS Boilerplate: https://github.com/mickasmt/next-saas-stripe-starter
- Components: https://ui.shadcn.com/

**Lucide Icons:**
```bash
pnpm add lucide-react
```

Common icons needed:
- `Home`, `FileText`, `Upload`, `Users`, `Settings`
- `ChevronDown`, `Plus`, `Search`, `Bell`, `Menu`

---

## 🚀 Start Command

```bash
cd /Users/michal/.codeium/windsurf/Projects/Development/Prawnik\ AI/app-code
pnpm dev
```

**Verify:**
- Dev server: http://localhost:3000
- Test connection: http://localhost:3000/test-connection
- Current dashboard: http://localhost:3000/dashboard

---

## ❓ Questions to Clarify Before Starting

1. Do you want a specific color scheme or stick with default?
2. Should we implement data table sorting/filtering now or later?
3. Do you want to seed some test data for development?
4. Should matter creation redirect to the detail page or list page?

---

**Good luck! Follow the plan step-by-step and you'll have a production-ready dashboard by end of Day 5.** 🚀

---

## 📦 Quick Reference: Key Files Location

```
app-code/
├── app/
│   ├── (dashboard)/           # Protected routes
│   │   ├── layout.tsx         # CREATE: Dashboard layout wrapper
│   │   ├── dashboard/         # Exists (move here)
│   │   ├── matters/           # CREATE: Matter management
│   │   │   ├── page.tsx       # List
│   │   │   ├── new/page.tsx   # Create
│   │   │   └── [id]/page.tsx  # Detail
│   │   └── ...
│   └── ...
├── components/
│   ├── layout/                # CREATE: Layout components
│   │   ├── app-sidebar.tsx
│   │   ├── header.tsx
│   │   └── dashboard-layout.tsx
│   ├── matters/               # CREATE: Matter components
│   │   └── matter-card.tsx
│   └── ui/                    # shadcn/ui components
├── lib/
│   ├── auth/
│   │   └── tenant.ts          # ✅ EXISTS
│   ├── db/
│   │   └── actions.ts         # ✅ EXISTS
│   ├── schemas/               # CREATE: Zod schemas
│   │   └── matter.ts
│   └── supabase/
│       └── middleware.ts      # ✅ EXISTS
└── ...
```

---

**End of Day 4-5 Implementation Brief**
