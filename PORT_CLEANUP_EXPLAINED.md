# Port Cleanup - Wyjaśnienie Problemu

## 🐛 Problem: Chaos z Portami

### Co było nie tak?

**Mieliśmy DWIE instancje Supabase:**

1. **Stara instancja** (z 15 września 2024):
   - Kontener: `supabase_studio` (OLD VERSION: 20240326)
   - Port: **3000** (blokował port dla Next.js!)
   - Status: Pusta baza danych, stare tabele
   - Przyczyna: Pozostałość po starych testach

2. **Nowa instancja** (aktualna, lokalna):
   - Kontener: `supabase_studio_prawnik-ai` (NEW VERSION: 2025.11.10)
   - Port: **54323**
   - Status: ✅ Poprawna baza z 9 tabelami
   - Przyczyna: Utworzona przez `supabase init`

### Co to powodowało?

| URL | Co się otwierało | Co POWINNO się otwierać |
|-----|------------------|-------------------------|
| `http://localhost:3000` | ❌ Stare Supabase Studio (puste) | ✅ Next.js App |
| `http://localhost:3001` | ✅ Next.js App | - |
| `http://localhost:54323` | ✅ Nowe Supabase Studio (z tabelami) | ✅ Supabase Studio |
| `http://localhost:60904` | ❌ Proxy do starego Supabase | - |

**Efekt:** Next.js nie mogło uruchomić się na porcie 3000, więc startowało na 3001. Tworzenie użytkowników nie działało, bo Next.js łączyło się z cloudowym Supabase zamiast lokalnym.

---

## ✅ Rozwiązanie

### 1. Zatrzymanie i usunięcie starych kontenerów

```bash
# Zatrzymaj stare kontenery
docker stop supabase_studio supabase_kong supabase_storage supabase_realtime supabase_auth

# Usuń je na stałe
docker rm supabase_studio supabase_kong supabase_storage supabase_realtime supabase_auth
```

**Wynik:** Port 3000 jest teraz wolny! ✅

### 2. Aktualizacja .env.local

**Przed (błędne - cloud):**
```bash
NEXT_PUBLIC_SUPABASE_URL=https://tskfjodbbnaozfmctjne.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=sb_publishable_wU-erO71HyX8SQweE_zdvg_08Ld_Abs
```

**Po (poprawne - local):**
```bash
NEXT_PUBLIC_SUPABASE_URL=http://127.0.0.1:54321
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=sb_publishable_ACJWlzQHlZjBrEguHvfOxg_3BJgxAaH
```

**Wynik:** Next.js teraz łączy się z lokalnym Supabase! ✅

### 3. Restart Next.js na porcie 3000

```bash
# Zabij stare procesy
pkill -f "next dev"

# Uruchom ponownie
cd /home/debian/projects/prawnik-ai/app-code
npm run dev
```

**Wynik:** Next.js działa na porcie 3000! ✅

---

## 📊 Aktualna Mapa Portów

### ✅ Poprawna Konfiguracja

| Port | Usługa | URL | Cel |
|------|--------|-----|-----|
| **3000** | Next.js App | http://localhost:3000 | Aplikacja webowa |
| **54321** | Supabase API | http://127.0.0.1:54321 | REST API (PostgREST) |
| **54322** | PostgreSQL | postgresql://postgres:postgres@127.0.0.1:54322/postgres | Baza danych |
| **54323** | Supabase Studio | http://127.0.0.1:54323 | Admin panel (zarządzanie bazą) |
| **54324** | Mailpit | http://127.0.0.1:54324 | Email testing |

### 🗑️ Usunięte (stare, niepotrzebne)

| Port | Co było | Status |
|------|---------|--------|
| ~~3000~~ | Stare Supabase Studio | ❌ Usunięte |
| ~~3001~~ | Next.js (backup) | ❌ Niepotrzebne |
| ~~60904~~ | Proxy do starego Supabase | ❌ Niepotrzebne |

---

## 🎯 Dlaczego Supabase Studio czasami pokazywało tabele, a czasami nie?

### Wyjaśnienie:

**Były DWA różne Supabase Studio:**

1. **Stare Studio (port 3000 / 60904):**
   - Wersja: 20240326 (marzec 2024)
   - Baza danych: Stara, pusta, bez migracji
   - **Efekt:** Brak tabel lub stare tabele

2. **Nowe Studio (port 54323):**
   - Wersja: 2025.11.10 (listopad 2025)
   - Baza danych: Aktualna, z migracjami
   - **Efekt:** ✅ 9 tabel widocznych

### Które Studio jest poprawne?

**✅ TYLKO port 54323 jest poprawny!**

```bash
# Otwórz poprawne Studio
http://localhost:54323
```

---

## 🔍 Która Baza Danych jest Lokalna?

**Lokalna baza danych to:**

```
postgresql://postgres:postgres@127.0.0.1:54322/postgres
```

### Jak to sprawdzić?

**1. Przez Supabase CLI:**
```bash
cd /home/debian/projects/prawnik-ai
supabase status
```

**Wynik:**
```
Database URL: postgresql://postgres:postgres@127.0.0.1:54322/postgres
         API URL: http://127.0.0.1:54321
      Studio URL: http://127.0.0.1:54323
```

**2. Przez psql:**
```bash
psql "postgresql://postgres:postgres@127.0.0.1:54322/postgres" -c "\dt public.*"
```

**Wynik:** 9 tabel (tenants, users, matters, documents, document_chunks, tasks, task_runs, task_attachments, audit_logs)

**3. Przez Supabase Studio:**
- Otwórz: http://localhost:54323
- Kliknij "Table Editor" (lewa strona)
- Sprawdź listę tabel

### Cloudowa baza danych (NIE UŻYWANA w dev):

```
https://tskfjodbbnaozfmctjne.supabase.co
postgresql://postgres:876dcjhsoi08943ouihfweow99fu2i@db.tskfjodbbnaozfmctjne.supabase.co:5432/postgres
```

**Użycie:** Tylko w produkcji (Vercel deployment)

---

## 🔗 Do Której Bazy Jest Podłączona Aplikacja Next.js?

### Sprawdź w .env.local:

```bash
cat /home/debian/projects/prawnik-ai/app-code/.env.local | grep SUPABASE_URL
```

**Poprawny wynik (local dev):**
```
NEXT_PUBLIC_SUPABASE_URL=http://127.0.0.1:54321
```

**Błędny wynik (cloud):**
```
NEXT_PUBLIC_SUPABASE_URL=https://tskfjodbbnaozfmctjne.supabase.co
```

### Weryfikacja działania:

**1. Otwórz aplikację:**
```
http://localhost:3000
```

**2. Spróbuj utworzyć użytkownika (Sign up)**

**3. Sprawdź czy użytkownik pojawił się w lokalnej bazie:**
```bash
psql "postgresql://postgres:postgres@127.0.0.1:54322/postgres" \
  -c "SELECT email, created_at FROM auth.users ORDER BY created_at DESC LIMIT 5;"
```

**Jeśli użytkownik się pojawi = Next.js połączony z lokalnym Supabase ✅**

**4. Sprawdź również w Studio:**
- http://localhost:54323
- Kliknij "Authentication" → "Users"
- Sprawdź listę użytkowników

---

## 🛠️ Jak Utworzyć Użytkownika (Testowy)?

### Opcja 1: Przez aplikację Next.js

1. Otwórz: http://localhost:3000
2. Kliknij "Sign Up" lub przejdź do `/sign-up`
3. Wprowadź dane:
   - Email: test@example.com
   - Hasło: test123456
4. Kliknij "Sign Up"

**Ważne:** Email confirmation jest wyłączone w local dev, użytkownik od razu zostanie aktywny.

### Opcja 2: Przez Supabase Studio

1. Otwórz: http://localhost:54323
2. Kliknij "Authentication" → "Users"
3. Kliknij "Add user" (zielony przycisk)
4. Wprowadź:
   - Email: test@example.com
   - Password: test123456
   - Auto Confirm User: ✅ (zaznacz!)
5. Kliknij "Save"

### Opcja 3: Przez SQL

```bash
psql "postgresql://postgres:postgres@127.0.0.1:54322/postgres" <<EOF
-- Utwórz użytkownika w auth.users
INSERT INTO auth.users (
  instance_id,
  id,
  aud,
  role,
  email,
  encrypted_password,
  email_confirmed_at,
  created_at,
  updated_at
) VALUES (
  '00000000-0000-0000-0000-000000000000',
  gen_random_uuid(),
  'authenticated',
  'authenticated',
  'test@example.com',
  crypt('test123456', gen_salt('bf')),
  now(),
  now(),
  now()
) RETURNING id, email;
EOF
```

**Trigger automatycznie utworzy:**
- Rekord w `public.tenants` (firma prawna)
- Rekord w `public.users` (użytkownik z rolą 'owner')

### Weryfikacja:

```bash
# Sprawdź auth.users
psql "postgresql://postgres:postgres@127.0.0.1:54322/postgres" \
  -c "SELECT email, created_at FROM auth.users;"

# Sprawdź public.users
psql "postgresql://postgres:postgres@127.0.0.1:54322/postgres" \
  -c "SELECT email, role FROM public.users;"

# Sprawdź public.tenants
psql "postgresql://postgres:postgres@127.0.0.1:54322/postgres" \
  -c "SELECT name, slug FROM public.tenants;"
```

---

## 📝 Quick Reference - Poprawne URLe

| Potrzebujesz | URL | Uwagi |
|--------------|-----|-------|
| **Aplikacja Next.js** | http://localhost:3000 | Główna aplikacja webowa |
| **Supabase Studio** | http://localhost:54323 | Admin panel (zarządzanie bazą) |
| **Supabase API** | http://127.0.0.1:54321 | REST API (używane przez Next.js) |
| **PostgreSQL** | postgresql://postgres:postgres@127.0.0.1:54322/postgres | Direct DB access |
| **Email Testing** | http://localhost:54324 | Mailpit (przechwytywanie emaili) |

### ❌ NIE UŻYWAJ:

- ~~http://localhost:3000~~ (jeśli widzisz Supabase Studio)
- ~~http://localhost:60904~~ (stare proxy)
- ~~http://localhost:3001~~ (backup port)
- ~~https://tskfjodbbnaozfmctjne.supabase.co~~ (cloud - tylko produkcja)

---

## 🔧 Troubleshooting

### Problem: Next.js nadal pokazuje Supabase Studio

**Rozwiązanie:**
```bash
# 1. Sprawdź co działa na porcie 3000
ss -tlnp | grep :3000

# 2. Jeśli coś jest, zabij proces
sudo fuser -k 3000/tcp

# 3. Usuń wszystkie stare kontenery Supabase
docker ps -a | grep supabase | grep -v prawnik-ai | awk '{print $1}' | xargs docker rm -f

# 4. Restart Next.js
cd /home/debian/projects/prawnik-ai/app-code
pkill -f "next dev"
npm run dev
```

### Problem: Nie mogę utworzyć użytkownika

**Sprawdź:**

1. **Czy Next.js używa lokalnego Supabase?**
   ```bash
   cat app-code/.env.local | grep SUPABASE_URL
   # Powinno być: http://127.0.0.1:54321
   ```

2. **Czy lokalne Supabase działa?**
   ```bash
   supabase status
   # Wszystkie usługi powinny być "running"
   ```

3. **Czy migracje są zastosowane?**
   ```bash
   psql "postgresql://postgres:postgres@127.0.0.1:54322/postgres" \
     -c "SELECT version, name FROM supabase_migrations.schema_migrations;"
   # Powinny być 3 migracje
   ```

4. **Sprawdź logi:**
   ```bash
   # Next.js logs
   cd app-code
   npm run dev  # Sprawdź output w terminalu

   # Supabase logs
   supabase logs
   ```

### Problem: Studio nie pokazuje tabel

**To jest stare Studio!** Otwórz poprawne:
```
http://localhost:54323
```

Jeśli nadal nie widać tabel:
```bash
# 1. Sprawdź czy policies dla service_role istnieją
psql "postgresql://postgres:postgres@127.0.0.1:54322/postgres" \
  -c "SELECT COUNT(*) FROM pg_policies WHERE policyname LIKE '%Service role%';"
# Powinno być: 9

# 2. Jeśli nie, zastosuj migrację lokalną
psql "postgresql://postgres:postgres@127.0.0.1:54322/postgres" \
  -f supabase/migrations/local/local_20251121121500_dev_bypass_rls.sql

# 3. Restart Supabase
supabase stop && supabase start

# 4. Wyczyść cache przeglądarki (Ctrl+Shift+R)
```

---

## ✅ Podsumowanie

### Co zostało naprawione:

1. ✅ Usunięto stare kontenery Supabase blokujące port 3000
2. ✅ Zaktualizowano .env.local do lokalnego Supabase
3. ✅ Next.js działa na porcie 3000
4. ✅ Next.js łączy się z lokalnym Supabase (port 54321)
5. ✅ Supabase Studio (port 54323) pokazuje wszystkie tabele
6. ✅ Tylko jedna instancja Supabase (lokalna)

### Aktualna konfiguracja:

- **Next.js:** http://localhost:3000 → Supabase Local API (54321)
- **Supabase Studio:** http://localhost:54323 → Lokalna baza (54322)
- **Database:** postgresql://postgres:postgres@127.0.0.1:54322/postgres

### Tworzenie użytkowników:

1. Otwórz: http://localhost:3000
2. Sign up → automatycznie tworzy tenant + user
3. Weryfikuj w Studio: http://localhost:54323

**Wszystko działa lokalnie! 🎉**

---

**Utworzono:** 2024-11-21  
**Status:** ✅ Naprawione i udokumentowane
