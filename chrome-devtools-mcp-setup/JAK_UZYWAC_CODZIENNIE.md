# Chrome DevTools MCP - Instrukcja Codzienna

## ❓ Czy będzie działać zawsze?

**NIE** - wymaga aktywnego połączenia z MacBookiem.

Chrome DevTools MCP działa **TYLKO gdy:**
1. ✅ Chrome z remote debugging działa na MacBooku
2. ✅ SSH tunnel jest aktywny (MacBook → Serwer)
3. ✅ Windsurf MCP jest uruchomiony

**Jeśli którykolwiek element się wyłączy - przestanie działać.**

---

## 🔄 Codzienne Użycie

### 🟢 START (na początku pracy)

#### Na MacBooku - Terminal 1:
```bash
# Uruchom Chrome z remote debugging
/Applications/Google\ Chrome.app/Contents/MacOS/Google\ Chrome \
  --remote-debugging-port=9222 \
  --user-data-dir=/tmp/chrome-profile-mcp
```

**Co się stanie:**
- Otworzy się nowe okno Chrome (czyste, bez historii)
- To okno MUSI pozostać otwarte
- Nie zamykaj tego Chrome!

#### Na MacBooku - Terminal 2:
```bash
# Uruchom SSH tunnel
ssh -N -R 9222:localhost:9222 debian@141.95.16.164
```

**Co się stanie:**
- Terminal się "zawiesi" - to NORMALNE
- Połączenie jest aktywne
- NIE zamykaj tego terminala!

#### Na serwerze (Windsurf):
- Windsurf automatycznie połączy się z Chrome
- Jeśli nie - zrestartuj Windsurf

---

### 🔴 STOP (koniec pracy)

#### Na MacBooku:
```bash
# 1. Ctrl+C w terminalu z SSH tunnel

# 2. Zamknij Chrome MCP
pkill -f "Google Chrome.*remote-debugging"
```

**Gotowe!** Możesz zamknąć terminale.

---

## ⚡ Szybki Start (skrypt)

Możesz użyć skryptu automatycznego na MacBooku:

```bash
# Skopiuj skrypt z serwera na MacBooka
scp debian@141.95.16.164:~/projects/prawnik-ai/chrome-devtools-mcp-setup/chrome-mcp-quickstart.sh ~/

# Uruchom
bash ~/chrome-mcp-quickstart.sh
```

**Skrypt automatycznie:**
- Zamknie stare instancje
- Uruchomi Chrome
- Ustawi SSH tunnel
- Sprawdzi czy działa

---

## 🧪 Jak sprawdzić czy działa?

### Szybki test na serwerze:
```bash
cd ~/projects/prawnik-ai/chrome-devtools-mcp-setup
bash test-chrome-mcp-connection.sh
```

**Jeśli wszystkie testy ✅ - działa!**

### Test w Windsurf Cascade:
```
list available pages in Chrome
```

Jeśli zobaczysz listę stron - działa!

---

## ❌ Co się stanie jeśli zamknę...

### ...Chrome na MacBooku?
**Przestanie działać.** Musisz uruchomić ponownie (Terminal 1).

### ...Terminal z SSH tunnel?
**Przestanie działać.** Musisz uruchomić ponownie (Terminal 2).

### ...Windsurf?
**Zadziała po restarcie.** SSH i Chrome działają niezależnie.

### ...MacBooka (sleep/restart)?
**Wszystko przestanie działać.** Musisz uruchomić od nowa (Terminal 1 + 2).

---

## 🔧 Troubleshooting

### Problem: "Connection refused" w Windsurf
**Rozwiązanie:**
```bash
# Na MacBooku sprawdź:
ps aux | grep "ssh.*9222"
ps aux | grep "remote-debugging"

# Jeśli któryś nie działa - uruchom ponownie
```

### Problem: MCP nie widzi Chrome
**Rozwiązanie:**
```bash
# Na serwerze:
curl http://127.0.0.1:9222/json/version

# Jeśli "Connection refused" - SSH tunnel nie działa
# Uruchom ponownie Terminal 2 na MacBooku
```

### Problem: Chrome się zawiesił
**Rozwiązanie:**
```bash
# Na MacBooku:
pkill -f "Google Chrome.*remote-debugging"

# Uruchom ponownie Terminal 1
```

---

## 💡 Porady

### 1. Używaj osobnych terminali
- **Terminal 1:** Chrome (możesz zminimalizować)
- **Terminal 2:** SSH tunnel (możesz zminimalizować)
- **Terminal 3:** Normalna praca

### 2. Nie przeglądaj w Chrome MCP
Ten Chrome jest TYLKO dla MCP. Używaj normalnego Chrome do przeglądania.

### 3. Sprawdzaj status przed pracą
```bash
# Na MacBooku - szybki check:
ps aux | grep -E "(ssh.*9222|remote-debugging)" | grep -v grep
```

Jeśli widzisz 2 procesy - działa!

### 4. Automatyzacja (opcjonalnie)
Możesz dodać do `~/.zshrc` lub `~/.bashrc` na MacBooku:

```bash
alias chrome-mcp-start='bash ~/chrome-mcp-quickstart.sh'
alias chrome-mcp-stop='pkill -f "ssh.*9222"; pkill -f "Google Chrome.*remote-debugging"'
alias chrome-mcp-status='ps aux | grep -E "(ssh.*9222|remote-debugging)" | grep -v grep'
```

Wtedy:
- `chrome-mcp-start` - uruchamia wszystko
- `chrome-mcp-stop` - zatrzymuje wszystko
- `chrome-mcp-status` - sprawdza status

---

## 📊 Typowy Dzień Pracy

```
08:00 - Włączam MacBooka
08:01 - Uruchamiam chrome-mcp-start
08:02 - Otwieram Windsurf na serwerze
08:03 - Testuję: "list available pages in Chrome"
08:04 - ✅ Działa! Zaczynam pracę

...praca z MCP przez cały dzień...

18:00 - Kończę pracę
18:01 - chrome-mcp-stop
18:02 - Zamykam Windsurf
```

---

## 🎯 Podsumowanie

**TAK, musisz uruchamiać połączenie przed każdym użyciem.**

**Ale to tylko 2 komendy na MacBooku:**
1. Chrome z remote debugging
2. SSH tunnel

**Raz uruchomione - działa przez cały dzień!**

---

## 📁 Przydatne pliki

- `test-chrome-mcp-connection.sh` - test połączenia
- `chrome-mcp-quickstart.sh` - automatyczny start (skopiuj na MacBooka)
- `SUKCES_FINAL.md` - pełna dokumentacja

---

**Utworzono:** 2024-11-17 20:15 UTC
