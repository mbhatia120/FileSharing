from cryptography.fernet import Fernet
from django.conf import settings
import base64
import os

def generate_key():
    return Fernet.generate_key()

def encrypt_file(file_data):
    key = generate_key()
    f = Fernet(key)
    encrypted_data = f.encrypt(file_data)
    return encrypted_data, key

def decrypt_file(encrypted_data, key):
    f = Fernet(key)
    return f.decrypt(encrypted_data)
