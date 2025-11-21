# Supabase Studio - Problem z Widocznością Tabel

## 🐛 Problem

Supabase Studio nie pokazywało tabel w schemacie `public`, mimo że:
- ✅ Migracje zostały prawidłowo zastosowane
- ✅ Tabele istnieją w bazie danych
- ✅ Struktura jest poprawna

**Screenshot problemu:** Table Editor pokazywał "Select a table from the navigation panel on the left to view its data, or create a new one."

---

## 🔍 Przyczyna

**Row Level Security (RLS) blokował dostęp do tabel w Supabase Studio.**

### Szczegóły:

1. **Wszystkie tabele miały włączone RLS:**
   ```sql
   ALTER TABLE table_name ENABLE ROW LEVEL SECURITY;
   ```

2. **RLS policies wymagały:**
   - Zalogowanego użytkownika (`auth.uid()`)
   - Przynależności do tenant (`tenant_id = get_user_tenant_id()`)
   - Odpowiednich ról (owner, admin, lawyer, itp.)

3. **Supabase Studio używa `service_role`:**
   - Studio łączy się jako `service_role` (nie jako authenticated user)
   - Nie ma polityk pozwalających `service_role` na dostęp
   - Efekt: Studio widzi że tabele istnieją, ale RLS blokuje wyświetlenie danych

---

## ✅ Rozwiązanie

**Dodanie RLS policies dla `service_role` w środowisku lokalnym.**

### Utworzono migrację lokalną:

**Plik:** `supabase/migrations/local/local_20251121121500_dev_bypass_rls.sql`

```sql
-- Local Migration: Bypass RLS for development
-- Note: FOR DEVELOPMENT ONLY

BEGIN;

-- Grant service role full access to all tables
CREATE POLICY "Service role can do everything on tenants"
  ON public.tenants
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Service role can do everything on users"
  ON public.users
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- ... (dla wszystkich 9 tabel)

COMMIT;
```

### Zastosowano migrację:

```bash
cd /home/debian/projects/prawnik-ai
psql "postgresql://postgres:postgres@127.0.0.1:54322/postgres" \
  -f supabase/migrations/local/local_20251121121500_dev_bypass_rls.sql
```

### Zrestartowano Supabase:

```bash
supabase stop && supabase start
```

---

## 📊 Weryfikacja

### 1. Sprawdzenie tabel:

```bash
psql "postgresql://postgres:postgres@127.0.0.1:54322/postgres" \
  -c "\dt public.*"
```

**Wynik:** 9 tabel
- audit_logs
- document_chunks
- documents
- matters
- task_attachments
- task_runs
- tasks
- tenants
- users

### 2. Sprawdzenie migracji:

```sql
SELECT version, name 
FROM supabase_migrations.schema_migrations 
ORDER BY version;
```

**Wynik:** 3 migracje zastosowane
- 20251116174201 - enable_extensions
- 20251116174220 - initial_schema
- 20251116222000 - auto_create_user_and_tenant

### 3. Sprawdzenie RLS policies:

```sql
SELECT tablename, policyname 
FROM pg_policies 
WHERE schemaname = 'public' AND policyname LIKE '%Service role%';
```

**Wynik:** 9 policies (po 1 dla każdej tabeli)

---

## 🎯 Dlaczego to działa?

### Service Role w Supabase:

1. **Service Role** = specjalna rola z podwyższonymi uprawnieniami
2. Używana przez:
   - Supabase Studio
   - Server-side operations
   - Migrations
   - Background jobs

3. **W środowisku lokalnym:**
   - Service role powinno mieć pełny dostęp dla wygody developmentu
   - RLS nadal chroni dane dla `authenticated` users
   - Policies dla service role nie wpływają na bezpieczeństwo produkcji

4. **W środowisku produkcyjnym:**
   - Ta migracja **NIE BĘDZIE** zastosowana (jest w folderze `local/`)
   - Service role w cloud ma domyślne uprawnienia do zarządzania
   - RLS chroni dane użytkowników końcowych

---

## 📝 Best Practices

### Development (Lokalny Supabase):

✅ **DO:**
- Dodaj policies dla `service_role` w migracjach lokalnych
- Umieść je w `supabase/migrations/local/`
- Gitignore pliki `.sql` w tym folderze

❌ **DON'T:**
- Nie dodawaj policies dla service_role do uniwersalnych migracji
- Nie commituj lokalnych migracji do repo
- Nie wyłączaj RLS całkowicie

### Production (Supabase Cloud):

✅ **DO:**
- Testuj RLS policies dokładnie
- Używaj `authenticated` i `anon` roles
- Weryfikuj dostęp dla różnych ról użytkowników

❌ **DON'T:**
- Nie polegaj na service role w aplikacji
- Nie dodawaj policies bypassing RLS

---

## 🔧 Jak to zrobić w przyszłości?

### 1. Przy tworzeniu nowej tabeli z RLS:

**Universal Migration:**
```sql
-- migrations/YYYYMMDDHHMMSS_add_new_table.sql
CREATE TABLE public.new_table (...);
ALTER TABLE public.new_table ENABLE ROW LEVEL SECURITY;

-- Policies dla authenticated users
CREATE POLICY "Users can view own data"
  ON public.new_table FOR SELECT
  USING (tenant_id = get_user_tenant_id());
```

**Local Migration:**
```sql
-- migrations/local/local_YYYYMMDDHHMMSS_dev_rls_new_table.sql
-- FOR DEVELOPMENT ONLY
CREATE POLICY "Service role can do everything on new_table"
  ON public.new_table
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);
```

### 2. Zastosowanie:

```bash
# Universal migration
supabase db reset

# Local migration
psql $DATABASE_URL -f supabase/migrations/local/local_*.sql

# Restart
supabase stop && supabase start
```

---

## 🚨 Troubleshooting

### Problem: Studio nadal nie pokazuje tabel

**Rozwiązanie:**
```bash
# 1. Sprawdź czy policies istnieją
psql $DATABASE_URL -c "SELECT tablename, policyname FROM pg_policies WHERE policyname LIKE '%Service role%';"

# 2. Sprawdź czy RLS jest włączony
psql $DATABASE_URL -c "SELECT tablename, rowsecurity FROM pg_tables WHERE schemaname = 'public';"

# 3. Restart Studio
supabase stop && supabase start

# 4. Wyczyść cache przeglądarki (Ctrl+Shift+R)
```

### Problem: Policies nie działają

**Sprawdź syntax:**
```sql
-- Poprawna składnia
CREATE POLICY "policy_name"
  ON schema.table_name
  FOR ALL              -- lub SELECT, INSERT, UPDATE, DELETE
  TO service_role      -- nazwa roli
  USING (true)         -- warunek dla SELECT
  WITH CHECK (true);   -- warunek dla INSERT/UPDATE
```

---

## 📚 Dodatkowe Informacje

### Dokumentacja Supabase:

- [Row Level Security](https://supabase.com/docs/guides/auth/row-level-security)
- [Policies](https://supabase.com/docs/guides/database/postgres/row-level-security#policies)
- [Service Role](https://supabase.com/docs/guides/database/postgres/roles)

### PostgreSQL:

- [CREATE POLICY](https://www.postgresql.org/docs/current/sql-createpolicy.html)
- [ALTER TABLE ... ENABLE ROW LEVEL SECURITY](https://www.postgresql.org/docs/current/sql-altertable.html)

---

**Utworzono:** 2024-11-21  
**Status:** ✅ Naprawione  
**Środowisko:** Development (Local Supabase)
