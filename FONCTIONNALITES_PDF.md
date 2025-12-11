# Export PDF - Fonctionnalités

## Fonctionnalités d'export PDF ajoutées

### 1. Export d'une offre (Manager / Entreprise)

**Accès:** Dashboard Manager (Espace Responsable d'entreprise)

**Fonctionnalité:**
- Chaque offre affiche un bouton "📥" (Download)
- Cliquer sur ce bouton télécharge un PDF contenant:
  - Toutes les informations de l'offre (titre, organisme, contact, date, état)
  - Description complète du stage
  - Liste de tous les candidats avec leurs informations:
    - Nom et prénom
    - Email
    - Téléphone
    - Date de candidature
    - Statut de la candidature

**Endpoint API:** `GET /api/offers/{id}/export_pdf/`

**Permissions:** Responsables d'entreprise, Administrateurs

---

### 2. Export de toutes les candidatures (Admin)

**Accès:** Dashboard Administrateur

**Fonctionnalité:**
- Bouton "Exporter toutes les candidatures (PDF)" en haut à droite
- Génère un rapport PDF complet contenant:
  - Statistiques globales:
    - Total des candidatures
    - Nombre en attente
    - Nombre acceptées
    - Nombre refusées
  - Tableau détaillé de toutes les candidatures avec:
    - Étudiant
    - Email
    - Titre de l'offre
    - Entreprise
    - Date de candidature
    - Statut

**Endpoint API:** `GET /api/candidatures/export_all_pdf/`

**Permissions:** Administrateurs uniquement

---

## Utilisation

### Pour les Responsables d'entreprise:
1. Se connecter avec un compte Entreprise
2. Aller sur "Dashboard Manager"
3. Trouver une de vos offres (celles avec votre email de contact)
4. Cliquer sur l'icône 📥 pour télécharger le PDF

### Pour les Administrateurs:
1. Se connecter avec un compte Admin
2. Aller sur "Dashboard Admin"
3. Cliquer sur le bouton "Exporter toutes les candidatures (PDF)"
4. Le PDF sera téléchargé automatiquement

---

## Détails techniques

### Bibliothèque utilisée
- **reportlab** : Génération de PDF en Python
- Version: 4.4.6

### Mise en forme
- En-têtes avec logo et couleurs IUT
- Tableaux avec alternance de couleurs
- Footer avec date de génération
- Mise en page professionnelle A4

### Noms de fichiers
- Offre: `offre_{id}_{organisme}.pdf`
- Toutes les candidatures: `candidatures_rapport_{date}.pdf`

---

## Installation

La bibliothèque reportlab est déjà ajoutée dans `requirements.txt`:
```bash
pip install reportlab==4.4.6
```

---

## Tests

Pour tester la génération PDF:
```bash
python manage.py shell
```

Puis:
```python
from stages.models import StageOffer
from stages.pdf_generator import generate_offer_pdf

offer = StageOffer.objects.first()
pdf = generate_offer_pdf(offer)
with open('test.pdf', 'wb') as f:
    f.write(pdf)
```
