const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { OAuth2Client } = require('google-auth-library');
const { sendOtpEmail } = require('../services/mail');
const { storeOtp, verifyOtp } = require('../services/otp');

const router = express.Router();
const users = [];
const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

function createToken(user) {
  return jwt.sign(
    { id: user.id, email: user.email, name: user.name },
    process.env.JWT_SECRET,
    { expiresIn: '7d' }
  );
}

function formatUser(user) {
  return { id: user.id, email: user.email, name: user.name };
}

router.post('/register', async (req, res) => {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Tous les champs sont requis.' });
    }
    if (password.length < 6) {
      return res.status(400).json({ message: 'Le mot de passe doit contenir au moins 6 caractères.' });
    }
    if (users.find((u) => u.email === email.toLowerCase())) {
      return res.status(409).json({ message: 'Cet email est déjà utilisé.' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const otp = storeOtp(email, { name, email: email.toLowerCase(), password: hashedPassword });
    await sendOtpEmail(email, otp);

    res.json({ message: 'Un code de vérification a été envoyé à votre email.', email });
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({ message: "Erreur lors de l'envoi de l'email. Vérifiez la configuration SMTP." });
  }
});

router.post('/verify-otp', async (req, res) => {
  const { email, otp } = req.body;
  if (!email || !otp) {
    return res.status(400).json({ message: 'Email et code requis.' });
  }

  const result = verifyOtp(email, otp);
  if (!result.valid) {
    return res.status(400).json({ message: result.message });
  }

  const user = {
    id: users.length + 1,
    name: result.data.name,
    email: result.data.email,
    password: result.data.password,
    provider: 'local',
  };
  users.push(user);

  const token = createToken(user);
  res.json({ message: 'Compte créé avec succès.', token, user: formatUser(user) });
});

router.post('/resend-otp', async (req, res) => {
  try {
    const { email } = req.body;
    const existing = users.find((u) => u.email === email?.toLowerCase());
    if (existing) {
      return res.status(409).json({ message: 'Cet email est déjà vérifié.' });
    }
    return res.status(400).json({ message: 'Veuillez recommencer l\'inscription.' });
  } catch (error) {
    res.status(500).json({ message: 'Erreur serveur.' });
  }
});

router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ message: 'Email et mot de passe requis.' });
  }

  const user = users.find((u) => u.email === email.toLowerCase());
  if (!user) {
    return res.status(401).json({ message: 'Email ou mot de passe incorrect.' });
  }

  const valid = await bcrypt.compare(password, user.password);
  if (!valid) {
    return res.status(401).json({ message: 'Email ou mot de passe incorrect.' });
  }

  const token = createToken(user);
  res.json({ token, user: formatUser(user) });
});

router.post('/google', async (req, res) => {
  try {
    const { credential } = req.body;
    if (!credential) {
      return res.status(400).json({ message: 'Token Google requis.' });
    }

    const ticket = await googleClient.verifyIdToken({
      idToken: credential,
      audience: process.env.GOOGLE_CLIENT_ID,
    });
    const payload = ticket.getPayload();
    const email = payload.email.toLowerCase();
    const name = payload.name || payload.email;

    let user = users.find((u) => u.email === email);
    if (!user) {
      user = {
        id: users.length + 1,
        name,
        email,
        password: null,
        provider: 'google',
        picture: payload.picture,
      };
      users.push(user);
    }

    const token = createToken(user);
    res.json({ token, user: { ...formatUser(user), picture: user.picture } });
  } catch (error) {
    console.error('Google auth error:', error);
    res.status(401).json({ message: 'Authentification Google échouée.' });
  }
});

router.get('/me', (req, res) => {
  const header = req.headers.authorization;
  if (!header?.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Non authentifié.' });
  }
  try {
    const decoded = jwt.verify(header.split(' ')[1], process.env.JWT_SECRET);
    const user = users.find((u) => u.id === decoded.id);
    if (!user) return res.status(404).json({ message: 'Utilisateur introuvable.' });
    res.json({ user: { ...formatUser(user), picture: user.picture } });
  } catch {
    res.status(401).json({ message: 'Token invalide.' });
  }
});

module.exports = router;
