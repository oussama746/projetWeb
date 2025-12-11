from django.contrib.auth.models import User
from stages.models import StageOffer, Candidature, StudentProfile
from django.utils import timezone

# ---------------------
# 1️⃣ Création entreprises
# ---------------------
companies_data = [
    ("techcorp", "TechCorp Solutions", "contact@techcorp.com"),
    ("cyberia", "Cyberia Labs", "hr@cyberia.com"),
    ("greenbyte", "GreenByte", "jobs@greenbyte.com"),
]

companies = []

for username, name, email in companies_data:
    user, created = User.objects.get_or_create(
        username=username,
        defaults={"email": email, "first_name": name}
    )
    user.set_password("password123")
    user.save()
    companies.append(user)

print("Entreprises créées :", [c.username for c in companies])


# ---------------------
# 2️⃣ Création étudiants + profils
# ---------------------
students_data = [
    ("alice", "Alice", "Martin", "alice@example.com"),
    ("bob", "Bob", "Durand", "bob@example.com"),
    ("charlie", "Charlie", "Bernard", "charlie@example.com"),
]

students = []

for username, first, last, email in students_data:
    user, created = User.objects.get_or_create(
        username=username,
        defaults={"first_name": first, "last_name": last, "email": email}
    )
    user.set_password("password123")
    user.save()

    profile, _ = StudentProfile.objects.get_or_create(
        user=user,
        defaults={"bio": "Étudiant motivé et passionné par l'informatique."}
    )

    students.append(user)

print("Étudiants créés :", [s.username for s in students])


# ---------------------
# 3️⃣ Création offres de stage
# ---------------------
offers_data = [
    {
        "organisme": "TechCorp",
        "contact_name": "Mme Lambert",
        "contact_email": "lambert@techcorp.com",
        "title": "Développeur Web Django",
        "description": "Stage de 6 mois en développement web.",
        "company": companies[0]
    },
    {
        "organisme": "Cyberia Labs",
        "contact_name": "Dr Simon",
        "contact_email": "simon@cyberia.com",
        "title": "Analyse Cybersécurité",
        "description": "Stage en audit de sécurité.",
        "company": companies[1]
    },
]

offers = []

for data in offers_data:
    offer = StageOffer.objects.create(
        organisme=data["organisme"],
        contact_name=data["contact_name"],
        contact_email=data["contact_email"],
        title=data["title"],
        description=data["description"],
        company=data["company"],
        state="Validée",
        date_depot=timezone.now()
    )
    offers.append(offer)

print("Offres créées :", [o.title for o in offers])


# ---------------------
# 4️⃣ Création candidatures
# ---------------------
Candidature.objects.create(
    offer=offers[0],
    student=students[0],
    status="En attente"
)

Candidature.objects.create(
    offer=offers[0],
    student=students[1],
    status="Acceptée"
)

Candidature.objects.create(
    offer=offers[1],
    student=students[2],
    status="Refusée"
)

print("Candidatures ajoutées !")

print("\n🎉 Population terminée avec succès !")
