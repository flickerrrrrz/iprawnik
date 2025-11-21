# Instrukcja: Tunelowanie Portów dla Lokalnego Windsurf

## 🎯 Cel

Umożliwienie lokalnemu Windsurf (na Twoim komputerze) dostępu do serwera VPS poprzez tunelowanie portów SSH.

---

## 📋 Wymagania

1. **Lokalny komputer** z zainstalowanym:
   - Windsurf IDE
   - SSH client (domyślnie w macOS/Linux, PuTTY w Windows)
   - Git (opcjonalnie)

2. **Serwer VPS** (141.95.16.164):
   - Dostęp SSH jako użytkownik `debian`
   - Uruchomione usługi:
     - Next.js dev server (port 3000)
     - Supabase local (porty 54321-54324)

---

## 🔧 Konfiguracja Tunelowania Portów

### Opcja 1: SSH Forward Tunnel (Zalecane)

**Na lokalnym komputerze uruchom:**

```bash
ssh -L 3000:localhost:3000 \
    -L 54321:localhost:54321 \
    -L 54322:localhost:54322 \
    -L 54323:localhost:54323 \
    -L 54324:localhost:54324 \
    debian@141.95.16.164
```

**Co to robi:**
- `-L 3000:localhost:3000` - przekierowuje lokalny port 3000 → serwer port 3000 (Next.js)
- `-L 54321:localhost:54321` - Supabase API
- `-L 54322:localhost:54322` - Supabase Database
- `-L 54323:localhost:54323` - Supabase Studio
- `-L 54324:localhost:54324` - Supabase Mailpit

**Po połączeniu:**
- `http://localhost:3000` → Next.js na serwerze
- `http://localhost:54321` → Supabase API na serwerze
- `http://localhost:54323` → Supabase Studio na serwerze

---

### Opcja 2: SSH Config (Wygodniejsze)

**Edytuj plik `~/.ssh/config`:**

```bash
nano ~/.ssh/config
```

**Dodaj konfigurację:**

```
Host prawnik-dev
    HostName 141.95.16.164
    User debian
    LocalForward 3000 localhost:3000
    LocalForward 54321 localhost:54321
    LocalForward 54322 localhost:54322
    LocalForward 54323 localhost:54323
    LocalForward 54324 localhost:54324
    ServerAliveInterval 60
    ServerAliveCountMax 3
```

**Teraz wystarczy:**

```bash
ssh prawnik-dev
```

---

### Opcja 3: Autossh (Automatyczne Reconnect)

**Instalacja:**

```bash
# macOS
brew install autossh

# Linux
sudo apt install autossh
```

**Uruchomienie:**

```bash
autossh -M 0 -f -N \
    -L 3000:localhost:3000 \
    -L 54321:localhost:54321 \
    -L 54322:localhost:54322 \
    -L 54323:localhost:54323 \
    -L 54324:localhost:54324 \
    -o "ServerAliveInterval 60" \
    -o "ServerAliveCountMax 3" \
    debian@141.95.16.164
```

**Parametry:**
- `-M 0` - wyłącz monitoring port
- `-f` - uruchom w tle
- `-N` - nie wykonuj komend (tylko tunnel)
- `-o "ServerAliveInterval 60"` - keep-alive co 60s

**Zatrzymanie:**

```bash
pkill -f "autossh.*141.95.16.164"
```

---

## 🚀 Konfiguracja Windsurf

### 1. Otwórz Projekt Lokalnie

**Sklonuj projekt (jeśli jeszcze nie masz):**

```bash
# Przez SSH
git clone git@github.com:flickerrrrrr/iprawnik.git ~/prawnik-ai-local

# Lub przez HTTPS
git clone https://github.com/flickerrrrrr/iprawnik.git ~/prawnik-ai-local
```

### 2. Skonfiguruj .env.local

**Utwórz plik `~/prawnik-ai-local/app-code/.env.local`:**

```bash
# Supabase Configuration (Lokalny tunel do serwera VPS)
NEXT_PUBLIC_SUPABASE_URL=http://localhost:54321
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=sb_publishable_ACJWlzQHlZjBrEguHvfOxg_3BJgxAaH

# Server-side only
SUPABASE_SECRET_KEY=sb_secret_N7UND0UgjKTVK-Uodkm0Hg_xSvEMPvz
SUPABASE_DB_PASSWORD=postgres

# Database Connection (przez tunel)
DATABASE_URL=postgresql://postgres:postgres@localhost:54322/postgres
```

### 3. Otwórz Windsurf

```bash
cd ~/prawnik-ai-local
code .  # lub otwórz przez Windsurf GUI
```

---

## 🧪 Test Połączenia

### 1. Sprawdź Tunele SSH

```bash
# Lista aktywnych tuneli
lsof -i :3000
lsof -i :54321
lsof -i :54323

# Lub (Linux)
ss -tlnp | grep -E "3000|54321|54323"
```

### 2. Test HTTP

```bash
# Next.js
curl -I http://localhost:3000

# Supabase API
curl http://localhost:54321/rest/v1/

# Supabase Studio
curl -I http://localhost:54323
```

### 3. Test w Przeglądarce

- **Next.js App:** http://localhost:3000
- **Supabase Studio:** http://localhost:54323

---

## 📊 Workflow Codzienny

### Start Pracy

**Terminal 1 - SSH Tunnel:**
```bash
ssh prawnik-dev
# Lub z autossh
```

**Terminal 2 - Windsurf:**
```bash
cd ~/prawnik-ai-local
code .
```

**W Windsurf:**
- Otwórz plik
- Edytuj kod
- Zapisz (auto-reload na serwerze)
- Sprawdź w przeglądarce: http://localhost:3000

### Koniec Pracy

```bash
# Zamknij SSH (Ctrl+D lub exit)
# Lub zatrzymaj autossh:
pkill -f "autossh.*141.95.16.164"
```

---

## 🔧 Troubleshooting

### Problem: "Port already in use"

**Rozwiązanie:**
```bash
# Znajdź proces
lsof -ti:3000

# Zabij proces
kill -9 $(lsof -ti:3000)

# Lub wszystkie tunele
pkill -f "ssh.*141.95.16.164"
```

### Problem: "Connection refused"

**Sprawdź:**
1. Czy serwer VPS działa?
   ```bash
   ssh debian@141.95.16.164 "systemctl status"
   ```

2. Czy Next.js działa na serwerze?
   ```bash
   ssh debian@141.95.16.164 "curl -I http://localhost:3000"
   ```

3. Czy Supabase działa na serwerze?
   ```bash
   ssh debian@141.95.16.164 "supabase status"
   ```

### Problem: Tunnel się rozłącza

**Użyj autossh** (patrz Opcja 3) lub dodaj do `~/.ssh/config`:

```
Host prawnik-dev
    ...
    ServerAliveInterval 60
    ServerAliveCountMax 3
    TCPKeepAlive yes
```

---

## 💡 Porady

### 1. Alias dla Szybkiego Startu

**Dodaj do `~/.zshrc` lub `~/.bashrc`:**

```bash
alias prawnik-tunnel='autossh -M 0 -f -N -L 3000:localhost:3000 -L 54321:localhost:54321 -L 54322:localhost:54322 -L 54323:localhost:54323 -L 54324:localhost:54324 debian@141.95.16.164'
alias prawnik-stop='pkill -f "autossh.*141.95.16.164"'
alias prawnik-status='lsof -i :3000 && lsof -i :54321'
```

**Użycie:**
```bash
prawnik-tunnel  # Start
prawnik-status  # Sprawdź
prawnik-stop    # Stop
```

### 2. VS Code Remote SSH (Alternatywa)

Zamiast tunelowania możesz użyć **VS Code Remote SSH**:

1. Zainstaluj rozszerzenie: "Remote - SSH"
2. Połącz się z serwerem: `debian@141.95.16.164`
3. Otwórz folder: `/home/debian/projects/prawnik-ai`
4. Pracuj bezpośrednio na serwerze

**Zalety:**
- Brak tunelowania
- Bezpośredni dostęp do plików
- Terminal na serwerze

**Wady:**
- Wymaga stałego połączenia
- Wolniejsze przy słabym internecie

---

## 📁 Struktura Plików

```
~/prawnik-ai-local/          # Lokalny klon (opcjonalnie)
├── app-code/
│   ├── .env.local           # Konfiguracja tuneli
│   └── ...
└── ...

/home/debian/projects/prawnik-ai/  # Serwer VPS
├── app-code/
│   ├── .env.local           # Konfiguracja lokalna Supabase
│   └── ...
└── ...
```

---

**Utworzono:** 2024-11-21  
**Status:** ✅ Gotowe do użycia
