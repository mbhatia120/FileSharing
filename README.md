# Secure File Sharing Platform

A secure, enterprise-grade file sharing platform with end-to-end encryption, multi-factor authentication, and granular access controls.

## Installation guide

1. git clone https://github.com/mbhatia120/FileSharing.git
2. cd FileSharing
3. copy contents from https://docs.google.com/document/d/1X4wLxbE8UbTW3J_EqbJIhB937Ju6komSt0IfPrYUDto/edit?usp=sharing to setup.sh file
4. run - sudo ./setup.sh
5. docker compose up --build
6. Front end - http://localhost:5173/
7. Back end - http://localhost:8000/
8. First register on platform, then you will be able to login
9. python manage.py create_admin run on /backend to create admin for the application

## Demo video 

Video link - 

## Table of Contents
- [Overview](#overview)
- [Prerequisites](#prerequisites)

## Overview

This platform provides a secure way to share files with end-to-end encryption. Key features include:

- **User Authentication & Authorization**
  - Multi-factor authentication (MFA)
  - Role-based access control (Admin, Regular User, Guest)
  - JWT-based secure sessions

- **File Management**
  - End-to-end encryption using AES-256
  - Secure file upload and download
  - Client-side encryption/decryption
  
- **Sharing Capabilities**
  - Time-limited shareable links
  - Granular permission controls
  - Secure file transfer

## Prerequisites

- Docker & Docker Compose v20.10.0 or higher
- Node.js v18.0.0 or higher
- Python 3.9 or higher
- Git

