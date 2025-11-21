# Database Migrations - Prawnik AI

## Migration Strategy

We use two types of migrations:

### 1. **Universal Migrations** (`migrations/`)
- Migrations that work both locally and in production
- Schema changes, table creation, indexes
- RLS policies
- Functions and triggers
- **Naming:** `YYYYMMDDHHMMSS_description.sql`

### 2. **Local-Only Migrations** (`migrations/local/`)
- Seed data for development
- Test users and sample data
- **NOT applied to production**
- **Naming:** `local_YYYYMMDDHHMMSS_description.sql`

---

## Directory Structure

```
supabase/
├── config.toml                    # Supabase configuration
├── migrations/                    # Universal migrations
│   ├── 20241116000001_initial_schema.sql
│   ├── 20241116000002_enable_pgvector.sql
│   ├── 20241116000003_create_tenants.sql
│   └── ...
└── migrations/local/              # Local-only migrations
    ├── local_20241116000001_seed_test_users.sql
    ├── local_20241116000002_seed_sample_documents.sql
    └── ...
```

---

## Commands

### Create New Migration
```bash
# Universal migration
supabase migration new description_here

# Local-only migration (manual)
touch supabase/migrations/local/local_$(date +%Y%m%d%H%M%S)_description.sql
```

### Apply Migrations Locally
```bash
# All universal migrations
supabase db reset

# Specific migration
supabase migration up

# Apply local-only migrations (manual)
psql $DATABASE_URL -f supabase/migrations/local/local_*.sql
```

### Push to Production
```bash
# Push universal migrations only
supabase db push

# local/ folder is gitignored for production
```

### Pull from Production
```bash
# Download remote schema as migration
supabase db pull
```

---

## Best Practices

### DO ✅
- Use transactions for complex migrations
- Test locally before pushing to production
- Include rollback instructions in comments
- Keep migrations small and focused
- Add descriptive comments

### DON'T ❌
- Modify existing migrations after pushing
- Include sensitive data in universal migrations
- Mix schema and seed data in same file
- Skip testing migrations locally

---

## Migration Template

### Universal Migration
```sql
-- Migration: Add users table
-- Date: 2024-11-16
-- Author: Development Team
-- Rollback: DROP TABLE IF EXISTS users CASCADE;

BEGIN;

-- Create table
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add indexes
CREATE INDEX idx_users_email ON users(email);

-- Enable RLS
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- RLS policies
CREATE POLICY "Users can view own data"
  ON users FOR SELECT
  USING (auth.uid() = id);

COMMIT;
```

### Local-Only Migration
```sql
-- Local Migration: Seed test users
-- Date: 2024-11-16
-- Note: FOR DEVELOPMENT ONLY

BEGIN;

INSERT INTO users (id, email) VALUES
  ('11111111-1111-1111-1111-111111111111', 'test@example.com'),
  ('22222222-2222-2222-2222-222222222222', 'admin@example.com')
ON CONFLICT DO NOTHING;

COMMIT;
```

---

## Workflow

### Development
1. Create migration: `supabase migration new add_feature`
2. Edit SQL file in `supabase/migrations/`
3. Test locally: `supabase db reset`
4. Verify in local Supabase Studio
5. Commit to git

### Local Seed Data
1. Create in `supabase/migrations/local/`
2. Apply manually (not tracked in version control)
3. Add to `.gitignore`

### Production Deployment
1. Test all migrations locally
2. Create backup of production database
3. Push migrations: `supabase db push`
4. Verify in production dashboard
5. Monitor for errors

---

## Troubleshooting

### Migration Failed
```bash
# Check migration status
supabase migration list

# Check database logs
supabase db logs

# Rollback (if possible)
psql $DATABASE_URL -f rollback.sql
```

### Conflict with Remote
```bash
# Pull remote changes first
supabase db pull

# Resolve conflicts manually
# Then push
supabase db push
```

---

## Security Notes

1. **Never commit credentials** - Use environment variables
2. **RLS policies first** - Enable RLS before inserting data
3. **Test policies** - Verify RLS works for all user roles
4. **Audit migrations** - Review before production deployment

---

## Links

- [Supabase Migrations Docs](https://supabase.com/docs/guides/cli/local-development#database-migrations)
- [PostgreSQL Migration Best Practices](https://www.postgresql.org/docs/current/ddl-schemas.html)
- Project Schema: `../schema.sql`
