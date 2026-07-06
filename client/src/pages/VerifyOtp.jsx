import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api';
import '../styles/auth.css';

export default function VerifyOtp() {
  const location = useLocation();
  const navigate = useNavigate();
  const { login } = useAuth();
  const email = location.state?.email || '';
  const [otp, setOtp] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  if (!email) {
    return (
      <div className="auth-page auth-page--centered">
        <div className="auth-form-container">
          <h1>Adresse e-mail manquante</h1>
          <p className="auth-subtitle">Veuillez recommencer l&apos;inscription.</p>
          <Link to="/register" className="btn-primary" style={{ display: 'block', textAlign: 'center', textDecoration: 'none' }}>
            Retour à l&apos;inscription
          </Link>
        </div>
      </div>
    );
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const { data } = await api.post('/auth/verify-otp', { email, otp });
      login(data.token, data.user);
      navigate('/shop');
    } catch (err) {
      setError(err.response?.data?.message || 'Code invalide.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page auth-page--centered">
      <div className="auth-form-container otp-container">
        <div className="auth-logo">E</div>
        <h1>Vérifiez votre e-mail</h1>
        <p className="auth-subtitle">
          Un code à 6 chiffres a été envoyé à <strong>{email}</strong>
        </p>

        {error && <div className="auth-error">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="otp">Code de vérification</label>
            <div className="input-wrapper">
              <input
                id="otp"
                type="text"
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                placeholder="000000"
                maxLength={6}
                className="otp-input"
                required
              />
            </div>
          </div>

          <button type="submit" className="btn-primary" disabled={loading || otp.length !== 6}>
            {loading ? 'Vérification...' : 'Vérifier'}
          </button>
        </form>

        <p className="auth-footer">
          <Link to="/register">Retour à l&apos;inscription</Link>
        </p>
      </div>
    </div>
  );
}
