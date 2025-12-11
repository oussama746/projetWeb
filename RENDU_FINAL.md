# 📦 Rendu Final - Projet Programmation Avancée

## 🎯 Application de Gestion de Stages - IUT d'Orsay

Application web complète permettant la diffusion d'offres de stages aux étudiants et la gestion des candidatures.

---

## 🚀 Démarrage

### Backend Django
```bash
./start_django.sh
```
→ http://192.168.1.55:8000

### Frontend React
```bash
./start_frontend.sh
```
→ http://192.168.1.55:8080

---

## 👥 Comptes de test

### Administrateur
- **Username**: admin  
- **Password**: admin123  
- **Accès**: Validation offres, statistiques, gestion complète

### Responsable IUT
- **Username**: responsable  
- **Password**: resp123  
- **Accès**: Validation/refus des offres

### Entreprise
- **Username**: techcorp  
- **Password**: entr123  
- **Email**: contact@techcorp.com
- **Accès**: Gestion des candidatures, profils étudiants, téléchargement CV

### Étudiant
- **Username**: etudiant1  
- **Password**: etud123  
- **Accès**: Candidature aux offres, gestion profil, upload CV

---

## ✅ Fonctionnalités implémentées

### Cahier des charges
- ✅ Dépôt offre sans identification (entreprise)
- ✅ Validation/Refus par responsable et admin
- ✅ Liste et recherche d'offres pour responsable
- ✅ Liste et recherche d'offres pour étudiants (validées uniquement)
- ✅ Candidature étudiant (max 5 par offre)
- ✅ Clôture automatique à 5 candidatures
- ✅ Admin peut changer état des offres (même clôturées)
- ✅ Statistiques avec graphiques (candidatures par mois sur 12 mois)

### Bonus implémentés
- ✅ **Profil étudiant complet** : CV (upload PDF), bio, téléphone
- ✅ **Dashboard entreprise** : Vue des candidatures avec profils détaillés
- ✅ **Téléchargement CV** : Les entreprises peuvent télécharger les CV
- ✅ **Système d'emails complet** :
  - Confirmation dépôt d'offre
  - Validation/Refus d'offre
  - Nouvelle candidature (étudiant + entreprise)
  - Acceptation/Refus candidature
- ✅ **Interface moderne** : React + TypeScript + Tailwind CSS + shadcn/ui
- ✅ **API REST** : Django REST Framework
- ✅ **Statistiques avancées** : Graphiques interactifs avec Recharts
- ✅ **Responsive design** : Mobile, tablet, desktop
- ✅ **Sécurité** : CSRF, CORS, permissions par rôle

---

## 🔄 Workflow

### 1. Dépôt d'offre (Entreprise - sans compte)
- Page `/entreprises`
- Formulaire avec organisme, contact, email, titre, description
- État : "En attente validation"
- Email de confirmation envoyé

### 2. Validation (Responsable ou Admin)
- Page `/responsable` ou `/admin`
- Voir offres en attente
- Valider ou Refuser
- Email envoyé à l'entreprise

### 3. Candidature (Étudiant)
- Page `/offres` : offres validées uniquement
- Clic "Candidater"
- Email de confirmation (étudiant + entreprise)
- Clôture automatique si 5 candidats

### 4. Gestion candidatures (Entreprise)
- Inscription avec **même email** que l'offre
- Page `/entreprise` : voir ses offres
- Clic sur offre → voir candidats
- Profils détaillés : nom, email, téléphone, bio, **CV téléchargeable**
- Accepter ou Refuser → Email à l'étudiant

---

## 📊 Points clés

### Email = Lien offre/entreprise
Un responsable d'entreprise voit **uniquement** les offres où le `contact_email` correspond à son email de compte.

**Exemple** :
1. Offre déposée avec contact_email = `emilien@accenture.org`
2. Inscription avec email = `emilien@accenture.org` + rôle "Entreprise"
3. → Le responsable voit l'offre sur `/entreprise`

### Sécurité
- Authentification Django par session
- Protection CSRF activée
- CORS configuré pour cross-origin
- Permissions par rôle (groupes Django)
- Upload CV sécurisé (PDF uniquement)

### Technologies
- **Backend** : Django 6.0 + Django REST Framework + CORS Headers
- **Frontend** : React 18 + TypeScript + Vite + TailwindCSS + shadcn/ui
- **Graphiques** : Recharts (statistiques admin)
- **Base** : SQLite (dev)

---

## 📁 Structure

```
projetWeb/
├── config/              # Django settings, urls
├── stages/              # App principale (models, API, views)
│   ├── models.py       # StageOffer, Candidature, StudentProfile
│   ├── api_views.py    # API REST ViewSets
│   └── serializers.py  # Serializers
├── src/                 # Frontend React
│   ├── components/     # UI components
│   ├── pages/          # Pages (Home, Login, Dashboards...)
│   ├── contexts/       # AuthContext
│   └── lib/api.ts      # API client
├── media/              # CV uploads
├── db.sqlite3          # Base de données
├── start_django.sh     # Démarrage backend
└── start_frontend.sh   # Démarrage frontend
```

---

## 📧 Emails

En développement : emails affichés dans la **console Django**.

Pour production : configurer SMTP dans `config/settings.py`.

---

## 📝 Documentation

- **COMPTES_TEST.md** : Liste complète des comptes et workflow détaillé
- **README.md** : Instructions de lancement
- **RENDU_FINAL.md** : Ce document

---

## 🏆 Qualité

| Critère | Statut |
|---------|--------|
| Complétude fonctionnelle | ✅ 100% + Bonus |
| Ergonomie | ✅ Interface moderne, responsive |
| Maintenabilité | ✅ TypeScript, code structuré |
| Robustesse/Sécurité | ✅ Permissions, validation, CSRF |
| Base de démo | ✅ 15+ offres, 5 étudiants |
| Fonctionnalités bonus | ✅ Profils, emails, stats, UI moderne |

---

## 🎓 Évaluation

**URLs** :
- Application : http://192.168.1.55:8080/
- API : http://192.168.1.55:8000/api/
- Admin Django : http://192.168.1.55:8000/admin/

**Comptes principaux** :
- Admin : `admin` / `admin123`
- Responsable : `responsable` / `resp123`
- Étudiant : `etudiant1` / `etud123`
- Entreprise : `techcorp` / `entr123`

Voir `COMPTES_TEST.md` pour tous les comptes et scénarios de test.

---

**Projet complet avec toutes les fonctionnalités demandées + nombreux bonus ! 🎉**
