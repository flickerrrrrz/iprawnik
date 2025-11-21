#!/bin/bash
# Test połączenia Chrome DevTools MCP
# Uruchom na serwerze Debian po skonfigurowaniu SSH tunnel

echo "🧪 Test połączenia Chrome DevTools MCP"
echo "======================================"
echo ""

# Test 1: Sprawdź czy port 9222 odpowiada
echo "Test 1: Sprawdzanie portu 9222..."
if curl -s -m 5 http://127.0.0.1:9222/json/version > /dev/null 2>&1; then
    echo "✅ Port 9222 odpowiada!"
    echo ""
    echo "Informacje o przeglądarce:"
    curl -s http://127.0.0.1:9222/json/version | python3 -m json.tool 2>/dev/null || \
    curl -s http://127.0.0.1:9222/json/version
    echo ""
else
    echo "❌ Port 9222 nie odpowiada!"
    echo ""
    echo "Możliwe przyczyny:"
    echo "1. SSH tunnel nie jest aktywny"
    echo "2. Chrome na MacBooku nie działa z --remote-debugging-port=9222"
    echo "3. Firewall blokuje połączenie"
    echo ""
    echo "Na MacBooku sprawdź:"
    echo "   ps aux | grep 'remote-debugging-port'"
    echo "   curl http://127.0.0.1:9222/json/version"
    echo ""
    exit 1
fi

# Test 2: Sprawdź dostępne tabs/targets
echo "Test 2: Sprawdzanie dostępnych tabs..."
TABS=$(curl -s http://127.0.0.1:9222/json)
TAB_COUNT=$(echo "$TABS" | python3 -c "import sys, json; print(len(json.load(sys.stdin)))" 2>/dev/null || echo "?")
echo "   Znaleziono tabs/targets: $TAB_COUNT"
echo ""

# Test 3: Sprawdź czy npx i chrome-devtools-mcp są dostępne
echo "Test 3: Sprawdzanie dostępności chrome-devtools-mcp..."
if command -v npx > /dev/null; then
    echo "✅ npx jest dostępny"
    NPX_VERSION=$(npx --version 2>/dev/null || echo "unknown")
    echo "   Wersja: $NPX_VERSION"
else
    echo "❌ npx nie jest dostępny!"
    echo "   Zainstaluj Node.js i npm"
    exit 1
fi
echo ""

# Test 4: Sprawdź wersję Node.js
echo "Test 4: Sprawdzanie wersji Node.js..."
if command -v node > /dev/null; then
    NODE_VERSION=$(node --version)
    echo "✅ Node.js jest dostępny: $NODE_VERSION"
    
    # Sprawdź czy wersja jest >= v20
    NODE_MAJOR=$(echo $NODE_VERSION | cut -d'.' -f1 | sed 's/v//')
    if [ "$NODE_MAJOR" -ge 20 ]; then
        echo "   Wersja jest kompatybilna (>=20)"
    else
        echo "   ⚠️  Wersja może być za stara (wymagane >=20)"
    fi
else
    echo "❌ Node.js nie jest dostępny!"
    exit 1
fi
echo ""

# Test 5: Test uruchomienia chrome-devtools-mcp
echo "Test 5: Test uruchomienia chrome-devtools-mcp..."
echo "   (To może potrwać kilka sekund...)"
if timeout 10 npx -y chrome-devtools-mcp@latest --help > /dev/null 2>&1; then
    echo "✅ chrome-devtools-mcp działa poprawnie!"
else
    echo "⚠️  chrome-devtools-mcp może mieć problemy"
    echo "   Sprawdź: npx -y chrome-devtools-mcp@latest --help"
fi
echo ""

# Podsumowanie
echo "======================================"
echo "✅ Podsumowanie:"
echo ""
echo "Jeśli wszystkie testy przeszły, możesz teraz:"
echo "1. Zrestartować Windsurf MCP servers"
echo "2. W Windsurf Cascade napisać:"
echo "   'Check the performance of https://developers.chrome.com'"
echo ""
echo "Windsurf powinien połączyć się z Chrome na twoim MacBooku!"
echo ""
echo "======================================"
