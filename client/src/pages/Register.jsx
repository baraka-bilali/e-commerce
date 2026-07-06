import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { GoogleLogin } from '@react-oauth/google';
import { useAuth } from '../context/AuthContext';
import api from '../api';
import '../styles/auth.css';

export default function Register() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await api.post('/auth/register', { name, email, password });
      navigate('/verify-otp', { state: { email } });
    } catch (err) {
      setError(err.response?.data?.message || "Erreur lors de l'inscription.");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSuccess = async (response) => {
    setError('');
    setLoading(true);
    try {
      const { data } = await api.post('/auth/google', { credential: response.credential });
      login(data.token, data.user);
    } catch (err) {
      setError(err.response?.data?.message || 'Erreur Google OAuth.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-visual">
        <img
          src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=800&q=80"
          alt="Portrait"
          className="auth-visual-img"
        />
        <div className="auth-visual-overlay">
          <div className="auth-avatars">
            {[1, 2, 3, 4, 5].map((i) => (
              <img
                key={i}
                src={`https://i.pravatar.cc/40?img=${i + 20}`}
                alt=""
                className="auth-avatar"
              />
            ))}
          </div>
          <div className="auth-rating">
            <span className="stars">★★★★★</span>
            <span>5,0 sur 350+ avis</span>
          </div>
        </div>
      </div>

      <div className="auth-form-side">
        <div className="auth-form-container">
          <div className="auth-logo">E</div>
          <h1>Créer un compte</h1>
          <p className="auth-subtitle">Veuillez remplir vos informations pour vous inscrire</p>

          {error && <div className="auth-error">{error}</div>}

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="name">Nom complet</label>
              <div className="input-wrapper">
                <input
                  id="name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Jean Dupont"
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="email">Adresse e-mail</label>
              <div className="input-wrapper">
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="eulogia@example.com"
                  required
                />
                {email && (
                  <button type="button" className="input-icon" onClick={() => setEmail('')}>
                    ✕
                  </button>
                )}
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="password">Mot de passe</label>
              <div className="input-wrapper">
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  minLength={6}
                  required
                />
                <button
                  type="button"
                  className="input-icon"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? '🙈' : '👁'}
                </button>
              </div>
            </div>

            <button type="submit" className="btn-primary" disabled={loading}>
              {loading ? 'Envoi du code...' : "S'inscrire"}
            </button>
          </form>

          <div className="google-btn-wrapper">
            <GoogleLogin
              onSuccess={handleGoogleSuccess}
              onError={() => setError('Erreur Google OAuth.')}
              text="signup_with"
              shape="rectangular"
              width="100%"
              locale="fr"
            />
          </div>

          <p className="auth-footer">
            Déjà un compte ? <Link to="/login">Se connecter</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
