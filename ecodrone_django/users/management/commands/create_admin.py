from django.core.management.base import BaseCommand
from users.models import User, Accounts


class Command(BaseCommand):
    help = 'Create an admin superuser with an associated Accounts profile'

    def add_arguments(self, parser):
        parser.add_argument('--email', required=True)
        parser.add_argument('--password', required=True)
        parser.add_argument('--first-name', default='Admin')
        parser.add_argument('--last-name', default='User')
        parser.add_argument('--username', default='admin')

    def handle(self, *args, **options):
        email = options['email']
        password = options['password']

        if User.objects.filter(email=email).exists():
            self.stdout.write(self.style.WARNING(f'User {email} already exists.'))
            return

        user = User.objects.create_superuser(email=email, password=password)
        Accounts.objects.create(
            user=user,
            first_name=options['first_name'],
            last_name=options['last_name'],
            username=options['username'],
        )
        self.stdout.write(self.style.SUCCESS(f'Superuser {email} created successfully.'))
