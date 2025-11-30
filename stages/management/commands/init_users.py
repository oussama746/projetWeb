from django.core.management.base import BaseCommand
from django.contrib.auth.models import User, Group

class Command(BaseCommand):
    help = 'Creates default groups and users for testing'

    def handle(self, *args, **options):
        # Define groups
        groups = ['Administrateur', 'Responsable', 'Etudiant']
        for group_name in groups:
            group, created = Group.objects.get_or_create(name=group_name)
            if created:
                self.stdout.write(self.style.SUCCESS(f'Group "{group_name}" created'))
            else:
                self.stdout.write(f'Group "{group_name}" already exists')

        # Define users
        users = [
            {'username': 'admin_user', 'password': 'password123', 'group': 'Administrateur', 'email': 'admin@example.com', 'is_staff': True, 'is_superuser': True},
            {'username': 'manager_user', 'password': 'password123', 'group': 'Responsable', 'email': 'manager@example.com', 'is_staff': False, 'is_superuser': False},
            {'username': 'student_user', 'password': 'password123', 'group': 'Etudiant', 'email': 'student@example.com', 'is_staff': False, 'is_superuser': False},
        ]

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
            else:
                self.stdout.write(f'User "{user_data["username"]}" already exists')

            # Assign group
            group = Group.objects.get(name=user_data['group'])
            user.groups.add(group)
            self.stdout.write(f'User "{user_data["username"]}" added to group "{user_data["group"]}"')

        self.stdout.write(self.style.SUCCESS('Successfully initialized users and groups'))
