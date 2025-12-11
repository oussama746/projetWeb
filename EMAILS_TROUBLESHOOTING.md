# Configuration et Dépannage des Emails

## Erreur Gmail "Please log in with your web browser"

Cette erreur (code 534) se produit lorsque Gmail bloque la connexion SMTP pour des raisons de sécurité.

### Solutions

#### 1. Vérifier le compte Gmail

1. **Activer l'authentification à deux facteurs** sur le compte `votify.com@gmail.com`
2. **Générer un mot de passe d'application** :
   - Aller sur https://myaccount.google.com/apppasswords
   - Créer un nouveau mot de passe d'application pour "Autre (nom personnalisé)"
   - Nommer : "Stage Connect Django"
   - Utiliser le mot de passe généré dans `settings.py`

#### 2. Débloquer l'accès

Si vous recevez un email de Google signalant une tentative de connexion bloquée :
- Cliquer sur "Oui, c'était moi" dans l'email
- Ou aller sur : https://accounts.google.com/DisplayUnlockCaptcha
- Puis réessayer

#### 3. Mode développement (sans vrais emails)

Pour tester sans envoyer de vrais emails, modifiez `config/settings.py` :

```python
# Afficher les emails dans la console au lieu de les envoyer
EMAIL_BACKEND = 'django.core.mail.backends.console.EmailBackend'
```

Les emails seront affichés dans le terminal Django au lieu d'être envoyés.

#### 4. Alternative : Utiliser un autre service SMTP

**Mailtrap** (recommandé pour le développement) :
```python
EMAIL_BACKEND = 'django.core.mail.backends.smtp.EmailBackend'
EMAIL_HOST = 'smtp.mailtrap.io'
EMAIL_PORT = 2525
EMAIL_HOST_USER = 'your-mailtrap-username'
EMAIL_HOST_PASSWORD = 'your-mailtrap-password'
EMAIL_USE_TLS = True
```

**SendGrid** (pour la production) :
```python
EMAIL_BACKEND = 'django.core.mail.backends.smtp.EmailBackend'
EMAIL_HOST = 'smtp.sendgrid.net'
EMAIL_PORT = 587
EMAIL_USE_TLS = True
EMAIL_HOST_USER = 'apikey'
EMAIL_HOST_PASSWORD = 'your-sendgrid-api-key'
```

## Configuration actuelle

Les paramètres email sont dans `config/settings.py` :
- Email : `votify.com@gmail.com`
- Mot de passe : `gzflwwuhkojiujed` (mot de passe d'application)
- Port : 465 (SSL)

## Fonctionnalités email implémentées

1. **Confirmation d'inscription** - Envoyé à la création du compte
2. **Confirmation de candidature** - Envoyé quand un étudiant postule
3. **Notification au responsable** - Envoyé quand une candidature arrive
4. **Changement de statut** - Envoyé quand le statut d'une candidature change
5. **Validation/Refus d'offre** - Envoyé au contact de l'entreprise

## Test des emails

Pour tester l'envoi d'emails :

```bash
python manage.py shell
```

```python
from django.core.mail import send_mail

send_mail(
    'Test Email',
    'Ceci est un test.',
    'votify.com@gmail.com',
    ['votre.email@example.com'],
    fail_silently=False,
)
```

Si cela échoue avec l'erreur 534, suivez les étapes ci-dessus.
