# Configuration de l'application

## Changer l'URL de l'API

L'URL de l'API backend est configurable via le fichier `.env` à la racine du projet.

### Pour le développement local

Créez un fichier `.env` à la racine du projet avec :

```bash
VITE_API_URL=http://localhost:8000
```

### Pour utiliser l'IP réseau (accès depuis d'autres machines)

Modifiez le fichier `.env` avec votre IP locale :

```bash
VITE_API_URL=http://192.168.1.55:8000
```

**Important :** Après avoir modifié le fichier `.env`, vous devez :
1. Relancer le serveur Django si nécessaire
2. **Redémarrer le serveur frontend Vite** pour que les changements soient pris en compte

```bash
# Arrêtez le serveur frontend (Ctrl+C)
# Puis relancez-le
npm run dev
```

### Configuration Django (CORS)

N'oubliez pas de mettre à jour les CORS dans Django si vous changez d'URL :

Éditez `config/settings.py` et ajoutez votre URL dans :

```python
CORS_ALLOWED_ORIGINS = [
    'http://localhost:8080',
    'http://localhost:5173',
    'http://192.168.1.55:8080',  # Ajoutez votre IP ici
]
```

Puis relancez Django :

```bash
./start_django_local.sh  # Pour localhost
# ou
./start_django.sh  # Pour réseau local
```

## Fichiers de configuration

- `.env` : Configuration locale (non versionnée)
- `.env.example` : Exemple de configuration (versionné)
- `src/config.ts` : Configuration centralisée de l'application
