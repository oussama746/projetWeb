# 📖 Explication du Workflow des Offres

## 🔄 Le Cycle de Vie d'une Offre de Stage

### 1️⃣ DÉPÔT D'OFFRE (Sans connexion)
**Qui ?** N'importe quelle entreprise  
**Où ?** Page `/entreprises`  
**Comment ?** Sans avoir besoin de créer un compte !

L'entreprise remplit le formulaire :
- Nom de l'organisme (ex: "Accenture")
- Nom du contact (ex: "Emilien Dubois")
- **Email de contact** (ex: "emilien.dubois@accenture.org")
- Titre du stage
- Description

**➡️ Résultat** :
- Offre créée avec l'état **"En attente validation"**
- Email de confirmation envoyé à l'entreprise
- **L'offre n'est PAS visible par les étudiants !** ⚠️

---

### 2️⃣ VALIDATION PAR LE RESPONSABLE IUT
**Qui ?** Le responsable de stages de l'IUT  
**Compte** : `responsable` / `resp123`  
**Où ?** Dashboard `/responsable`

Le responsable IUT voit **TOUTES les offres déposées** sur le site, peu importe l'entreprise.

**Son rôle** :
- Vérifier la qualité de l'offre
- S'assurer qu'elle correspond aux critères pédagogiques
- **Valider** ✅ ou **Refuser** ❌ l'offre

**Pourquoi ?**
- Contrôle qualité avant publication aux étudiants
- Éviter les offres non pertinentes ou frauduleuses
- Respecter les exigences pédagogiques de l'IUT

**➡️ Si VALIDÉE** :
- État passe à **"Validée"**
- Email de validation envoyé à l'entreprise
- **L'offre devient visible pour les étudiants** ✅

**➡️ Si REFUSÉE** :
- État passe à **"Refusée"**
- Email de refus envoyé à l'entreprise
- L'offre n'est jamais visible pour les étudiants

---

### 3️⃣ CONSULTATION PAR LES ÉTUDIANTS
**Qui ?** Les étudiants connectés  
**Où ?** Page `/offres`

Les étudiants voient **UNIQUEMENT** les offres avec l'état **"Validée"**.

Ils ne voient PAS :
- ❌ Les offres "En attente validation"
- ❌ Les offres "Refusées"
- ❌ Les offres "Clôturées" (5 candidatures atteintes)

---

### 4️⃣ CANDIDATURE
**Qui ?** Un étudiant  
**Action** : Clic sur "Candidater"

**➡️ Résultat** :
- Candidature enregistrée
- Email à l'étudiant (confirmation)
- Email à l'entreprise (notification avec profil étudiant)

**Limite** : Maximum **5 candidatures** par offre

**➡️ Si 5ème candidature** :
- État passe automatiquement à **"Clôturée"**
- Email à l'entreprise (offre clôturée)
- L'offre disparaît de la liste pour les étudiants

---

### 5️⃣ GESTION DES CANDIDATURES (Entreprise)
**Qui ?** Le responsable de l'entreprise  
**Où ?** Dashboard `/entreprise`

Le responsable d'entreprise voit :
- **Seulement ses offres** (filtrées par son email)
- Les candidatures reçues pour chaque offre
- Les profils des candidats (CV, bio, téléphone)

**Actions** :
- Accepter une candidature ✅
- Refuser une candidature ❌

**➡️ Résultat** :
- Email envoyé à l'étudiant (acceptation ou refus)

---

## 📊 Les 4 États d'une Offre

### 🟡 En attente validation
- **Quand ?** Juste après le dépôt par l'entreprise
- **Visible par** : Responsable IUT uniquement
- **Action requise** : Le responsable IUT doit valider ou refuser

### 🟢 Validée
- **Quand ?** Après validation par le responsable IUT
- **Visible par** : Tous les étudiants sur `/offres`
- **État actif** : Les étudiants peuvent candidater

### 🔴 Refusée
- **Quand ?** Le responsable IUT a refusé l'offre
- **Visible par** : Personne (sauf admin)
- **Terminé** : L'offre ne sera jamais visible

### ⚫ Clôturée
- **Quand ?** 5 candidatures reçues
- **Visible par** : L'entreprise uniquement (sur son dashboard)
- **Terminé** : Plus de nouvelles candidatures possibles

---

## 🎯 RÉSUMÉ : Pourquoi le Responsable IUT ?

### Rôle du Responsable IUT
C'est le **gardien de la qualité** des offres de stage.

**Il s'assure que** :
- ✅ L'offre est sérieuse et professionnelle
- ✅ Le stage correspond au niveau des étudiants
- ✅ Les missions sont clairement définies
- ✅ L'entreprise est fiable
- ✅ Le stage respecte les critères pédagogiques

**Sans validation** :
- ❌ L'offre reste invisible pour les étudiants
- ❌ Personne ne peut candidater
- ❌ L'offre est "en attente"

---

## 🔑 Différence entre les Rôles

### 👔 Responsable IUT (`/responsable`)
**Mission** : Valider/Refuser les offres avant publication
- Voit **TOUTES** les offres du site
- Peut valider ou refuser n'importe quelle offre
- C'est le "modérateur" du site
- 1 seul compte : `responsable` / `resp123`

### 🏢 Responsable d'Entreprise (`/entreprise`)
**Mission** : Gérer les candidatures de SON entreprise
- Voit **SEULEMENT** les offres avec son email
- Peut accepter/refuser les candidatures
- Voit les profils des candidats (CV, bio)
- Plusieurs comptes possibles (un par entreprise)

### Exemple concret :
1. **Accenture** dépose une offre → État "En attente"
2. **Responsable IUT** valide → État "Validée"
3. **Étudiant** candidate
4. **Responsable Accenture** voit la candidature et accepte/refuse

---

## 🛠️ Configuration Actuelle

### Comptes de test :

**Responsable IUT** :
```
Username: responsable
Password: resp123
Email: responsable@iut-orsay.fr
Accès: /responsable
```

**Entreprise** :
```
Username: techcorp
Password: entr123
Email: contact@techcorp.com
Accès: /entreprise
```

**Étudiant** :
```
Username: etudiant1
Password: etud123
Email: etudiant1@example.com
Accès: /etudiant
```

---

## ✨ Workflow Complet en Image

```
Entreprise (SANS connexion)
        ↓
   Dépose offre
        ↓
[En attente validation] 🟡
        ↓
Responsable IUT valide? ───┐
        ↓ OUI              │ NON
    [Validée] 🟢       [Refusée] 🔴
        ↓                  │
  Visible étudiants        │
        ↓                  │
  Étudiants candidatent    │
        ↓                  │
  5 candidatures?          │
        ↓ OUI              │
    [Clôturée] ⚫          │
        ↓                  ↓
  Plus de candidatures  Terminé
```

---

## 📚 En Résumé

**"En attente validation"** = L'offre attend l'approbation du responsable IUT

**Responsable IUT** = Gardien de la qualité, voit TOUT, valide ou refuse

**Responsable Entreprise** = Gère SES candidatures uniquement (filtre par email)

C'est un workflow de **modération** pour garantir la qualité des offres ! ✅
