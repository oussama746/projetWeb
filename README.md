# 🎓 Gestion des Stages - IUT d'Orsay

Application web complète de gestion des offres de stages et candidatures pour l'IUT d'Orsay, conforme au cahier des charges R5A05.

## 🎯 Objectif du projet

Fournir une plateforme professionnelle permettant :
- Aux **entreprises** de diffuser leurs offres de stage
- Aux **responsables d'entreprise** de gérer leurs offres et suivre les candidatures
- Aux **administrateurs IUT** de valider les offres et consulter les statistiques
- Aux **étudiants** de consulter les offres validées et candidater

## 🏗️ Architecture technique

- **Backend**: Django 6.0 + Django REST Framework 3.15
- **Frontend**: React 18 + TypeScript + Vite 6
- **UI**: Tailwind CSS 3 + shadcn/ui + Lucide Icons
- **Charts**: Chart.js + react-chartjs-2
- **Base de données**: SQLite
- **Emails**: Django Email Backend (SMTP)

## 👥 Types d'utilisateurs et permissions

### 1. 👔 Entreprises (sans compte)
- ✅ Dépôt d'offres de stage sans authentification
- ✅ Saisie des informations : organisme, contact, titre, description
- ✅ Réception d'email de confirmation de dépôt

### 2. 🏢 Responsables d'entreprise (avec compte)
**Accessible via inscription en sélectionnant "Responsable d'entreprise"**
- ✅ Gestion des offres de leur entreprise (filtrées par email de contact)
- ✅ Consultation de la liste des candidats
- ✅ Gestion du statut des candidatures :
  - En attente
  - Acceptée
  - Refusée
  - Convoqué(e) en entretien
- ✅ Accès aux informations complètes des étudiants (CV, profil, bio)
- ✅ Notifications email lors de nouvelles candidatures
- ✅ **Export PDF** : Téléchargement d'un rapport détaillé pour chaque offre avec tous les candidats

### 3. 👨‍💼 Administrateurs IUT (Admin Django)
**Dashboard administrateur complet avec :**
- ✅ **Validation des offres** : 
  - Liste des offres en attente de validation
  - Boutons Valider/Refuser
  - Changement d'état même pour offres clôturées
- ✅ **Statistiques visuelles avec Chart.js** :
  - 📊 Nombre total d'offres reçues
  - ✅ Nombre d'offres validées
  - ⏳ Nombre d'offres en attente
  - 🎓 Nombre total de candidatures
  - 📈 Évolution des offres sur 12 mois (graphique en ligne)
  - 📊 Répartition des candidatures par mois (graphique en barres)
  - 🥧 Distribution par statut (graphique circulaire)
- ✅ **Recherche avancée** sur toutes les offres
- ✅ **Gestion complète** : modification, suppression, changement d'état
- ✅ **Export PDF** : Téléchargement d'un rapport complet de toutes les candidatures

### 4. 🎓 Étudiants (avec compte)
**Fonctionnalités complètes :**
- ✅ Consultation des offres validées uniquement
- ✅ Recherche et filtrage des offres
- ✅ Candidature aux offres (maximum 5 candidats par offre)
- ✅ Suivi de leurs candidatures avec statut en temps réel
- ✅ **Profil étudiant personnalisé** :
  - 📄 Upload de CV (PDF)
  - 📝 Biographie
  - 📧 Email et coordonnées
  - ✏️ Modification à tout moment
- ✅ Notifications email de confirmation de candidature
- ✅ Clôture automatique des offres à 5 candidatures

## 🚀 Démarrage rapide

### Option 1 : Script automatique (recommandé)
```bash
# Démarrage complet (Backend + Frontend)
chmod +x start.sh
./start.sh
```

### Option 2 : Localhost uniquement
```bash
# Backend Django sur localhost
chmod +x start_django_local.sh
./start_django_local.sh

# Frontend sur localhost (terminal séparé)
npm run dev
```

### Accès aux services
- 🌐 **Frontend** : http://localhost:8080
- 🔌 **API Backend** : http://localhost:8000/api
- ⚙️ **Admin Django** : http://localhost:8000/admin

## 📦 Installation manuelle

### Prérequis
- Python 3.12+
- Node.js 18+
- npm ou yarn

### Backend Django
```bash
# Créer et activer l'environnement virtuel
python -m venv venv
source venv/bin/activate  # Linux/Mac
# ou
venv\Scripts\activate  # Windows

# Installer les dépendances
pip install -r requirements.txt

# Appliquer les migrations
python manage.py migrate

# Créer les groupes d'utilisateurs
python manage.py init_groups

# Créer un superutilisateur
python manage.py createsuperuser

# Peupler la base avec des données de test (optionnel)
python create_test_data.py

# Lancer le serveur
python manage.py runserver
```

### Frontend React
```bash
# Installer les dépendances
npm install

# Configuration de l'API (optionnel)
cp .env.example .env
# Éditer .env si nécessaire

# Lancer le serveur de développement
npm run dev
```

## 🔑 Comptes de test

Créés automatiquement par `create_test_data.py` :

### Admin
- 📧 Email : `admin@iut-orsay.fr`
- 🔑 Password : `admin123`

### Étudiants
- 📧 Email : `alice.martin@edu.univ-paris-saclay.fr` / Password : `student123`
- 📧 Email : `bob.dupont@edu.univ-paris-saclay.fr` / Password : `student123`
- 📧 Email : `claire.bernard@edu.univ-paris-saclay.fr` / Password : `student123`

### Responsables d'entreprise
- 📧 Email : `marie.laurent@accenture.com` / Password : `manager123`
- 📧 Email : `pierre.moreau@capgemini.com` / Password : `manager123`

## 📊 Fonctionnalités détaillées

### 🏢 Gestion des offres de stage

#### Structure d'une offre
- **Organisme** : Nom de l'entreprise
- **Contact** : Nom, prénom et email du responsable
- **Horodatage** : Date et heure de dépôt automatique
- **Titre** : Intitulé du stage
- **Description** : Détails complets de la mission
- **Statut** : En attente / Validée / Refusée / Clôturée

#### Workflow de validation
1. 📝 Entreprise dépose une offre (anonyme ou avec compte)
2. 📧 Email de confirmation envoyé
3. ⏳ Offre en attente de validation (visible uniquement par admin)
4. 👨‍💼 Admin valide ou refuse
5. ✅ Si validée → visible par les étudiants
6. ❌ Si refusée → email de notification
7. 🔒 Clôture automatique à 5 candidatures

### 🎓 Système de candidatures

#### Processus pour l'étudiant
1. 📋 Consultation des offres validées
2. 🔍 Recherche et filtrage
3. 📄 Consultation des détails
4. ✉️ Candidature en un clic
5. 📧 Email de confirmation
6. 📊 Suivi du statut en temps réel

#### Limitation automatique
- Maximum **5 candidatures** par offre
- Clôture automatique à la 5ème candidature
- Offres clôturées cachées automatiquement

### 📈 Tableau de bord administrateur

#### Statistiques en temps réel
- 🔢 **Métriques globales** :
  - Total des offres reçues
  - Offres validées
  - Offres en attente
  - Total des candidatures
  
- 📊 **Graphiques Chart.js** :
  - **Ligne** : Évolution des offres sur 12 mois
  - **Barres** : Candidatures par mois
  - **Circulaire** : Répartition par statut
  - **Barres horizontales** : Top 5 des entreprises

#### Actions administrateur
- ✅ Valider/Refuser les offres en attente
- 🔄 Modifier le statut de n'importe quelle offre
- 🗑️ Supprimer des offres
- 👁️ Voir tous les détails et candidatures

### 👤 Profil étudiant complet

#### Informations personnelles
- Nom, prénom, email
- Biographie personnalisable
- Photo de profil (optionnel)

#### Documents
- 📄 **CV téléchargeable** (PDF uniquement)
- Stockage sécurisé côté serveur
- Accessible par les responsables d'entreprise

## 🛠️ Technologies et dépendances

### Backend
```
Django==6.0
djangorestframework==3.15.2
django-cors-headers==4.6.0
Pillow==11.0.0
reportlab==4.4.6
```

### Frontend
```
react==18.3.1
react-router-dom==7.1.1
@tanstack/react-query==5.62.8
chart.js==4.4.7
react-chartjs-2==5.3.0
tailwindcss==3.4.17
shadcn/ui (components)
lucide-react (icons)
```

## 📝 API Endpoints complets

### Authentification
- `POST /api/auth/register/` - Inscription (étudiant/responsable)
- `POST /api/auth/login/` - Connexion
- `POST /api/auth/logout/` - Déconnexion
- `GET /api/auth/me/` - Utilisateur actuel
- `GET /api/auth/csrf/` - Token CSRF

### Offres de stage
- `GET /api/offers/` - Liste des offres (filtrées selon rôle)
- `POST /api/offers/` - Créer une offre (anonyme ou authentifié)
- `GET /api/offers/{id}/` - Détails d'une offre
- `PUT /api/offers/{id}/` - Modifier une offre
- `DELETE /api/offers/{id}/` - Supprimer une offre
- `POST /api/offers/{id}/apply/` - Candidater (étudiant)
- `POST /api/offers/{id}/validate_offer/` - Valider/Refuser (admin)
- `GET /api/offers/{id}/candidates/` - Liste des candidats (manager)
- `GET /api/offers/{id}/export_pdf/` - 📄 **Export PDF d'une offre** (manager/admin)

### Candidatures
- `GET /api/candidatures/` - Mes candidatures (étudiant)
- `POST /api/candidatures/{id}/update_status/` - Changer statut (manager)
- `GET /api/candidatures/export_all_pdf/` - 📄 **Export PDF de toutes les candidatures** (admin uniquement)

### Profil étudiant
- `GET /api/profile/` - Mon profil
- `PUT /api/profile/` - Modifier mon profil
- `POST /api/profile/` - Upload CV

### Statistiques (Admin)
- `GET /api/dashboard/stats/` - Statistiques complètes
- `GET /api/dashboard/monthly_stats/` - Stats mensuelles (12 mois)

## 🔐 Sécurité

- ✅ CSRF Protection activé
- ✅ CORS configuré pour développement
- ✅ Permissions basées sur les rôles (Groups Django)
- ✅ Authentification par session Django
- ✅ Validation des uploads (CV PDF uniquement)
- ✅ Sanitisation des entrées utilisateur

## 📧 Configuration des emails

```python
# config/settings.py
EMAIL_BACKEND = 'django.core.mail.backends.console.EmailBackend'  # Dev
# Pour production, utiliser SMTP :
# EMAIL_BACKEND = 'django.core.mail.backends.smtp.EmailBackend'
# EMAIL_HOST = 'smtp.gmail.com'
# EMAIL_PORT = 587
# EMAIL_USE_TLS = True
```

## 🌍 Configuration des URLs

Fichier `.env` à la racine du projet frontend :
```env
VITE_API_BASE_URL=http://localhost:8000
```

## 📱 Interface utilisateur

- ✨ Design moderne et responsive
- 🎨 Palette de couleurs professionnelle
- 📱 Compatible mobile, tablette, desktop
- ♿ Accessibilité (ARIA labels)
- 🌙 Mode sombre (à implémenter si besoin)

## 🧪 Tests et validation

### Scénarios de test
1. ✅ Dépôt d'offre sans compte
2. ✅ Validation par admin
3. ✅ Candidature étudiant
4. ✅ Clôture automatique à 5 candidatures
5. ✅ Gestion par responsable entreprise
6. ✅ Consultation des statistiques

## 📄 Livrables conformes au cahier des charges

✅ **Complétude fonctionnelle** : Toutes les fonctionnalités demandées
✅ **Ergonomie** : Interface moderne conforme aux standards web
✅ **Maintenabilité** : Code structuré, commenté, modulaire
✅ **Robustesse** : Gestion des erreurs, validation des données
✅ **Sécurité** : CSRF, permissions, validation
✅ **Base de démonstration** : Données cohérentes et professionnelles
✅ **Fonctionnalités bonus** : 
- Profil étudiant avec CV
- Statistiques visuelles Chart.js
- Dashboard responsable entreprise
- Système d'emails complet
- Interface moderne React

## 🤝 Contribution

Projet réalisé dans le cadre du cours R5A05 - Programmation avancée - IUT d'Orsay

## 📞 Support

Pour toute question, consulter :
- Documentation Django : https://docs.djangoproject.com
- Documentation React : https://react.dev
- Chart.js : https://www.chartjs.org