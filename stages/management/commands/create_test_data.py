from django.core.management.base import BaseCommand
from django.contrib.auth.models import User, Group
from stages.models import StageOffer, Candidature, StudentProfile
from datetime import datetime, timedelta
import random


class Command(BaseCommand):
    help = 'Create test data for the application'

    def handle(self, *args, **kwargs):
        self.stdout.write('Creating test users...')
        
        # Get or create groups
        etudiant_group, _ = Group.objects.get_or_create(name='Etudiant')
        entreprise_group, _ = Group.objects.get_or_create(name='Entreprise')
        responsable_group, _ = Group.objects.get_or_create(name='Responsable')
        admin_group, _ = Group.objects.get_or_create(name='Administrateur')
        
        # Create admin
        admin, created = User.objects.get_or_create(
            username='admin',
            defaults={'email': 'admin@iut-orsay.fr', 'is_superuser': True, 'is_staff': True}
        )
        if created:
            admin.set_password('admin123')
            admin.save()
            admin.groups.add(admin_group)
            self.stdout.write(self.style.SUCCESS('✓ Admin créé'))
        
        # Create responsable
        resp, created = User.objects.get_or_create(
            username='responsable',
            defaults={'email': 'responsable@iut-orsay.fr', 'first_name': 'Marie', 'last_name': 'Dupont'}
        )
        if created:
            resp.set_password('resp123')
            resp.save()
            resp.groups.add(responsable_group)
            self.stdout.write(self.style.SUCCESS('✓ Responsable créé'))
        
        # Create companies
        companies = [
            ('TechCorp', 'techcorp', 'contact@techcorp.fr'),
            ('DataSolutions', 'datasolutions', 'rh@datasolutions.fr'),
            ('WebAgency', 'webagency', 'stages@webagency.fr'),
        ]
        
        company_users = []
        for name, username, email in companies:
            user, created = User.objects.get_or_create(
                username=username,
                defaults={'email': email, 'first_name': name, 'last_name': 'Company'}
            )
            if created:
                user.set_password('entr123')
                user.save()
                user.groups.add(entreprise_group)
                self.stdout.write(self.style.SUCCESS(f'✓ Entreprise {name} créée'))
            company_users.append(user)
        
        # Create students
        students = []
        for i in range(1, 8):
            user, created = User.objects.get_or_create(
                username=f'etudiant{i}',
                defaults={
                    'email': f'etudiant{i}@iut-orsay.fr',
                    'first_name': f'Étudiant{i}',
                    'last_name': f'Nom{i}'
                }
            )
            if created:
                user.set_password('etud123')
                user.save()
                user.groups.add(etudiant_group)
                StudentProfile.objects.get_or_create(
                    user=user,
                    defaults={
                        'bio': f'Étudiant en BUT Informatique, passionné par le développement.',
                        'phone': f'06{i:02d}{i:02d}{i:02d}{i:02d}{i:02d}'
                    }
                )
                self.stdout.write(self.style.SUCCESS(f'✓ Étudiant{i} créé'))
            students.append(user)
        
        # Create stage offers
        self.stdout.write('\nCréation des offres de stage...')
        
        offers_data = [
            {
                'title': 'Stage Développeur Web Full Stack',
                'organisme': 'TechCorp',
                'description': 'Développement d\'une application web moderne avec React et Django. Vous travaillerez sur des projets innovants en équipe agile.',
                'state': 'Validée',
                'company': company_users[0] if company_users else None
            },
            {
                'title': 'Stage Data Scientist',
                'organisme': 'DataSolutions',
                'description': 'Analyse de données massives, machine learning et visualisation. Python, TensorFlow, Pandas.',
                'state': 'Validée',
                'company': company_users[1] if company_users else None
            },
            {
                'title': 'Stage Développeur Mobile',
                'organisme': 'WebAgency',
                'description': 'Développement d\'applications mobiles iOS et Android avec React Native.',
                'state': 'En attente validation',
                'company': company_users[2] if company_users else None
            },
            {
                'title': 'Stage DevOps',
                'organisme': 'CloudTech Inc.',
                'description': 'Configuration et maintenance d\'infrastructures cloud (AWS, Docker, Kubernetes).',
                'state': 'Validée',
            },
            {
                'title': 'Stage Cybersécurité',
                'organisme': 'SecureIT',
                'description': 'Audit de sécurité, tests de pénétration, mise en place de solutions de protection.',
                'state': 'En attente validation',
            },
            {
                'title': 'Stage Développeur Backend',
                'organisme': 'ApiFirst',
                'description': 'Développement d\'APIs REST et GraphQL, Node.js et PostgreSQL.',
                'state': 'Validée',
            },
            {
                'title': 'Stage UX/UI Designer',
                'organisme': 'DesignLab',
                'description': 'Conception d\'interfaces utilisateur, prototypage avec Figma.',
                'state': 'Refusée',
            },
            {
                'title': 'Stage Administrateur Systèmes',
                'organisme': 'SysAdmin Pro',
                'description': 'Administration de serveurs Linux, automatisation avec Ansible.',
                'state': 'Validée',
            },
        ]
        
        created_offers = []
        for i, offer_data in enumerate(offers_data):
            # Vary creation dates
            days_ago = random.randint(1, 60)
            
            offer, created = StageOffer.objects.get_or_create(
                title=offer_data['title'],
                defaults={
                    **offer_data,
                    'contact_name': f'Contact {i+1}',
                    'contact_email': f'contact{i+1}@example.com',
                }
            )
            
            if created:
                # Manually set creation date
                offer.date_depot = datetime.now() - timedelta(days=days_ago)
                offer.save()
                created_offers.append(offer)
                self.stdout.write(self.style.SUCCESS(f'✓ Offre "{offer.title}" créée'))
        
        # Create some candidatures
        self.stdout.write('\nCréation des candidatures...')
        
        validated_offers = [o for o in created_offers if o.state == 'Validée']
        
        if students and validated_offers:
            for offer in validated_offers[:4]:  # First 4 validated offers
                # Random number of candidates (1-3 per offer)
                num_candidates = random.randint(1, 3)
                selected_students = random.sample(students, min(num_candidates, len(students)))
                
                for student in selected_students:
                    candidature, created = Candidature.objects.get_or_create(
                        student=student,
                        offer=offer,
                        defaults={'status': random.choice(['En attente', 'En attente', 'Acceptée'])}
                    )
                    if created:
                        # Vary candidature dates
                        days_ago = random.randint(1, 30)
                        candidature.date_candidature = datetime.now() - timedelta(days=days_ago)
                        candidature.save()
                        self.stdout.write(
                            self.style.SUCCESS(
                                f'✓ Candidature: {student.username} → {offer.title}'
                            )
                        )
        
        self.stdout.write(self.style.SUCCESS('\n✅ Données de test créées avec succès!'))
        self.stdout.write('\nComptes créés:')
        self.stdout.write('  Admin: admin / admin123')
        self.stdout.write('  Responsable: responsable / resp123')
        self.stdout.write('  Entreprises: techcorp, datasolutions, webagency / entr123')
        self.stdout.write('  Étudiants: etudiant1-7 / etud123')
