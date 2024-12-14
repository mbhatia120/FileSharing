from django.contrib.auth.models import AbstractUser, BaseUserManager
from django.db import models

class UserManager(BaseUserManager):
    def create_user(self, email, password=None, **extra_fields):
        if not email:
            raise ValueError('The Email field must be set')
        email = self.normalize_email(email)
        user = self.model(email=email, **extra_fields)
        user.set_password(password)
        user.save(using=self._db)
        return user

    def create_superuser(self, email, password=None, **extra_fields):
        extra_fields.setdefault('is_staff', True)
        extra_fields.setdefault('is_superuser', True)
        return self.create_user(email, password, **extra_fields)

class User(AbstractUser):
    username = None  # Remove username field
    email = models.EmailField(unique=True)  # Make email required and unique
    google_id = models.CharField(max_length=100, blank=True, null=True)
    picture = models.URLField(max_length=500, blank=True, null=True)

    class Roles(models.TextChoices):
        ADMIN = 'ADMIN', 'Admin'
        USER = 'USER', 'Regular User'
        GUEST = 'GUEST', 'Guest'

    role = models.CharField(
        max_length=10,
        choices=Roles.choices,
        default=Roles.USER
    )
    mfa_enabled = models.BooleanField(default=False)
    mfa_secret = models.CharField(max_length=32, blank=True, null=True)

    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = []

    objects = UserManager()

    def is_admin(self):
        return self.role == self.Roles.ADMIN

    def is_regular_user(self):
        return self.role == self.Roles.USER

    def is_guest(self):
        return self.role == self.Roles.GUEST
    
    def __str__(self):
        return f"{self.email} ({self.role})"

    class Meta:
        indexes = [
            models.Index(fields=['email']),
            models.Index(fields=['google_id']),
        ]
