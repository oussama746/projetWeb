from django.core.management.base import BaseCommand
from django.contrib.auth.models import User, Group
from stages.models import StageOffer, Candidature, StudentProfile
from django.utils import timezone

class Command(BaseCommand):
    help = "Crée des données pour le test de l'espace entreprise"

    def handle(self, *args, **kwargs):
        self.stdout.write("Génération des données Entreprise...")

        # 1. Groupe Entreprise
        group_entreprise, _ = Group.objects.get_or_create(name='Entreprise')

        # 2. Utilisateur Entreprise : 'techcorp'
        company_user, created = User.objects.get_or_create(username='techcorp', email='rh@techcorp.com')
        if created:
            company_user.set_password('password123')
            company_user.groups.add(group_entreprise)
            company_user.save()
            self.stdout.write(" - Utilisateur 'techcorp' créé.")

        # 3. Lier des offres existantes à cette entreprise (ou en créer)
        # On va chercher l'offre "Développeur Python Backend" créée précédemment
        try:
            offer = StageOffer.objects.get(title='Développeur Python Backend')
            offer.company = company_user
            offer.save()
            self.stdout.write(f" - Offre '{offer.title}' liée à techcorp.")
        except StageOffer.DoesNotExist:
            # Créer si n'existe pas
            offer = StageOffer.objects.create(
                title='Développeur Python Backend',
                organisme='TechCorp Solutions',
                contact_name='Jean Dupont',
                contact_email='rh@techcorp.com',
                description='Développement Django.',
                state='Validée',
                company=company_user
            )

        # Créer une 2ème offre pour TechCorp
        offer2, _ = StageOffer.objects.get_or_create(
            title='Stage Fullstack React/Django',
            defaults={
                'organisme': 'TechCorp Solutions',
                'contact_name': 'Jean Dupont',
                'contact_email': 'rh@techcorp.com',
                'description': 'Refonte du dashboard client.',
                'state': 'Validée',
                'company': company_user
            }
        )
        self.stdout.write(f" - Offre '{offer2.title}' créée pour techcorp.")

        # 4. S'assurer qu'il y a des candidats
        students = User.objects.filter(groups__name='Etudiant')
        if students.exists():
            # Alice sur Python (déjà fait normalement)
            c1, _ = Candidature.objects.get_or_create(offer=offer, student=students[0]) # Alice
            # Bob sur Fullstack
            if len(students) > 1:
                c2, _ = Candidature.objects.get_or_create(offer=offer2, student=students[1]) # Bob
                self.stdout.write(f" - {students[1].username} postule à Fullstack.")
                
                # Ajouter un profil complet pour Bob pour tester l'affichage
                profile, _ = StudentProfile.objects.get_or_create(user=students[1])
                profile.bio = "Je suis passionné par React et les architectures modernes."
                profile.phone = "06 99 88 77 66"
                profile.save()

        self.stdout.write(self.style.SUCCESS("Données Entreprise prêtes ! Connectez-vous avec 'techcorp' / 'password123'."))
