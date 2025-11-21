#!/bin/bash
# Chrome DevTools MCP - Quick Start Script dla MacBooka
# Skopiuj ten skrypt na MacBooka i uruchom: bash chrome-mcp-quickstart.sh

set -e

echo "🚀 Chrome DevTools MCP - Quick Start"
echo "===================================="
echo ""

# Sprawdź czy Chrome istnieje
if [ ! -f "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome" ]; then
    echo "❌ Chrome nie znaleziony w /Applications/Google Chrome.app/"
    echo "   Zainstaluj Chrome lub podaj inną ścieżkę."
    exit 1
fi

# Zamknij istniejące instancje Chrome z remote debugging
echo "🔄 Zamykam istniejące instancje Chrome z remote debugging..."
pkill -f "Google Chrome.*remote-debugging" 2>/dev/null || true
sleep 2

# Usuń stary profil
echo "🧹 Czyszczę stary profil Chrome MCP..."
rm -rf /tmp/chrome-profile-mcp

# Uruchom Chrome z remote debugging
echo "🌐 Uruchamiam Chrome z remote debugging na porcie 9222..."
/Applications/Google\ Chrome.app/Contents/MacOS/Google\ Chrome \
  --remote-debugging-port=9222 \
  --user-data-dir=/tmp/chrome-profile-mcp \
  > /tmp/chrome-mcp.log 2>&1 &

CHROME_PID=$!
echo "   Chrome PID: $CHROME_PID"

# Poczekaj aż Chrome się uruchomi
echo "⏳ Czekam na uruchomienie Chrome..."
sleep 5

# Sprawdź czy Chrome faktycznie działa
if ! ps -p $CHROME_PID > /dev/null; then
    echo "❌ Chrome nie uruchomił się poprawnie!"
    echo "   Sprawdź logi: tail /tmp/chrome-mcp.log"
    exit 1
fi

# Sprawdź czy port 9222 odpowiada
echo "🔍 Sprawdzam czy port 9222 odpowiada..."
if curl -s http://127.0.0.1:9222/json/version > /dev/null; then
    echo "✅ Chrome remote debugging działa!"
    echo ""
    curl -s http://127.0.0.1:9222/json/version | python3 -m json.tool 2>/dev/null || cat
    echo ""
else
    echo "❌ Port 9222 nie odpowiada!"
    echo "   Sprawdź logi: tail /tmp/chrome-mcp.log"
    exit 1
fi

echo ""
echo "✅ Chrome gotowy! Teraz uruchom SSH tunnel..."
echo ""
echo "W nowym oknie terminala uruchom:"
echo "ssh -N -R 9222:localhost:9222 debian@141.95.16.164"
echo ""
echo "Lub naciśnij ENTER, aby automatycznie uruchomić tunnel..."
read -p "Kontynuować? [Y/n] " response

if [[ "$response" =~ ^[Nn]$ ]]; then
    echo "Przerwano. Chrome nadal działa (PID: $CHROME_PID)"
    echo "Aby zatrzymać Chrome: kill $CHROME_PID"
    exit 0
fi

echo ""
echo "🔗 Tworzę SSH reverse tunnel do serwera..."
echo "   (Naciśnij Ctrl+C aby zatrzymać)"
echo ""

# Sprawdź czy mamy dostęp do serwera
if ! ssh -o ConnectTimeout=5 -o BatchMode=yes debian@141.95.16.164 exit 2>/dev/null; then
    echo "⚠️  Nie mogę połączyć się z serwerem przez SSH bez hasła."
    echo "   Uruchom tunnel ręcznie w nowym oknie terminala:"
    echo ""
    echo "   ssh -N -R 9222:localhost:9222 debian@141.95.16.164"
    echo ""
    echo "Chrome nadal działa (PID: $CHROME_PID)"
    echo "Aby zatrzymać Chrome: kill $CHROME_PID"
    exit 0
fi

# Funkcja czyszcząca przy wyjściu
cleanup() {
    echo ""
    echo "🛑 Zatrzymuję Chrome i tunnel..."
    kill $CHROME_PID 2>/dev/null || true
    rm -rf /tmp/chrome-profile-mcp
    echo "✅ Wyczyszczono"
    exit 0
}

trap cleanup SIGINT SIGTERM

# Uruchom SSH tunnel
ssh -N -R 9222:localhost:9222 debian@141.95.16.164

# Ten kod nigdy się nie wykona, bo ssh -N działa w nieskończoność
# ale dla bezpieczeństwa:
cleanup
