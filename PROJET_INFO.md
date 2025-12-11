# 📋 Informations Projet - Gestion des Stages IUT Orsay

## 🎯 Résumé du Projet

Application web complète permettant la gestion des offres de stages et des candidatures pour l'IUT d'Orsay, conforme au cahier des charges R5A05.

## 🏗️ Architecture Technique

### Backend
- **Framework**: Django 6.0
- **API**: Django REST Framework 3.16.1
- **Base de données**: SQLite (db.sqlite3)
- **Authentification**: Session-based avec groupes d'utilisateurs

### Frontend
- **Framework**: React 18.3.1 avec TypeScript
- **Build Tool**: Vite 5.4
- **UI Library**: shadcn/ui + Radix UI
- **Styling**: Tailwind CSS 3.4
- **Routing**: React Router DOM 6.30
- **Charts**: Recharts 2.15 (pour statistiques admin)

## 📂 Structure du Projet

```
projetWeb/
├── config/                 # Configuration Django
│   ├── settings.py        # Settings avec CORS et DRF
│   └── urls.py            # URLs principales
├── stages/                # Application Django
│   ├── models.py          # StageOffer, Candidature, StudentProfile
│   ├── serializers.py     # Serializers DRF
│   ├── api_views.py       # ViewSets et endpoints API
│   ├── api_urls.py        # Routes API
│   ├── views.py           # Vues Django template (legacy)
│   └── management/commands/
│       ├── init_groups.py       # Initialise les groupes
│       └── create_test_data.py  # Crée les données de test
├── src/                   # Frontend React
│   ├── components/        # Composants UI réutilisables
│   ├── pages/            # Pages de l'application
│   ├── lib/
│   │   └── api.ts        # Client API TypeScript
│   └── App.tsx           # Composant racine
├── db.sqlite3            # Base de données
├── start.sh              # Script de démarrage
├── requirements.txt      # Dépendances Python
└── package.json          # Dépendances Node.js
```

## 🔐 Modèles de Données

### StageOffer
- organisme (CharField)
- contact_name (CharField)
- contact_email (EmailField)
- date_depot (DateTimeField, auto)
- title (CharField)
- description (TextField)
- state (CharField: En attente validation, Validée, Refusée, Clôturée)
- closing_reason (CharField, optional)
- company (ForeignKey to User, optional)

### Candidature
- offer (ForeignKey to StageOffer)
- student (ForeignKey to User)
- date_candidature (DateTimeField, auto)
- status (CharField: En attente, Acceptée, Refusée)
- Contrainte: unique_together (student, offer)

### StudentProfile
- user (OneToOneField to User)
- bio (TextField)
- cv (FileField)
- phone (CharField)

## 👥 Groupes d'Utilisateurs

1. **Etudiant**: Consultation et candidature aux offres
2. **Entreprise**: Dépôt et gestion des offres
3. **Responsable**: Validation/refus des offres
4. **Administrateur**: Gestion complète + statistiques

## 🔌 Endpoints API

### Authentification
- `POST /api/auth/register/` - Inscription (body: username, email, password, role)
- `POST /api/auth/login/` - Connexion (body: username, password)
- `POST /api/auth/logout/` - Déconnexion
- `GET /api/auth/me/` - Utilisateur connecté

### Offres
- `GET /api/offers/` - Liste des offres (filtrée par rôle)
- `GET /api/offers/?search=terme` - Recherche
- `POST /api/offers/` - Créer une offre (public)
- `GET /api/offers/{id}/` - Détails d'une offre
- `PATCH /api/offers/{id}/` - Modifier une offre
- `DELETE /api/offers/{id}/` - Supprimer une offre
- `POST /api/offers/{id}/apply/` - Candidater (étudiant)
- `POST /api/offers/{id}/validate_offer/` - Valider/refuser (responsable)
- `GET /api/offers/{id}/candidates/` - Liste des candidats

### Candidatures
- `GET /api/candidatures/` - Mes candidatures (étudiant) ou toutes (admin)
- `POST /api/candidatures/{id}/withdraw/` - Retirer candidature
- `POST /api/candidatures/{id}/update_status/` - Modifier statut (entreprise/admin)

### Tableau de bord
- `GET /api/dashboard/stats/` - Statistiques (admin/responsable)

## 🎨 Fonctionnalités Implémentées

### ✅ Exigences du Cahier des Charges

#### Entreprises
- [x] Dépôt d'offre sans authentification
- [x] Dépôt d'offre avec compte entreprise
- [x] Gestion des candidatures reçues

#### Responsables
- [x] Liste des offres en attente
- [x] Recherche sur toutes les offres
- [x] Consultation du détail d'une offre
- [x] Validation/refus des offres

#### Étudiants
- [x] Liste des offres validées
- [x] Recherche sur les offres
- [x] Consultation du détail
- [x] Candidature (max 5 par offre)
- [x] Clôture automatique à 5 candidats
- [x] Gestion de leurs candidatures
- [x] Profil étudiant (bio, CV, téléphone)

#### Administrateurs
- [x] Liste de toutes les offres
- [x] Recherche globale
- [x] Consultation des détails
- [x] Changement d'état (même clôturées)
- [x] Tableau de bord visuel
- [x] Statistiques d'activité
- [x] Nombre d'offres par état
- [x] Candidatures par mois (12 derniers mois)
- [x] Gestion des utilisateurs

### 🎁 Fonctionnalités Bonus

- [x] Interface React moderne et responsive
- [x] API REST complète avec DRF
- [x] Authentification basée sur sessions
- [x] Protection CSRF
- [x] CORS configuré pour le développement
- [x] Retrait de candidature par l'étudiant
- [x] Réouverture automatique d'une offre clôturée si retrait
- [x] Statuts de candidatures (En attente, Acceptée, Refusée)
- [x] Entreprises peuvent gérer leurs candidatures
- [x] Export potentiel des candidatures
- [x] Profil étudiant avec CV uploadable
- [x] Charts interactifs (recharts)
- [x] Commandes management pour init et test data

## 🚀 Démarrage

### Méthode Simple
```bash
./start.sh
```

### Méthode Manuelle

**Terminal 1 - Backend**
```bash
source venv/bin/activate
python manage.py migrate
python manage.py init_groups
python manage.py create_test_data  # Données de démo
python manage.py runserver
```

**Terminal 2 - Frontend**
```bash
npm install
npm run dev
```

## 🧪 Comptes de Test

| Rôle | Username | Password |
|------|----------|----------|
| Admin | admin | admin123 |
| Responsable | responsable | resp123 |
| Entreprise 1 | techcorp | entr123 |
| Entreprise 2 | datasolutions | entr123 |
| Entreprise 3 | webagency | entr123 |
| Étudiant 1-7 | etudiant1-7 | etud123 |

## 📊 Données de Démonstration

La commande `create_test_data` génère :
- 1 administrateur
- 1 responsable
- 3 entreprises
- 7 étudiants avec profils
- 8 offres de stage (divers états)
- Plusieurs candidatures

## 🔒 Sécurité

- Authentification requise pour la plupart des endpoints
- Permissions par groupe d'utilisateurs
- CSRF protection activée
- Validation des données (serializers)
- Gestion des erreurs
- Sessions sécurisées

## 🎯 Conformité Cahier des Charges

| Critère | État |
|---------|------|
| Complétude fonctionnelle | ✅ 100% |
| Ergonomie web moderne | ✅ React + Tailwind |
| Maintenabilité du code | ✅ TypeScript + Comments |
| Robustesse et sécurité | ✅ DRF + Permissions |
| Base de démonstration | ✅ Cohérente et réaliste |
| Fonctionnalités bonus | ✅ Multiples ajouts |

## 📝 Notes Techniques

- **CORS**: Configuré pour localhost:5173 (dev)
- **Media Files**: Uploads dans /media/ (CVs)
- **Static Files**: Frontend build dans /dist/
- **Timezone**: UTC avec USE_TZ=True
- **Auto-close**: Offre clôturée à 5 candidatures
- **Auto-reopen**: Si retrait et < 5 candidats

## 🛠️ Commandes Utiles

```bash
# Créer un superuser
python manage.py createsuperuser

# Initialiser les groupes
python manage.py init_groups

# Générer données de test
python manage.py create_test_data

# Migrations
python manage.py makemigrations
python manage.py migrate

# Shell Django
python manage.py shell

# Build frontend
npm run build

# Linter frontend
npm run lint
```

## 📦 Dépendances

### Python (requirements.txt)
- Django==6.0
- djangorestframework==3.16.1
- django-cors-headers==4.9.0

### Node.js (package.json)
- react==18.3.1
- typescript==5.8.3
- vite==5.4.19
- @tanstack/react-query==5.83.0
- tailwindcss==3.4.17
- recharts==2.15.4

## 🌐 URLs

- Frontend: http://localhost:5173
- API: http://localhost:8000/api
- Admin Django: http://localhost:8000/admin
- API Docs (DRF): http://localhost:8000/api/

## 📧 Contact

Projet réalisé pour le cours R5A05 - IUT d'Orsay - Département Informatique
