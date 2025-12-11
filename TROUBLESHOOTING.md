# 🔧 Guide de Dépannage

## Problème : Erreur CORS (Access-Control-Allow-Origin manquant)

### ✅ Solution appliquée
Le problème CORS a été résolu ! Configuration mise à jour dans `config/settings.py` :

```python
# CORS bien configuré avec :
CORS_ALLOWED_ORIGINS = ['http://localhost:5173', 'http://127.0.0.1:5173']
CORS_ALLOW_CREDENTIALS = True
CORS_ALLOW_HEADERS = [headers complets]
CSRF_TRUSTED_ORIGINS = ['http://localhost:5173', 'http://127.0.0.1:5173']
```

### 🚀 Redémarrage propre

Si vous avez des erreurs CORS ou port déjà utilisé :

```bash
./restart.sh    # Arrête tout
./start.sh      # Redémarre proprement
```

## Problème : Port déjà utilisé

### Solution
```bash
# Tuer le processus Django
pkill -f "manage.py runserver"
lsof -ti:8000 | xargs kill -9

# Tuer le processus Vite
pkill -f "vite"
lsof -ti:5173 | xargs kill -9

# Relancer
./start.sh
```

## Problème : Backend ne répond pas

### Vérifications
```bash
# Vérifier que Django tourne
curl http://localhost:8000/api/auth/me/

# Vérifier les logs
tail -f /tmp/django.log  # si lancé en background
```

## Problème : Frontend ne se connecte pas au backend

### Vérifications
1. Backend tourne sur port 8000
2. Frontend tourne sur port 5173
3. CORS configuré dans Django
4. Pas de bloqueur de cookies dans le navigateur

### Test CORS manuel
```bash
curl -v -H "Origin: http://localhost:5173" http://localhost:8000/api/offers/
```

Doit afficher :
```
access-control-allow-origin: http://localhost:5173
access-control-allow-credentials: true
```

## Problème : Base de données vide

### Solution
```bash
source venv/bin/activate
python manage.py init_groups
python manage.py create_test_data
```

## Problème : Module Python manquant

### Solution
```bash
source venv/bin/activate
pip install -r requirements.txt
```

## Problème : Module Node manquant

### Solution
```bash
npm install
```

## Problème : Authentification ne fonctionne pas

### Vérifications
1. Les cookies sont activés dans le navigateur
2. CORS_ALLOW_CREDENTIALS = True dans settings.py
3. credentials: 'include' dans les requêtes fetch (déjà fait dans api.ts)

## Commandes utiles

```bash
# Voir les processus Django
ps aux | grep manage.py

# Voir les processus Vite  
ps aux | grep vite

# Voir ce qui utilise le port 8000
lsof -i:8000

# Voir ce qui utilise le port 5173
lsof -i:5173

# Tester l'API
curl http://localhost:8000/api/offers/

# Voir les logs Django en temps réel
python manage.py runserver  # sans background
```

## En cas de problème persistant

1. Arrêter tout : `./restart.sh`
2. Supprimer les node_modules : `rm -rf node_modules && npm install`
3. Recréer la base : `rm db.sqlite3 && python manage.py migrate && python manage.py create_test_data`
4. Redémarrer : `./start.sh`

## Ports utilisés

- **Frontend Vite** : 5173
- **Backend Django** : 8000
- **Django Admin** : 8000/admin

## Vérifier que tout fonctionne

```bash
# Backend répond
curl http://localhost:8000/api/auth/me/

# Frontend accessible
curl http://localhost:5173

# CORS configuré
curl -I -H "Origin: http://localhost:5173" http://localhost:8000/api/offers/
```
