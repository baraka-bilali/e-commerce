# Eulogia Ecommerce - React + Node.js

Application e-commerce avec authentification (e-mail/mot de passe + OTP + Google OAuth).

## Fonctionnalités

- **Inscription** avec vérification OTP par email (SMTP Hostinger)
- **Connexion** classique (email + mot de passe)
- **Google OAuth** pour connexion/inscription directe
- **Plateforme e-commerce** Eulogia avec catalogue de produits

## Prérequis

- Node.js 18+
- Un **Google Client ID** (Google Cloud Console)

## Configuration Google OAuth

1. Allez sur [Google Cloud Console](https://console.cloud.google.com/)
2. Créez un projet → APIs & Services → Credentials
3. Créez un **OAuth 2.0 Client ID** (type: Web application)
4. Ajoutez `http://localhost:5173` dans **Authorized JavaScript origins**
5. Copiez le Client ID dans :
   - `server/.env` → `GOOGLE_CLIENT_ID`
   - `client/.env` → `VITE_GOOGLE_CLIENT_ID`

## Installation

```bash
# Backend
cd server
npm install
cp .env.example .env   # puis éditez .env avec vos identifiants

# Frontend
cd ../client
npm install
cp .env.example .env   # puis ajoutez votre Google Client ID
```

## Lancement

Ouvrez **deux terminaux** :

```bash
# Terminal 1 - API (port 5000)
cd server
npm run dev

# Terminal 2 - React (port 5173)
cd client
npm run dev
```

Ouvrez http://localhost:5173

## Flux d'inscription

1. L'utilisateur remplit le formulaire d'inscription
2. Un code OTP à 6 chiffres est envoyé par email
3. L'utilisateur saisit le code sur la page de vérification
4. Le compte est créé et l'utilisateur accède à la boutique

## Structure

```
e-commerce/
├── client/          # React (Vite)
│   └── src/
│       ├── pages/   # Login, Register, VerifyOtp, Shop
│       └── styles/  # CSS auth + shop
└── server/          # Express API
    ├── routes/      # auth, products
    └── services/    # mail, otp
```
