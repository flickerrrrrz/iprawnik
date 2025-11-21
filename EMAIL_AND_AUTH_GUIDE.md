# Email Confirmation & Authentication - Guide

## 🔍 Problem: Brak emaila potwierdzającego

### Co się działo?

Gdy tworzyłeś użytkownika przez frontend:
- ✅ Użytkownik został utworzony w bazie danych
- ✅ Użytkownik został automatycznie potwierdzony (`email_confirmed_at` ustawione)
- ❌ Nie wysłał się email potwierdzający

### Dlaczego?

**Email confirmation jest WYŁĄCZONY w lokalnym Supabase (celowo).**

**Konfiguracja w `supabase/config.toml`:**
```toml
[auth.email]
enable_confirmations = false
```

**To jest prawidłowe dla środowiska developerskiego!**

### Jak to działa w dev vs production?

| Środowisko | Email Confirmation | Wysyłka Emaili | Potwierdzenie |
|------------|-------------------|----------------|---------------|
| **Development (Local)** | ❌ Wyłączone | ❌ Nie wysyła | ✅ Auto-confirm |
| **Production (Cloud)** | ✅ Włączone | ✅ Wysyła | ⏳ User musi kliknąć link |

---

## 📧 Gdzie Trafiają Emaile w Dev?

**W środowisku lokalnym emaile trafiają do Mailpit:**

### Otwórz Mailpit:
```
http://localhost:54324
```

**Mailpit to:**
- Email testing tool
- Przechwytuje wszystkie emaile wysłane przez Supabase
- Nie wymaga prawdziwego SMTP servera
- Idealny do testowania

### Jak przetestować wysyłkę emaili?

**1. Włącz email confirmations w `supabase/config.toml`:**
```toml
[auth.email]
enable_confirmations = true
```

**2. Zrestartuj Supabase:**
```bash
supabase stop && supabase start
```

**3. Utwórz nowego użytkownika przez frontend**

**4. Sprawdź Mailpit:**
```
http://localhost:54324
```

**5. Zobaczysz email z linkiem potwierdzającym**

### ⚠️ Uwaga dla Development:

W większości przypadków **NIE POTRZEBUJESZ** email confirmation w dev:
- Spowalnia testowanie
- Wymaga dodatkowych kliknięć
- Auto-confirm jest szybsze i wygodniejsze

**Rekomendacja:** Zostaw `enable_confirmations = false` w dev.

---

## ✅ Jak Zalogować Się Bez Potwierdzenia Emaila?

### Scenariusz 1: Email confirmation wyłączony (dev)

**Po prostu się zaloguj!**
- Użytkownik jest automatycznie potwierdzony
- Możesz się zalogować od razu po rejestracji

**Sprawdzenie:**
```bash
psql "postgresql://postgres:postgres@127.0.0.1:54322/postgres" \
  -c "SELECT email, email_confirmed_at FROM auth.users WHERE email = 'twoj@email.com';"
```

Jeśli `email_confirmed_at` jest ustawione = możesz się zalogować.

### Scenariusz 2: Email confirmation włączony (testowanie)

**Ręcznie potwierdź użytkownika w bazie danych:**

```bash
psql "postgresql://postgres:postgres@127.0.0.1:54322/postgres" <<EOF
UPDATE auth.users 
SET email_confirmed_at = NOW() 
WHERE email = 'twoj@email.com' 
  AND email_confirmed_at IS NULL;
EOF
```

**Lub przez Supabase Studio:**
1. Otwórz: http://localhost:54323
2. Kliknij "Authentication" → "Users"
3. Znajdź użytkownika
4. Kliknij "..." → "Edit user"
5. Zaznacz "Email confirmed" ✅
6. Kliknij "Save"

### Scenariusz 3: Production (Supabase Cloud)

**W produkcji MUSISZ wysłać email:**
- Użytkownik musi kliknąć link w emailu
- Bez tego nie może się zalogować
- To jest standardowa praktyka bezpieczeństwa

**Jeśli email nie dotarł:**
1. Sprawdź spam folder
2. Użyj funkcji "Resend confirmation email"
3. Lub admin może ręcznie potwierdzić w Supabase Dashboard

---

## 🐛 Błąd Next.js: Middleware → Proxy

### Co było nie tak?

**Next.js 16 wprowadził breaking change:**
- Plik `middleware.ts` → zmieniony na `proxy.ts`
- Funkcja `middleware()` → zmieniona na `proxy()`

**Błąd w logach:**
```
⚠ The "middleware" file convention is deprecated. 
  Please use "proxy" instead.

⨯ The file "./proxy.ts" must export a function, 
  either as a default export or as a named "proxy" export.
```

### Co naprawiłem?

**1. Zmiana nazwy pliku:**
```bash
mv middleware.ts proxy.ts
```

**2. Zmiana nazwy funkcji w `proxy.ts`:**

**Przed:**
```typescript
export async function middleware(request: NextRequest) {
  return await updateSession(request);
}
```

**Po:**
```typescript
export async function proxy(request: NextRequest) {
  return await updateSession(request);
}
```

**3. Restart Next.js:**
```bash
pkill -f "next dev"
cd app-code && npm run dev
```

### Weryfikacja:

**Sprawdź logi:**
```bash
tail -f /tmp/nextjs.log
```

**Powinno być:**
```
✓ Ready in 1540ms
```

**Bez żadnych ostrzeżeń! ✅**

---

## 🧪 Test Pełnego Flow

### 1. Utwórz użytkownika:

**Przez frontend:**
```
http://localhost:3000/sign-up

Email: test@example.com
Hasło: test123456
```

### 2. Sprawdź w bazie:

```bash
psql "postgresql://postgres:postgres@127.0.0.1:54322/postgres" <<EOF
SELECT 
  au.email,
  au.email_confirmed_at,
  pu.role,
  t.name as tenant_name
FROM auth.users au
JOIN public.users pu ON au.id = pu.id
JOIN public.tenants t ON pu.tenant_id = t.id
WHERE au.email = 'test@example.com';
EOF
```

**Oczekiwany wynik:**
```
email                | email_confirmed_at         | role  | tenant_name
---------------------+---------------------------+-------+------------------
test@example.com     | 2025-11-21 13:50:59.960275 | owner | test's Firm
```

### 3. Zaloguj się:

```
http://localhost:3000/sign-in

Email: test@example.com
Hasło: test123456
```

**Powinno zadziałać bez problemów! ✅**

### 4. Sprawdź cookies:

Po zalogowaniu sprawdź Developer Tools → Application → Cookies:
- `sb-access-token` - JWT token
- `sb-refresh-token` - Refresh token
- `tenant_id` - ID firmy prawnej
- `user_role` - Rola użytkownika (owner)

---

## 📊 Status Użytkownika w Bazie

### Sprawdź szczegóły użytkownika:

```bash
psql "postgresql://postgres:postgres@127.0.0.1:54322/postgres" <<EOF
-- Auth user
SELECT id, email, email_confirmed_at, created_at 
FROM auth.users 
WHERE email = 'twoj@email.com';

-- Public user (z rolą i tenant)
SELECT u.id, u.email, u.role, u.tenant_id, t.name as tenant_name
FROM public.users u
JOIN public.tenants t ON u.tenant_id = t.id
WHERE u.email = 'twoj@email.com';
EOF
```

### Co powinno być ustawione?

**W `auth.users`:**
- ✅ `id` - UUID użytkownika
- ✅ `email` - Email
- ✅ `email_confirmed_at` - Data potwierdzenia (lub NULL jeśli włączone confirmations)
- ✅ `created_at` - Data utworzenia

**W `public.users`:**
- ✅ `id` - Ten sam UUID co w auth.users
- ✅ `tenant_id` - UUID firmy prawnej
- ✅ `role` - 'owner' (pierwszy użytkownik)
- ✅ `email` - Email

**W `public.tenants`:**
- ✅ `id` - UUID tenant
- ✅ `name` - Nazwa firmy (np. "michal.pawlik.pl's Firm")
- ✅ `slug` - Slug (np. "michal-pawlik-pl-4577e865")

---

## 🔧 Troubleshooting

### Problem: Nie mogę się zalogować

**1. Sprawdź czy użytkownik jest potwierdzony:**
```bash
psql "postgresql://postgres:postgres@127.0.0.1:54322/postgres" \
  -c "SELECT email, email_confirmed_at FROM auth.users WHERE email = 'twoj@email.com';"
```

**2. Jeśli `email_confirmed_at` jest NULL, potwierdź ręcznie:**
```bash
psql "postgresql://postgres:postgres@127.0.0.1:54322/postgres" \
  -c "UPDATE auth.users SET email_confirmed_at = NOW() WHERE email = 'twoj@email.com';"
```

**3. Sprawdź hasło:**
- Minimalnie 6 znaków
- Supabase domyślnie wymaga tylko długości, nie złożoności

**4. Sprawdź logi Next.js:**
```bash
tail -f /tmp/nextjs.log
```

**5. Sprawdź logi Supabase:**
```bash
supabase logs --tail 50
```

### Problem: Email nie wysyłany w dev

**To jest NORMALNE!**
- `enable_confirmations = false` w `supabase/config.toml`
- Użytkownicy są automatycznie potwierdzani

**Jeśli chcesz testować wysyłkę:**
1. Włącz `enable_confirmations = true`
2. Restart: `supabase stop && supabase start`
3. Sprawdź Mailpit: http://localhost:54324

### Problem: Błąd w Next.js po zalogowaniu

**Sprawdź middleware/proxy:**
```bash
cat app-code/proxy.ts
```

**Powinna być funkcja `proxy()` (nie `middleware()`):**
```typescript
export async function proxy(request: NextRequest) {
  return await updateSession(request);
}
```

**Jeśli masz `middleware()`, zmień na `proxy()`.**

### Problem: Trigger nie tworzy tenant/user

**Sprawdź czy trigger istnieje:**
```bash
psql "postgresql://postgres:postgres@127.0.0.1:54322/postgres" \
  -c "\df public.handle_new_user"
```

**Sprawdź logi podczas tworzenia użytkownika:**
```bash
supabase logs --tail 100 | grep -i "trigger\|error"
```

**Ręcznie utwórz tenant i user:**
```bash
psql "postgresql://postgres:postgres@127.0.0.1:54322/postgres" <<EOF
-- Pobierz ID użytkownika
SELECT id, email FROM auth.users WHERE email = 'twoj@email.com';

-- Utwórz tenant
INSERT INTO public.tenants (name, slug)
VALUES ('Test Firm', 'test-firm-' || substr(gen_random_uuid()::text, 1, 8))
RETURNING id;

-- Utwórz user w public.users (użyj ID z powyższych zapytań)
INSERT INTO public.users (id, tenant_id, email, full_name, role)
VALUES (
  'USER_ID_FROM_AUTH_USERS',
  'TENANT_ID_FROM_ABOVE',
  'twoj@email.com',
  'Test User',
  'owner'
);
EOF
```

---

## 📝 Quick Commands

### Pokaż wszystkich użytkowników:
```bash
psql "postgresql://postgres:postgres@127.0.0.1:54322/postgres" \
  -c "SELECT au.email, au.email_confirmed_at, pu.role, t.name FROM auth.users au JOIN public.users pu ON au.id = pu.id JOIN public.tenants t ON pu.tenant_id = t.id;"
```

### Potwierdź użytkownika:
```bash
psql "postgresql://postgres:postgres@127.0.0.1:54322/postgres" \
  -c "UPDATE auth.users SET email_confirmed_at = NOW() WHERE email = 'twoj@email.com';"
```

### Usuń użytkownika (dla testów):
```bash
psql "postgresql://postgres:postgres@127.0.0.1:54322/postgres" <<EOF
-- Usuń z public.users (kaskadowo usuwa powiązania)
DELETE FROM public.users WHERE email = 'twoj@email.com';

-- Usuń z auth.users
DELETE FROM auth.users WHERE email = 'twoj@email.com';
EOF
```

### Restart Next.js:
```bash
pkill -f "next dev"
cd /home/debian/projects/prawnik-ai/app-code
npm run dev > /tmp/nextjs.log 2>&1 &
```

### Sprawdź logi Next.js:
```bash
tail -f /tmp/nextjs.log
```

### Otwórz Mailpit:
```
http://localhost:54324
```

### Otwórz Supabase Studio:
```
http://localhost:54323
```

---

## ✅ Podsumowanie

### Co naprawiłem:

1. ✅ **Email nie wysyłany** - To jest NORMALNE w dev (`enable_confirmations = false`)
2. ✅ **Błąd Next.js** - Zmieniono `middleware.ts` → `proxy.ts` i funkcję `middleware()` → `proxy()`
3. ✅ **Logowanie bez emaila** - Użytkownicy są auto-confirmed w dev

### Aktualna konfiguracja:

**Development (Local):**
- Email confirmation: ❌ Wyłączone
- Auto-confirm: ✅ Włączone
- Mailpit: ✅ Dostępne (http://localhost:54324)
- Next.js: ✅ Działa bez ostrzeżeń

**Production (Cloud - gdy wdrożysz):**
- Email confirmation: ✅ Włączone
- Auto-confirm: ❌ Wyłączone
- SMTP: ✅ Supabase Cloud (automatyczne)

### Możesz teraz:

1. ✅ Tworzyć użytkowników przez frontend
2. ✅ Logować się od razu (bez potwierdzenia emaila)
3. ✅ Testować aplikację bez błędów Next.js
4. ✅ Sprawdzać wysyłkę emaili w Mailpit (jeśli włączysz confirmations)

**Wszystko działa prawidłowo! 🎉**

---

**Utworzono:** 2024-11-21  
**Status:** ✅ Naprawione i udokumentowane  
**Next.js:** 16.0.3 (z proxy zamiast middleware)
