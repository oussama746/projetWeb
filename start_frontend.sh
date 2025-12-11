#!/bin/bash

echo "🚀 Démarrage du frontend React..."
echo ""

# Aller dans le répertoire du projet
cd /home/nboulad/Partage_Unbuntu/projetWeb

# Vérifier que node_modules existe
if [ ! -d "node_modules" ]; then
    echo "�� Installation des dépendances..."
    npm install
fi

# Démarrer Vite
echo "⚛️  Démarrage de Vite..."
echo ""
echo "✅ Frontend prêt !"
echo "   URL : http://192.168.1.55:8080"
echo ""
echo "Pour arrêter : CTRL+C"
echo ""

npm run dev
