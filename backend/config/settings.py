import os
from pathlib import Path
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

INSTALLED_APPS = [
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',
    'rest_framework',
    'corsheaders',
    'apps.authentication',
    'apps.files',
]

AUTH_USER_MODEL = 'authentication.User'

REST_FRAMEWORK = {
    'DEFAULT_AUTHENTICATION_CLASSES': [
        'rest_framework_simplejwt.authentication.JWTAuthentication',
    ],
} 

# Google OAuth2 settings from environment variables
GOOGLE_OAUTH2_CLIENT_ID = os.getenv('GOOGLE_OAUTH2_CLIENT_ID')
GOOGLE_OAUTH2_CLIENT_SECRET = os.getenv('GOOGLE_OAUTH2_CLIENT_SECRET')

# Validate required settings
if not GOOGLE_OAUTH2_CLIENT_ID or not GOOGLE_OAUTH2_CLIENT_SECRET:
    raise ValueError("Google OAuth2 credentials not found in environment variables")

CORS_ALLOWED_ORIGINS = [
    "http://localhost:5173",  # Your frontend development server
    # Add your production domain when deploying
]

CORS_ALLOW_CREDENTIALS = True 

# Add these headers to the allowed list
CORS_ALLOW_HEADERS = [
    "accept",
    "accept-encoding",
    "authorization",
    "content-type",
    "dnt",
    "origin",
    "user-agent",
    "x-csrftoken",
    "x-requested-with",
]

MIDDLEWARE = [
    'corsheaders.middleware.CorsMiddleware',  # Add this before CommonMiddleware
    'django.middleware.common.CommonMiddleware',
    # ... other middleware ...
]

# Add these settings at the end of the file
try:
    from .local_settings import *
except ImportError:
    GOOGLE_OAUTH2_CLIENT_ID = 'your-client-id'
    GOOGLE_OAUTH2_CLIENT_SECRET = 'your-client-secret'

# Make sure these settings are available
if not hasattr(globals(), 'GOOGLE_OAUTH2_CLIENT_ID') or not hasattr(globals(), 'GOOGLE_OAUTH2_CLIENT_SECRET'):
    raise ValueError("Google OAuth2 settings are not configured. Please check your local_settings.py")

# Make sure your apps are in the Python path
import sys
APPS_DIR = os.path.join(BASE_DIR, 'apps')
sys.path.insert(0, APPS_DIR)