from google.oauth2 import id_token
from google.auth.transport import requests
import requests as http_requests
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

def verify_google_token(code, redirect_uri):
    try:
        client_id = os.getenv('GOOGLE_OAUTH2_CLIENT_ID')
        client_secret = os.getenv('GOOGLE_OAUTH2_CLIENT_SECRET')

        print("Token verification config:", {
            'client_id_length': len(client_id) if client_id else None,
            'redirect_uri': redirect_uri,
            'code_length': len(code) if code else None
        })

        if not client_id or not client_secret:
            raise ValueError("Google OAuth2 credentials not found in environment variables")

        token_endpoint = 'https://oauth2.googleapis.com/token'
        data = {
            'code': code,
            'client_id': client_id,
            'client_secret': client_secret,
            'redirect_uri': redirect_uri,
            'grant_type': 'authorization_code',
            'access_type': 'offline'
        }

        print("Making token exchange request...")
        response = http_requests.post(token_endpoint, data=data)
        print("Token exchange status:", response.status_code)
        token_data = response.json()
        print("Token exchange response:", token_data)

        if 'error' in token_data:
            error_msg = token_data.get('error_description', token_data['error'])
            error_details = {
                'error': error_msg,
                'error_uri': token_data.get('error_uri'),
                'error_description': token_data.get('error_description')
            }
            print("Token exchange error details:", error_details)
            raise ValueError(f"Token exchange failed: {error_msg}")

        print("Verifying ID token...")
        # Verify the ID token
        idinfo = id_token.verify_oauth2_token(
            token_data['id_token'],
            requests.Request(),
            client_id,
            clock_skew_in_seconds=60  # Allow some clock skew
        )
        
        if idinfo['iss'] not in ['accounts.google.com', 'https://accounts.google.com']:
            raise ValueError('Invalid issuer.')
            
        print(f"Successfully verified token for email: {idinfo['email']}")
        return {
            'email': idinfo['email'],
            'email_verified': idinfo['email_verified'],
            'name': idinfo.get('name'),
            'picture': idinfo.get('picture'),
            'sub': idinfo.get('sub')
        }
        
    except Exception as e:
        print(f"Error in verify_google_token: {str(e)}")
        raise ValueError(f'Token verification failed: {str(e)}') 