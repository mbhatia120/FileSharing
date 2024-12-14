from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model

User = get_user_model()

class Command(BaseCommand):
    help = 'Creates an admin user'

    def handle(self, *args, **options):
        email = input('Enter admin email: ')
        password = input('Enter admin password: ')
        
        try:
            admin = User.objects.create_user(
                email=email,
                password=password,
                role='ADMIN',
                is_staff=True,
                is_superuser=True
            )
            self.stdout.write(self.style.SUCCESS(f'Admin user created successfully: {admin.email}'))
        except Exception as e:
            self.stdout.write(self.style.ERROR(f'Error creating admin user: {str(e)}')) 