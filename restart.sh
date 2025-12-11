#!/bin/bash

echo "🔄 Redémarrage du projet..."

# Tuer tous les processus Django et Vite
echo "🛑 Arrêt des processus existants..."
pkill -f "manage.py runserver"
pkill -f "vite"
lsof -ti:8000 | xargs kill -9 2>/dev/null
lsof -ti:5173 | xargs kill -9 2>/dev/null
sleep 2

echo "✅ Processus arrêtés"
echo ""
echo "🚀 Pour démarrer, utilisez:"
echo "   ./start.sh"
