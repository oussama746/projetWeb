# Implémentation des Filtres Avancés

## ✅ Fonctionnalités Implémentées

### Backend Django
- **Modèle StageOffer** mis à jour avec les champs :
  - `city` : Ville du stage (CharField)
  - `duration` : Durée (choices : "1-3 mois", "3-6 mois", "6+ mois")
  - `domain` : Domaine (choices : Développement Web, Mobile, Data Science, etc.)
  - `remote` : Télétravail possible (BooleanField)

- **API Django** (`stages/api_views.py`) :
  - Filtrage par `search` (titre, description, organisme)
  - Filtrage par `city` (contains)
  - Filtrage par `duration` (exact match)
  - Filtrage par `domain` (exact match)
  - Filtrage par `remote` (true/false)

### Frontend React
- **Interface utilisateur** (`src/pages/Internships.tsx`) :
  - Barre de recherche textuelle
  - Bouton "Filtres" pour afficher/masquer les filtres avancés
  - 4 filtres disponibles :
    - Ville (champ texte)
    - Durée (select)
    - Domaine (select)
    - Télétravail (select oui/non)
  - Bouton "Appliquer les filtres"
  - Bouton "Réinitialiser" pour effacer les filtres

- **Affichage des offres** :
  - Badges pour ville (🗺️)
  - Badges pour durée (📅)
  - Badges pour domaine
  - Badge "🏠 Remote" si télétravail

## 🔧 API Endpoints

### Recherche et filtres
```
GET /api/offers/
GET /api/offers/?search=Django
GET /api/offers/?city=Paris
GET /api/offers/?duration=3-6 mois
GET /api/offers/?domain=Développement Web
GET /api/offers/?remote=true
GET /api/offers/?search=Stage&city=Lyon&duration=3-6 mois
```

## 📝 Utilisation

1. **Pour créer une offre avec les nouveaux champs** :
   - Les champs sont maintenant disponibles dans le formulaire de création d'offre
   - Tous les champs sont optionnels

2. **Pour rechercher** :
   - Tapez dans la barre de recherche et cliquez sur "Rechercher"
   - OU utilisez les filtres avancés et cliquez sur "Appliquer les filtres"

3. **Pour réinitialiser** :
   - Cliquez sur "Réinitialiser" dans les filtres avancés

## ⚠️ Notes

- Les filtres sont cumulatifs (ET logique)
- La recherche textuelle fonctionne sur : titre, description, organisme
- Le filtrage par ville est insensible à la casse et partiel (contains)
- Les migrations ont été appliquées automatiquement
