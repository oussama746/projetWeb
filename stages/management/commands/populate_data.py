import random
from django.core.management.base import BaseCommand
from django.contrib.auth.models import User, Group
from stages.models import StageOffer, Candidature
from django.utils import timezone

class Command(BaseCommand):
    help = "Peuple la base de données avec des offres et des candidatures fictives"

    def handle(self, *args, **kwargs):
        self.stdout.write("Début de la génération des données...")

        # 1. Création du groupe Etudiant s'il n'existe pas
        group_etudiant, created = Group.objects.get_or_create(name='Etudiant')

        # 2. Création de 6 étudiants fictifs
        students = []
        student_data = [
            ('alice', 'alice@test.com'),
            ('bob', 'bob@test.com'),
            ('charlie', 'charlie@test.com'),
            ('david', 'david@test.com'),
            ('eve', 'eve@test.com'),
            ('frank', 'frank@test.com'),
        ]

        for username, email in student_data:
            user, created = User.objects.get_or_create(username=username, email=email)
            if created:
                user.set_password('password123') # Mot de passe par défaut
                user.groups.add(group_etudiant)
                user.save()
                self.stdout.write(f" - Étudiant créé : {username}")
            else:
                self.stdout.write(f" - Étudiant existant : {username}")
            students.append(user)

        # 3. Création des Offres
        offers_data = [
            {
                'title': 'Développeur Python Backend',
                'organisme': 'TechCorp Solutions',
                'contact_name': 'Jean Dupont',
                'contact_email': 'rh@techcorp.com',
                'description': 'Stage de 6 mois sur Django et API REST. Télétravail possible.',
                'state': 'Validée'
            },
            {
                'title': 'Assistant Marketing Digital',
                'organisme': 'MarketAgency',
                'contact_name': 'Sophie Martin',
                'contact_email': 'recrutement@marketagency.fr',
                'description': 'Gestion des réseaux sociaux et SEO. Créativité demandée.',
                'state': 'Validée'
            },
            {
                'title': 'Ingénieur Réseau Junior',
                'organisme': 'NetSecure',
                'contact_name': 'Marc Weber',
                'contact_email': 'm.weber@netsecure.net',
                'description': 'Configuration de switchs Cisco et monitoring. Stage présentiel.',
                'state': 'En attente validation'
            },
            {
                'title': 'Data Analyst',
                'organisme': 'BigData & Co',
                'contact_name': 'Laura K.',
                'contact_email': 'jobs@bigdataco.com',
                'description': 'Analyse de données clients avec Pandas et Tableau. Offre très prisée !',
                'state': 'Clôturée',
                'closing_reason': 'Automatique : Limite de 5 candidatures atteinte'
            },
             {
                'title': 'Stage DevOps Cloud',
                'organisme': 'CloudNine',
                'contact_name': 'Alex Cloud',
                'contact_email': 'alex@cloudnine.io',
                'description': 'AWS, Docker et Kubernetes. Pour passionnés d\'infra.',
                'state': 'Validée'
            }
        ]

        created_offers = []
        for offer_info in offers_data:
            offer, created = StageOffer.objects.get_or_create(
                title=offer_info['title'],
                defaults={
                    'organisme': offer_info['organisme'],
                    'contact_name': offer_info['contact_name'],
                    'contact_email': offer_info['contact_email'],
                    'description': offer_info['description'],
                    'state': offer_info['state'],
                    'closing_reason': offer_info.get('closing_reason')
                }
            )
            if created:
                self.stdout.write(f" - Offre créée : {offer.title} ({offer.state})")
            created_offers.append(offer)

        # 4. Création des Candidatures
        
        # Offre "Clôturée" (Data Analyst) : Il faut 5 candidats pour justifier la clôture
        offer_closed = StageOffer.objects.get(title='Data Analyst')
        # On prend les 5 premiers étudiants
        for student in students[:5]:
            cand, created = Candidature.objects.get_or_create(offer=offer_closed, student=student)
            if created:
                self.stdout.write(f"   -> {student.username} a postulé à {offer_closed.title}")

        # Offre Validée 1 (Dev Python) : 2 candidats
        offer_python = StageOffer.objects.get(title='Développeur Python Backend')
        for student in [students[0], students[2]]: # Alice et Charlie
            cand, created = Candidature.objects.get_or_create(offer=offer_python, student=student)
            if created:
                 self.stdout.write(f"   -> {student.username} a postulé à {offer_python.title}")

        # Offre Validée 2 (Marketing) : 1 candidat
        offer_marketing = StageOffer.objects.get(title='Assistant Marketing Digital')
        cand, created = Candidature.objects.get_or_create(offer=offer_marketing, student=students[1]) # Bob
        if created:
             self.stdout.write(f"   -> {students[1].username} a postulé à {offer_marketing.title}")

        self.stdout.write(self.style.SUCCESS("Données générées avec succès !"))
