#!/bin/bash

echo "🚀 Démarrage du serveur Django en mode LOCAL..."

# Activer l'environnement virtuel
source venv/bin/activate

# Appliquer les migrations
echo "📦 Application des migrations..."
python manage.py migrate

# Créer les groupes si nécessaire
echo "👥 Création des groupes utilisateurs..."
python manage.py init_groups

# Collecter les fichiers statiques
echo "📁 Collecte des fichiers statiques..."
python manage.py collectstatic --noinput || echo "⚠️  Erreur collectstatic (non critique)"

# Lancer le serveur sur localhost uniquement
echo "🌐 Lancement du serveur Django sur http://localhost:8000"
python manage.py runserver localhost:8000
