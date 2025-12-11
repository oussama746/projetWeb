#!/bin/bash

echo "🚀 Démarrage du projet Gestion des Stages..."
echo ""

# Tuer les processus existants
echo "🛑 Nettoyage des processus existants..."
pkill -f "manage.py runserver" 2>/dev/null
pkill -f "vite" 2>/dev/null
lsof -ti:8000 | xargs kill -9 2>/dev/null
lsof -ti:5173 | xargs kill -9 2>/dev/null
sleep 2

# Activer l'environnement virtuel Python
echo "📦 Activation de l'environnement virtuel Python..."
source venv/bin/activate

# Initialize groups if needed
echo "🔧 Vérification des groupes d'utilisateurs..."
python manage.py init_groups > /dev/null 2>&1

# Run migrations
echo "🗄️  Application des migrations..."
python manage.py migrate > /dev/null 2>&1

# Lancer le backend Django en arrière-plan
echo "🐍 Démarrage du backend Django API (http://localhost:8000)..."
python manage.py runserver 0.0.0.0:8000 &
DJANGO_PID=$!

# Attendre que Django démarre
sleep 3

# Lancer le frontend React/Vite
echo "⚛️  Démarrage du frontend React (http://localhost:5173)..."
echo ""
echo "✅ Application prête !"
echo "   Frontend: http://localhost:5173"
echo "   Backend API: http://localhost:8000/api"
echo "   Django Admin: http://localhost:8000/admin"
echo ""
npm run dev

# Quand le frontend s'arrête, arrêter aussi Django
echo ""
echo "🛑 Arrêt du backend Django..."
kill $DJANGO_PID

echo "✅ Projet arrêté"
