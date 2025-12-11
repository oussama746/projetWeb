# 📌 Fonctionnalité : Système de Favoris

## 📝 Description
Système permettant aux **étudiants** d'enregistrer leurs offres de stage favorites pour y accéder rapidement plus tard.

## ✨ Fonctionnalités

### Pour les Étudiants
- ✅ **Ajouter aux favoris** : Cliquer sur l'icône ❤️ sur une offre
- ✅ **Retirer des favoris** : Cliquer à nouveau sur l'icône ❤️ remplie
- ✅ **Page Mes Favoris** : Voir toutes les offres favorites en un seul endroit
- ✅ **Indication visuelle** : Les offres favorites ont une icône ❤️ remplie en rouge

## 🔧 Implémentation Technique

### Backend (Django)

#### Nouveau Modèle
```python
class Favorite(models.Model):
    student = models.ForeignKey(User, on_delete=models.CASCADE, related_name='favorites')
    offer = models.ForeignKey(StageOffer, on_delete=models.CASCADE, related_name='favorited_by')
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        unique_together = ('student', 'offer')  # Un étudiant ne peut favoriser qu'une fois une offre
```

#### API Endpoints
| Méthode | Endpoint | Description |
|---------|----------|-------------|
| GET | `/api/favorites/` | Liste des offres favorites de l'étudiant |
| POST | `/api/favorites/` | Ajouter une offre aux favoris (body: `{"offer_id": 1}`) |
| DELETE | `/api/favorites/?offer_id=1` | Retirer une offre des favoris |
| GET | `/api/favorites/<offer_id>/check/` | Vérifier si une offre est favorite |

#### Permissions
- ✅ Seuls les **étudiants** peuvent gérer des favoris
- ✅ Authentification requise pour toutes les opérations

### Frontend (React)

#### Nouvelles Pages
- **`/favoris`** : Page listant toutes les offres favorites

#### Composants Modifiés
- **Internships.tsx** : Ajout de l'icône ❤️ sur chaque carte d'offre
- **Navbar.tsx** : Ajout du lien "Mes favoris" pour les étudiants

#### État Local
```typescript
const [favorites, setFavorites] = useState<Set<number>>(new Set());
```

## 🎯 Cas d'Usage

### Scénario 1 : Étudiant découvre une offre intéressante
1. L'étudiant parcourt les offres de stage
2. Il trouve une offre qui l'intéresse mais veut postuler plus tard
3. Il clique sur l'icône ❤️ pour l'ajouter aux favoris
4. L'offre est enregistrée instantanément

### Scénario 2 : Étudiant consulte ses favoris
1. L'étudiant clique sur "Mes favoris" dans la navbar
2. Il voit toutes ses offres favorites
3. Il peut cliquer sur "Voir l'offre" pour accéder au détail
4. Il peut retirer une offre de ses favoris en cliquant sur ❤️

## 🚀 Utilisation

### Ajouter aux favoris
```typescript
const toggleFavorite = async (offerId: number) => {
  if (favorites.has(offerId)) {
    await api.delete(`/favorites/?offer_id=${offerId}`);
    // Retirer du state local
  } else {
    await api.post('/favorites/', { offer_id: offerId });
    // Ajouter au state local
  }
};
```

### Charger les favoris
```typescript
const loadFavorites = async () => {
  const response = await api.get('/favorites/');
  const favoriteIds = new Set(response.data.map(offer => offer.id));
  setFavorites(favoriteIds);
};
```

## 📊 Base de Données

### Migration
```bash
python manage.py makemigrations  # Crée 0006_favorite.py
python manage.py migrate         # Applique la migration
```

### Structure Table `stages_favorite`
| Colonne | Type | Description |
|---------|------|-------------|
| id | INTEGER | Clé primaire |
| student_id | INTEGER | FK vers User (étudiant) |
| offer_id | INTEGER | FK vers StageOffer |
| created_at | DATETIME | Date d'ajout aux favoris |

### Contrainte
```sql
UNIQUE (student_id, offer_id)  -- Évite les doublons
```

## ✅ Tests Effectués

- ✅ Ajouter une offre aux favoris
- ✅ Retirer une offre des favoris
- ✅ Afficher la liste des favoris
- ✅ Indication visuelle (icône remplie)
- ✅ Protection : seuls les étudiants peuvent utiliser les favoris
- ✅ Gestion des erreurs (offre inexistante, etc.)

## 🎨 Interface Utilisateur

### Icône Favori
- **Non favori** : ❤️ gris
- **Favori** : ❤️ rouge rempli
- **Au survol** : Changement de couleur

### Page Favoris
- **Vide** : Message avec bouton "Découvrir les offres"
- **Avec favoris** : Grille de cartes avec toutes les infos
- **Actions** : Voir l'offre / Retirer des favoris

## 🔐 Sécurité

- ✅ Authentification requise
- ✅ Vérification du rôle (étudiant uniquement)
- ✅ Validation des IDs d'offres
- ✅ Protection CSRF
- ✅ Protection contre les doublons (unique_together)

## 📈 Améliorations Futures

- 📧 Notification par email si une offre favorite est clôturée
- 🔔 Badge avec le nombre de nouveaux favoris
- 📊 Statistiques : offres les plus favorites
- 🏷️ Tags/catégories pour organiser les favoris
- 🔍 Recherche dans les favoris

## 🎉 Bonus pour le Projet

Cette fonctionnalité ajoute :
- ✨ **UX améliorée** pour les étudiants
- 💾 **Persistance** des intérêts
- 🎯 **Engagement** accru sur la plateforme
- 📊 **Données analytics** sur les offres populaires

---

**Date d'implémentation** : Décembre 2025  
**Statut** : ✅ Opérationnel
