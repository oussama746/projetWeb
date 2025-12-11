# Filtres Avancés - Documentation

## 🎯 Nouveautés

Les filtres avancés ont été ajoutés à l'application pour permettre une recherche plus précise des offres de stage.

## 📋 Nouveaux champs

### Dans le modèle `StageOffer`

1. **Ville** (`city`) - CharField (100 caractères max)
   - Permet de spécifier la localisation du stage
   - Exemple: Paris, Lyon, Marseille...

2. **Durée** (`duration`) - ChoiceField
   - Options disponibles:
     - 1-3 mois
     - 3-6 mois  
     - 6+ mois

3. **Domaine** (`domain`) - ChoiceField
   - Options disponibles:
     - Développement Web
     - Développement Mobile
     - Data Science
     - Cybersécurité
     - DevOps
     - IA/Machine Learning
     - Réseau
     - Base de données
     - Cloud Computing
     - Autre

4. **Télétravail** (`remote`) - BooleanField
   - Indique si le stage peut être effectué en télétravail
   - Par défaut: False

## 🔍 Utilisation des filtres

### Dans le formulaire de création d'offre (Companies.tsx)

Les entreprises peuvent maintenant renseigner ces informations lors du dépôt d'une offre :
- Ville (champ texte libre)
- Durée (sélection parmi les options)
- Domaine (sélection parmi les options)
- Télétravail possible (case à cocher)

### Dans la page de recherche (Internships.tsx)

Les étudiants peuvent filtrer les offres selon :
- **Recherche textuelle** : titre, entreprise, description
- **Ville** : recherche par nom de ville (insensible à la casse)
- **Durée** : sélection exacte parmi les options
- **Domaine** : sélection exacte parmi les options
- **Télétravail** : Oui / Non / Tous

Les filtres sont combinés (ET logique) pour affiner les résultats.

## 🎨 Interface

### Bouton Filtres
- Un bouton "Filtres" avec icône a été ajouté dans la barre de recherche
- Affiche/masque un panneau de filtres avancés

### Affichage dans les cartes d'offres
Les nouveaux champs sont affichés sous forme de badges :
- 📍 Ville (badge outline)
- 📅 Durée (badge outline)
- 🎯 Domaine (badge outline)
- 🏠 Remote (badge secondary si applicable)

## 🔧 Backend

### API Endpoints
L'endpoint `/api/offers/` accepte maintenant les paramètres de requête suivants :
- `search` : recherche textuelle
- `city` : filtre par ville
- `duration` : filtre par durée
- `domain` : filtre par domaine
- `remote` : true/false pour le télétravail

Exemple :
```
GET /api/offers/?city=Paris&domain=Développement Web&remote=true
```

### Migrations
Une migration a été créée pour ajouter les nouveaux champs :
```
stages/migrations/0005_stageoffer_city_stageoffer_domain_and_more.py
```

## 📊 Données de test

Un script `update_offers_with_filters.py` a été créé pour ajouter des données d'exemple aux offres existantes :
- Villes aléatoires parmi 10 grandes villes françaises
- Durées aléatoires
- Domaines aléatoires
- 30% de chance d'être en télétravail

Pour l'exécuter :
```bash
python update_offers_with_filters.py
```

## ✅ Avantages

1. **Meilleure expérience utilisateur** : Les étudiants trouvent plus facilement des stages correspondant à leurs critères
2. **Information plus complète** : Les entreprises peuvent mieux décrire leurs offres
3. **Filtrage performant** : Recherche optimisée côté backend
4. **Interface intuitive** : Filtres faciles à utiliser et à combiner
