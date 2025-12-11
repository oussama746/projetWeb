#!/usr/bin/env python
"""
Script pour ajouter les nouveaux champs (ville, durée, domaine, remote) aux offres existantes
"""
import os
import sys
import django
import random

# Setup Django
sys.path.append(os.path.dirname(os.path.abspath(__file__)))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from stages.models import StageOffer

# Données d'exemple
cities = ['Paris', 'Lyon', 'Marseille', 'Toulouse', 'Bordeaux', 'Lille', 'Nantes', 'Strasbourg', 'Montpellier', 'Nice']
durations = ['1-3 mois', '3-6 mois', '6+ mois']
domains = [
    'Développement Web',
    'Développement Mobile', 
    'Data Science',
    'Cybersécurité',
    'DevOps',
    'IA/Machine Learning',
    'Réseau',
    'Base de données',
    'Cloud Computing',
]

def update_offers():
    """Met à jour toutes les offres avec des données aléatoires"""
    offers = StageOffer.objects.all()
    
    for offer in offers:
        # Ne mettre à jour que si les champs sont vides
        if not offer.city:
            offer.city = random.choice(cities)
        if not offer.duration:
            offer.duration = random.choice(durations)
        if not offer.domain:
            offer.domain = random.choice(domains)
        # 30% de chance d'être en remote
        offer.remote = random.random() < 0.3
        
        offer.save()
        print(f"✅ Offre '{offer.title}' mise à jour: {offer.city}, {offer.duration}, {offer.domain}, Remote: {offer.remote}")
    
    print(f"\n🎉 {offers.count()} offres mises à jour avec succès!")

if __name__ == '__main__':
    print("🚀 Mise à jour des offres avec les nouveaux champs...")
    update_offers()
