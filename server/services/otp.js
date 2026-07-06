const pendingOtps = new Map();

function generateOtp() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

function storeOtp(email, data) {
  pendingOtps.set(email.toLowerCase(), {
    ...data,
    otp: generateOtp(),
    expiresAt: Date.now() + 10 * 60 * 1000,
  });
  return pendingOtps.get(email.toLowerCase()).otp;
}

function verifyOtp(email, otp) {
  const entry = pendingOtps.get(email.toLowerCase());
  if (!entry) return { valid: false, message: 'Aucun code en attente pour cet email.' };
  if (Date.now() > entry.expiresAt) {
    pendingOtps.delete(email.toLowerCase());
    return { valid: false, message: 'Le code a expiré. Veuillez vous réinscrire.' };
  }
  if (entry.otp !== otp) {
    return { valid: false, message: 'Code incorrect.' };
  }
  const data = { ...entry };
  delete data.otp;
  delete data.expiresAt;
  pendingOtps.delete(email.toLowerCase());
  return { valid: true, data };
}

module.exports = { storeOtp, verifyOtp };
