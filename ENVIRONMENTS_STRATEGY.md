# Strategia Środowisk - Prawnik AI

## 🎯 Rekomendowana Struktura

### ✅ Środowisko Development (Lokalne VPS)

**Lokalizacja:** VPS 141.95.16.164  
**Przeznaczenie:** Szybkie iteracje, debugowanie, testy

**Stack:**
- **Frontend:** Next.js dev server na VPS
  - Port: 3000
  - URL: http://localhost:3000
  - Hot-reload: ✅
- **Backend/API:** Next.js API routes + Server Actions
- **Database:** Supabase Local (Docker) na VPS
  - API: http://127.0.0.1:54321
  - Studio: http://127.0.0.1:54323
  - DB: postgresql://postgres:postgres@127.0.0.1:54322/postgres
  - Mailpit: http://127.0.0.1:54324 (email testing)

**Konfiguracja (.env.local):**
```bash
NEXT_PUBLIC_SUPABASE_URL=http://127.0.0.1:54321
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=sb_publishable_ACJWlzQHlZjBrEguHvfOxg_3BJgxAaH
DATABASE_URL=postgresql://postgres:postgres@127.0.0.1:54322/postgres
```

**Zalety:**
- ⚡ Natychmiastowy hot-reload
- 🔍 Łatwy debugging (logi, breakpointy)
- 💾 Pełna kontrola nad danymi testowymi
- 🔄 Szybkie rollback migracji
- 🆓 Darmowe (bez limitów Supabase)

**Wady:**
- 🌐 Wymaga tunelowania SSH dla pracy zdalnej
- 💻 Zależność od dostępności VPS

---

### ✅ Środowisko Production (Cloud)

**Lokalizacja:** Vercel + Supabase Cloud  
**Przeznaczenie:** Produkcja, użytkownicy końcowi

**Stack:**
- **Frontend:** Next.js na Vercel
  - Auto-deploy z GitHub (main branch)
  - Edge Functions
  - CDN globalny
  - URL: https://prawnik-ai.vercel.app (lub custom domain)
- **Database:** Supabase Cloud
  - Project ID: tskfjodbbnaozfmctjne
  - URL: https://tskfjodbbnaozfmctjne.supabase.co
  - Region: EU Central 1 (Frankfurt)

**Konfiguracja (Vercel Environment Variables):**
```bash
NEXT_PUBLIC_SUPABASE_URL=https://tskfjodbbnaozfmctjne.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=sb_publishable_wU-erO71HyX8SQweE_zdvg_08Ld_Abs
SUPABASE_SECRET_KEY=sb_secret_YJsmhx2GuslKE5UkbZm7wE_qyvkXGez
DATABASE_URL=postgresql://postgres:***@db.tskfjodbbnaozfmctjne.supabase.co:5432/postgres
SUPABASE_POOLER_URL=postgresql://postgres.tskfjodbbnaozfmctjne:***@aws-1-eu-central-1.pooler.supabase.com:6543/postgres
```

**Zalety:**
- 🚀 Automatyczne deploymenty
- 🌍 Globalny CDN
- 📊 Monitoring i analytics
- 🔒 Backupy automatyczne
- ⚡ Serverless (skalowanie)

**Wady:**
- 💰 Koszty (Vercel Pro + Supabase Pro przy wzroście)
- 🐌 Wolniejsze iteracje (deploy ~2-5 min)

---

## 📊 Porównanie Środowisk

| Aspekt | Development (VPS) | Production (Cloud) |
|--------|-------------------|-------------------|
| **Frontend** | Next.js dev (port 3000) | Vercel |
| **Database** | Supabase Local (Docker) | Supabase Cloud |
| **Hot Reload** | ✅ Natychmiastowy | ❌ Wymaga deploy |
| **Debugging** | ✅ Pełny dostęp | ⚠️ Logi w dashboardzie |
| **Koszty** | 🆓 Darmowe | 💰 ~$20-50/mies |
| **Skalowanie** | ⚠️ Ograniczone VPS | ✅ Automatyczne |
| **Backupy** | ⚠️ Manualne | ✅ Automatyczne |
| **SSL/HTTPS** | ⚠️ Wymaga konfiguracji | ✅ Automatyczne |
| **Dostęp** | 🔒 SSH/Tunel | 🌍 Publiczny URL |

---

## 🔧 Konfiguracja Środowisk

### Development (VPS)

**Plik: `/home/debian/projects/prawnik-ai/app-code/.env.local`**

```bash
# Supabase Local (Docker)
NEXT_PUBLIC_SUPABASE_URL=http://127.0.0.1:54321
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=sb_publishable_ACJWlzQHlZjBrEguHvfOxg_3BJgxAaH

# Server-side
SUPABASE_SECRET_KEY=sb_secret_N7UND0UgjKTVK-Uodkm0Hg_xSvEMPvz
SUPABASE_DB_PASSWORD=postgres

# Database
DATABASE_URL=postgresql://postgres:postgres@127.0.0.1:54322/postgres

# Environment
NODE_ENV=development
NEXT_PUBLIC_ENV=development
```

**Uruchomienie:**
```bash
cd /home/debian/projects/prawnik-ai/app-code
npm run dev
```

---

### Production (Vercel + Supabase Cloud)

**Plik: Vercel Environment Variables (Dashboard)**

```bash
# Supabase Cloud
NEXT_PUBLIC_SUPABASE_URL=https://tskfjodbbnaozfmctjne.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=sb_publishable_wU-erO71HyX8SQweE_zdvg_08Ld_Abs

# Server-side (SECRET - tylko Vercel)
SUPABASE_SECRET_KEY=sb_secret_YJsmhx2GuslKE5UkbZm7wE_qyvkXGez
SUPABASE_DB_PASSWORD=876dcjhsoi08943ouihfweow99fu2i

# Database (dla migracji)
DATABASE_URL=postgresql://postgres:876dcjhsoi08943ouihfweow99fu2i@db.tskfjodbbnaozfmctjne.supabase.co:5432/postgres
SUPABASE_POOLER_URL=postgresql://postgres.tskfjodbbnaozfmctjne:876dcjhsoi08943ouihfweow99fu2i@aws-1-eu-central-1.pooler.supabase.com:6543/postgres

# Environment
NODE_ENV=production
NEXT_PUBLIC_ENV=production
```

**Deploy:**
```bash
git push origin main  # Auto-deploy na Vercel
```

---

## 🔄 Workflow Developerski

### 1. Praca Lokalna (Development)

```bash
# 1. Połącz się z VPS (opcjonalnie przez tunel)
ssh debian@141.95.16.164

# 2. Uruchom Supabase Local (jeśli nie działa)
cd /home/debian/projects/prawnik-ai
supabase start

# 3. Uruchom Next.js dev server
cd app-code
npm run dev

# 4. Otwórz w przeglądarce
# http://localhost:3000 (bezpośrednio na VPS)
# lub przez tunel SSH z lokalnego komputera
```

### 2. Testowanie Zmian

```bash
# Edytuj kod
# Zapisz plik → auto-reload

# Sprawdź w przeglądarce
# http://localhost:3000

# Sprawdź logi
# Terminal z `npm run dev`

# Sprawdź bazę danych
# http://localhost:54323 (Supabase Studio)
```

### 3. Deploy do Production

```bash
# 1. Commit zmian
git add .
git commit -m "feat: nowa funkcjonalność"

# 2. Push do GitHub
git push origin main

# 3. Vercel automatycznie deployuje
# Sprawdź: https://vercel.com/dashboard

# 4. Migracje bazy danych (jeśli potrzeba)
supabase db push --linked
```

---

## 🗄️ Zarządzanie Bazą Danych

### Development → Production (Migracje)

**1. Utwórz migrację lokalnie:**

```bash
cd /home/debian/projects/prawnik-ai

# Utwórz nową migrację
supabase migration new add_new_feature

# Edytuj plik w supabase/migrations/
nano supabase/migrations/YYYYMMDDHHMMSS_add_new_feature.sql

# Zastosuj lokalnie
supabase db reset
```

**2. Przetestuj lokalnie:**

```bash
# Sprawdź czy działa
npm run dev

# Test w Studio
open http://localhost:54323
```

**3. Deploy do Production:**

```bash
# Link do cloud (jednorazowo)
supabase link --project-ref tskfjodbbnaozfmctjne

# Push migracji
supabase db push

# Lub przez Dashboard:
# https://supabase.com/dashboard/project/tskfjodbbnaozfmctjne/editor
```

---

### Production → Development (Sync)

**Pobierz schema z produkcji:**

```bash
# Pull schema
supabase db pull

# Reset lokalnej bazy
supabase db reset
```

---

## 🔒 Bezpieczeństwo

### Secrets Management

**❌ NIGDY nie commituj:**
- `.env.local`
- `SUPABASE_CREDENTIALS.md`
- Hasła, klucze API

**✅ Gitignore:**

```gitignore
# Environment
.env.local
.env*.local
*.env

# Credentials
*CREDENTIALS*
*SECRET*
```

**✅ Vercel Secrets:**

Wszystkie zmienne produkcyjne w Vercel Dashboard:
- Settings → Environment Variables
- Oddzielne dla Production/Preview/Development

---

## 📊 Monitoring i Logi

### Development

**Logi Next.js:**
```bash
# Terminal z npm run dev
# Wszystkie logi w czasie rzeczywistym
```

**Logi Supabase:**
```bash
supabase logs
```

### Production

**Vercel:**
- Dashboard → Deployments → Logs
- Real-time logs
- Error tracking

**Supabase:**
- Dashboard → Logs
- API logs
- Database logs
- Auth logs

---

## 💰 Koszty (Szacunkowe)

### Development
- **VPS:** $5-20/mies (już masz)
- **Supabase Local:** $0 (Docker)
- **Total:** $5-20/mies

### Production (Start)
- **Vercel Hobby:** $0 (do 100GB bandwidth)
- **Supabase Free:** $0 (do 500MB DB, 2GB storage)
- **Total:** $0/mies

### Production (Wzrost)
- **Vercel Pro:** $20/mies (1TB bandwidth)
- **Supabase Pro:** $25/mies (8GB DB, 100GB storage)
- **Total:** $45/mies

---

## 🚀 Opcjonalne: Staging Environment

Jeśli projekt urośnie, rozważ dodanie **Staging**:

**Stack:**
- Frontend: Vercel (branch: `staging`)
- Database: Supabase Cloud (osobny projekt)

**Workflow:**
```
Development (VPS) → Staging (Cloud) → Production (Cloud)
```

**Konfiguracja Vercel:**
- Production: deploy z `main`
- Preview: deploy z `staging`
- Development: lokalnie

---

## 📝 Checklist Setup

### Development (VPS) ✅

- [x] Supabase Local uruchomiony
- [x] Next.js dev server działa
- [x] `.env.local` skonfigurowany
- [x] Migracje zastosowane
- [ ] Tunel SSH skonfigurowany (opcjonalnie)

### Production (Cloud) ⏳

- [ ] Vercel projekt utworzony
- [ ] GitHub repo połączone
- [ ] Environment variables ustawione
- [ ] Supabase Cloud połączony
- [ ] Migracje zdeployowane
- [ ] Custom domain (opcjonalnie)

---

## 🎯 Podsumowanie

**Twoja propozycja jest IDEALNA:**

✅ **Development:** VPS + Supabase Local  
✅ **Production:** Vercel + Supabase Cloud

**Dlaczego to działa:**
1. 🚀 Szybkie iteracje lokalnie
2. 💰 Niskie koszty na start
3. 📈 Łatwe skalowanie w przyszłości
4. 🔄 Czysty workflow (git-based)
5. 🔒 Bezpieczne (secrets w Vercel)

---

**Utworzono:** 2024-11-21  
**Status:** ✅ Rekomendowane
