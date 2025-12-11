# 🚀 Guide de Démarrage Rapide

## ⚡ Lancement en 1 commande

```bash
./start.sh
```

Puis ouvrez votre navigateur sur **http://localhost:5173**

---

## 🔑 Connexion Rapide

Pour tester rapidement l'application :

### Étudiant
```
Login: etudiant1
Password: etud123
```
➡️ Voir les offres et candidater

### Responsable
```
Login: responsable
Password: resp123
```
➡️ Valider/refuser les offres

### Admin
```
Login: admin
Password: admin123
```
➡️ Dashboard + statistiques complètes

### Entreprise
```
Login: datasolutions
Password: entr123
```
➡️ Gérer vos offres et candidatures

---

## 📝 Parcours Utilisateur

### 1️⃣ En tant qu'Entreprise (sans compte)
1. Aller sur http://localhost:5173
2. Cliquer sur "Post Internship" (en haut)
3. Remplir le formulaire d'offre
4. Soumettre ➡️ Offre en attente de validation

### 2️⃣ En tant que Responsable
1. Se connecter avec `responsable / resp123`
2. Voir les offres en attente
3. Cliquer sur une offre
4. Valider ou refuser

### 3️⃣ En tant qu'Étudiant
1. Se connecter avec `etudiant1 / etud123`
2. Parcourir les offres validées
3. Cliquer sur "Apply" pour candidater
4. Voir "My Applications" pour suivre vos candidatures

### 4️⃣ En tant qu'Admin
1. Se connecter avec `admin / admin123`
2. Accéder au Dashboard
3. Voir les statistiques et graphiques
4. Gérer tous les utilisateurs et offres

---

## 🔧 Commandes Utiles

### Créer un nouveau compte (via shell)
```bash
source venv/bin/activate
python manage.py createsuperuser
```

### Réinitialiser les données
```bash
rm db.sqlite3
python manage.py migrate
python manage.py init_groups
python manage.py create_test_data
```

### Arrêter l'application
Appuyez sur `Ctrl+C` dans le terminal où tourne `start.sh`

---

## 🌐 URLs Importantes

- **Application**: http://localhost:5173
- **API**: http://localhost:8000/api/
- **Admin Django**: http://localhost:8000/admin
  - Login: `admin / admin123`

---

## ❓ Problèmes Courants

### Port déjà utilisé
```bash
# Tuer les processus Django/Vite
pkill -f "python manage.py runserver"
pkill -f "vite"
# Relancer
./start.sh
```

### Erreur de base de données
```bash
python manage.py migrate
python manage.py create_test_data
```

### Module manquant
```bash
# Backend
source venv/bin/activate
pip install -r requirements.txt

# Frontend
npm install
```

---

## 📚 Documentation Complète

- **RENDU_FINAL.md** - Informations pour le rendu
- **PROJET_INFO.md** - Architecture technique
- **COMPTES_TEST.md** - Liste des comptes de test
- **README.md** - Documentation générale

---

## ✅ Checklist de Test

- [ ] Déposer une offre (anonyme)
- [ ] Se connecter en responsable
- [ ] Valider une offre
- [ ] Se connecter en étudiant
- [ ] Candidater à une offre
- [ ] Voir ses candidatures
- [ ] Se connecter en admin
- [ ] Voir le dashboard avec statistiques
- [ ] Changer l'état d'une offre clôturée
- [ ] Voir les graphiques de candidatures

---

Bon test ! 🎉
