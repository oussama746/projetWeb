# 📧 Système d'Emails Intégré

## ✅ Fonctionnalités Implémentées

### 1. Email d'Inscription
**Quand** : Nouvel utilisateur s'inscrit
**Destinataire** : L'utilisateur
**Contenu** : Bienvenue + infos du compte (username, email, rôle)

### 2. Email de Dépôt d'Offre
**Quand** : Entreprise dépose une offre
**Destinataire** : Contact de l'entreprise
**Contenu** : Confirmation de dépôt + détails offre + statut "en attente validation"

### 3. Email de Validation d'Offre
**Quand** : Responsable valide une offre
**Destinataire** : Contact de l'entreprise
**Contenu** : Notification de validation + l'offre est maintenant visible

### 4. Email de Refus d'Offre
**Quand** : Responsable refuse une offre
**Destinataire** : Contact de l'entreprise
**Contenu** : Notification de refus

### 5. Email de Confirmation de Candidature
**Quand** : Étudiant candidate à une offre
**Destinataires** : 
- **Étudiant** : Confirmation de candidature
- **Entreprise** : Notification nouvelle candidature + infos étudiant

### 6. Email de Clôture d'Offre
**Quand** : 5ème candidature reçue (offre clôturée automatiquement)
**Destinataire** : Contact de l'entreprise
**Contenu** : Notification clôture + nombre de candidatures

### 7. Email de Changement de Statut
**Quand** : Entreprise accepte/refuse une candidature
**Destinataire** : L'étudiant
**Contenu** : 
- **Acceptée** : Félicitations + contact entreprise
- **Refusée** : Notification avec encouragement

## 🔧 Configuration

### Mode Développement (Actuel)
```python
EMAIL_BACKEND = 'django.core.mail.backends.console.EmailBackend'
```
Les emails s'affichent dans **la console Django** (terminal)

### Mode Production (À configurer)
```python
EMAIL_BACKEND = 'django.core.mail.backends.smtp.EmailBackend'
EMAIL_HOST = 'smtp.gmail.com'
EMAIL_PORT = 587
EMAIL_USE_TLS = True
EMAIL_HOST_USER = 'votre-email@gmail.com'
EMAIL_HOST_PASSWORD = 'votre-mot-de-passe-app'
```

## 📂 Fichiers

- `stages/emails.py` - Module des fonctions email
- `config/settings.py` - Configuration email
- `stages/api_views.py` - Appels aux fonctions email

## 🧪 Tester

### 1. Lancer Django
```bash
./start_django.sh
```

### 2. Effectuer une action
Par exemple :
- S'inscrire : `/register`
- Déposer une offre : `/entreprises`
- Candidater : `/offres` puis cliquer "Candidater"

### 3. Voir l'email dans le terminal Django
L'email s'affichera dans la console :
```
Content-Type: text/plain; charset="utf-8"
MIME-Version: 1.0
Content-Transfer-Encoding: 7bit
Subject: Bienvenue sur Stage Connect !
From: noreply@stageconnect.fr
To: user@example.com
Date: ...

Bonjour username,

Votre compte a été créé avec succès...
```

## 📊 Actions Déclenchant un Email

| Action | Emails envoyés | Destinataires |
|--------|----------------|---------------|
| Inscription | 1 | Utilisateur |
| Dépôt offre | 1 | Entreprise |
| Validation offre | 1 | Entreprise |
| Refus offre | 1 | Entreprise |
| Candidature | 2 | Étudiant + Entreprise |
| 5ème candidature | 3 | Étudiant + Entreprise + Entreprise (clôture) |
| Accepter candidature | 1 | Étudiant |
| Refuser candidature | 1 | Étudiant |

## 🔍 Debug

### Voir les emails dans la console
Regarde le terminal où Django tourne, les emails s'affichent après chaque action.

### Problème d'envoi
Les erreurs sont catchées et affichées :
```python
try:
    emails.send_registration_email(user)
except Exception as e:
    print(f"Failed to send email: {e}")
```

Regarde les logs Django pour voir les erreurs.

## 🚀 Passer en Production

1. Créer un compte Gmail dédié
2. Activer "Mots de passe d'application" dans paramètres Google
3. Mettre à jour `config/settings.py` :
```python
EMAIL_BACKEND = 'django.core.mail.backends.smtp.EmailBackend'
EMAIL_HOST = 'smtp.gmail.com'
EMAIL_PORT = 587
EMAIL_USE_TLS = True
EMAIL_HOST_USER = 'stage-connect@gmail.com'
EMAIL_HOST_PASSWORD = 'votre_mot_de_passe_app'
DEFAULT_FROM_EMAIL = 'Stage Connect <stage-connect@gmail.com>'
```

4. Redémarrer Django

## 💡 Personnalisation

### Modifier un email
Édite `stages/emails.py` et modifie la fonction correspondante.

### Ajouter un nouvel email
1. Créer fonction dans `stages/emails.py`
2. Appeler dans `stages/api_views.py` au bon endroit

### Utiliser des templates HTML
```python
from django.template.loader import render_to_string

html_content = render_to_string('emails/welcome.html', {'user': user})
send_mail(
    subject,
    message,
    settings.DEFAULT_FROM_EMAIL,
    [user.email],
    html_message=html_content,
)
```

## ✨ Système d'emails complet et fonctionnel !
