#!/bin/bash

echo "🚀 Démarrage du serveur Django..."
echo ""

# Aller dans le répertoire du projet
cd /home/nboulad/Partage_Unbuntu/projetWeb

# Activer l'environnement virtuel Python
echo "📦 Activation de l'environnement virtuel..."
source venv/bin/activate

# Vérifier les groupes
echo "🔧 Vérification des groupes..."
python manage.py init_groups > /dev/null 2>&1

# Appliquer les migrations
echo "🗄️  Application des migrations..."
python manage.py migrate > /dev/null 2>&1

# Démarrer Django sur toutes les interfaces réseau
echo "🌐 Démarrage de Django sur http://0.0.0.0:8000"
echo "   (Accessible sur http://192.168.1.55:8000)"
echo ""
echo "✅ Backend prêt !"
echo "   API : http://192.168.1.55:8000/api/"
echo "   Admin : http://192.168.1.55:8000/admin/"
echo ""
echo "Pour arrêter : CTRL+C"
echo ""

# Lancer Django
python manage.py runserver 0.0.0.0:8000
