# 🚀 Guide de lancement du projet

## Lancement rapide

### Backend Django
```bash
./start_django_local.sh
```

### Frontend React
```bash
npm run dev
```

## URLs
- **Frontend:** http://localhost:8080
- **Backend API:** http://localhost:8000/api/
- **Admin:** http://localhost:8000/admin/ (admin/admin123)

## Comptes de test
- **Admin:** admin / admin123
- **Étudiant:** etudiant1 / etu123  
- **Manager:** manager_accenture / manager123

## 📊 Nouveauté : Statistiques Chart.js

Le dashboard administrateur affiche maintenant :
- 📈 Courbes d'évolution sur 12 mois (candidatures et offres)
- 🍩 Graphique Doughnut (répartition des offres)
- 🥧 Graphique Pie (statut des candidatures)
- 📊 Top 5 des offres populaires (Bar chart)

Toutes les statistiques sont calculées en temps réel depuis la base Django !
