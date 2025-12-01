from django.core.management.base import BaseCommand
from django.contrib.auth.models import User, Group
from stages.models import StageOffer, Candidature
from django.utils import timezone
import random

class Command(BaseCommand):
    help = 'Creates default groups, users, and sample data for testing'

    def handle(self, *args, **options):
        # 1. Define groups
        groups = ['Administrateur', 'Responsable', 'Etudiant']
        for group_name in groups:
            group, created = Group.objects.get_or_create(name=group_name)
            if created:
                self.stdout.write(self.style.SUCCESS(f'Group "{group_name}" created'))

        # 2. Define base users
        users = [
            {'username': 'admin_user', 'password': 'password123', 'group': 'Administrateur', 'email': 'admin@example.com', 'is_staff': True, 'is_superuser': True},
            {'username': 'manager_user', 'password': 'password123', 'group': 'Responsable', 'email': 'manager@example.com', 'is_staff': False, 'is_superuser': False},
            {'username': 'student_user', 'password': 'password123', 'group': 'Etudiant', 'email': 'student@example.com', 'is_staff': False, 'is_superuser': False},
        ]

        # Add more students for testing limits
        for i in range(1, 6):
            users.append({
                'username': f'etudiant{i}',
                'password': 'password123',
                'group': 'Etudiant',
                'email': f'etudiant{i}@example.com',
                'is_staff': False,
                'is_superuser': False
            })

        created_users = {}
        for user_data in users:
            user, created = User.objects.get_or_create(
                username=user_data['username'],
                defaults={
                    'email': user_data['email'],
                    'is_staff': user_data['is_staff'],
                    'is_superuser': user_data['is_superuser']
                }
            )
            
            if created:
                user.set_password(user_data['password'])
                user.save()
                self.stdout.write(self.style.SUCCESS(f'User "{user_data["username"]}" created'))
            
            # Assign group
            group = Group.objects.get(name=user_data['group'])
            user.groups.add(group)
            created_users[user_data['username']] = user

        self.stdout.write(self.style.SUCCESS('Users and Groups initialized.'))

        # 3. Create Sample Offers
        offers_data = [
            {
                'organisme': 'Tech Corp', 'contact_name': 'Alice Smith', 'contact_email': 'alice@techcorp.com',
                'title': 'Développeur Python Junior', 'description': 'Stage de 6 mois en développement backend Django.',
                'state': 'Validée'
            },
            {
                'organisme': 'Web Agency', 'contact_name': 'Bob Jones', 'contact_email': 'bob@webagency.com',
                'title': 'Intégrateur Web', 'description': 'Création de templates HTML/CSS/JS.',
                'state': 'En attente validation'
            },
            {
                'organisme': 'Data Solutions', 'contact_name': 'Charlie Brown', 'contact_email': 'charlie@datasolutions.com',
                'title': 'Assistant Data Scientist', 'description': 'Analyse de données et ML avec Python.',
                'state': 'Refusée'
            },
            {
                'organisme': 'Cloud Systems', 'contact_name': 'David White', 'contact_email': 'david@cloudsys.com',
                'title': 'Stage DevOps', 'description': 'Mise en place de pipelines CI/CD.',
                'state': 'Validée'
            },
             {
                'organisme': 'Mobile Apps Inc', 'contact_name': 'Eva Green', 'contact_email': 'eva@mobileapps.com',
                'title': 'Développeur React Native', 'description': 'Développement d\'applications mobiles cross-platform.',
                'state': 'Validée' # Will be closed by script logic below to demonstrate max candidates
            },
             {
                'organisme': 'Security First', 'contact_name': 'Frank Black', 'contact_email': 'frank@secfirst.com',
                'title': 'Audit de Sécurité', 'description': 'Pentesting et audit de code.',
                'state': 'En attente validation'
            }
        ]

        created_offers = []
        for offer_data in offers_data:
            offer, created = StageOffer.objects.get_or_create(
                title=offer_data['title'],
                defaults={
                    'organisme': offer_data['organisme'],
                    'contact_name': offer_data['contact_name'],
                    'contact_email': offer_data['contact_email'],
                    'description': offer_data['description'],
                    'state': offer_data['state']
                }
            )
            created_offers.append(offer)
        
        self.stdout.write(self.style.SUCCESS('Sample Offers created.'))

        # 4. Create Candidatures
        
        # 'student_user' applies to 'Développeur Python Junior' and 'Stage DevOps'
        student_user = created_users['student_user']
        
        offer_python = StageOffer.objects.get(title='Développeur Python Junior')
        Candidature.objects.get_or_create(student=student_user, offer=offer_python)

        offer_devops = StageOffer.objects.get(title='Stage DevOps')
        Candidature.objects.get_or_create(student=student_user, offer=offer_devops)

        # Demonstrate Max Candidates (Clôturée) on 'Développeur React Native'
        offer_react = StageOffer.objects.get(title='Développeur React Native')
        
        # Have 5 students apply
        students_for_react = ['etudiant1', 'etudiant2', 'etudiant3', 'etudiant4', 'etudiant5']
        for student_name in students_for_react:
            st = created_users[student_name]
            Candidature.objects.get_or_create(student=st, offer=offer_react)
        
        # Manually close it to ensure consistency with logic (though the view does it, the script is direct DB)
        offer_react.state = 'Clôturée'
        offer_react.closing_reason = "Automatique : Limite de 5 candidatures atteinte"
        offer_react.save()

        self.stdout.write(self.style.SUCCESS('Sample Candidatures created and React Native offer closed (5 candidates).'))

