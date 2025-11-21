# Chrome DevTools MCP - Dokumentacja

## 📁 Zawartość Folderu

### 📚 Dokumentacja
- **`JAK_UZYWAC_CODZIENNIE.md`** - ⭐ Główna instrukcja użytkowania (START/STOP, troubleshooting)
- **`SUKCES_FINAL.md`** - Podsumowanie konfiguracji i quick reference
- **`README.md`** - Ten plik (spis treści)

### 🔧 Narzędzia
- **`chrome-mcp-quickstart.sh`** - Skrypt automatyczny dla MacBooka (skopiuj i uruchom)
- **`test-chrome-mcp-connection.sh`** - Test połączenia na serwerze
- **`mcp-chrome-devtools-config.json`** - Przykładowa konfiguracja MCP

---

## 🚀 Quick Start

### Na MacBooku (2 terminale):

**Terminal 1:**
```bash
/Applications/Google\ Chrome.app/Contents/MacOS/Google\ Chrome \
  --remote-debugging-port=9222 \
  --user-data-dir=/tmp/chrome-profile-mcp
```

**Terminal 2:**
```bash
ssh -N -R 9222:localhost:9222 debian@141.95.16.164
```

### Na serwerze (test):
```bash
bash test-chrome-mcp-connection.sh
```

### W Windsurf Cascade:
```
Check the performance of https://developers.chrome.com
```

---

## 📖 Czytaj dalej

- **Codzienna praca?** → `JAK_UZYWAC_CODZIENNIE.md`
- **Konfiguracja MCP?** → `SUKCES_FINAL.md`
- **Automatyzacja?** → `chrome-mcp-quickstart.sh`

---

**Status:** ✅ Skonfigurowane i działające  
**Utworzono:** 2024-11-17
