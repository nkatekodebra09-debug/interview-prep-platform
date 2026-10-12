import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { ArrowRight, LockKeyhole, Mail, Sparkles } from 'lucide-react';
import { api } from '../api/client';
import { useAuth } from '../context/AuthContext';

export default function Login() {
  const location = useLocation();
  const [email, setEmail] = useState(location.state?.registeredEmail || '');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setSaving(true);
    try {
      const data = await api.login({ email: email.trim(), password });
      login(data.user, data.token);

      const destination =
        data.user?.role === 'admin'
          ? '/admin'
          : data.user?.role === 'instructor'
            ? '/instructor'
            : '/student';

      navigate(destination);
    } catch (error) {
      setError(error.message || 'Sign in failed. Please check your details and try again.');
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="auth-shell">
      <div className="auth-visual">
        <div className="auth-visual-content">
          <div className="badge-row">
            <Sparkles size={16} />
            Interview readiness coaching
          </div>
          <h2>Prepare for the roles you want.</h2>
          <p>
            Track your progress, rehearse highly realistic interviews, and improve with every
            session.
          </p>
          <img
            src="https://images.unsplash.com/photo-1552664730-d307ca884978?auto=format&fit=crop&w=900&q=80"
            alt="Candidate preparing for a technical interview"
          />
        </div>
      </div>

      <div className="auth-card">
        <div className="auth-header">
          <p>Welcome back</p>
          <h1>Login to your account</h1>
        </div>

        <form onSubmit={handleSubmit} className="auth-form">
          {location.state?.registrationMessage && (
            <div className="workspace-alert success" role="status">
              {location.state.registrationMessage}
            </div>
          )}
          {error && (
            <div className="workspace-alert error" role="alert">
              {error}
            </div>
          )}
          <label>
            <span>Email address</span>
            <div className="input-wrap">
              <Mail size={16} />
              <input
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@example.com"
              />
            </div>
          </label>

          <label>
            <span>Password</span>
            <div className="input-wrap">
              <LockKeyhole size={16} />
              <input
                type="password"
                autoComplete="current-password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
              />
            </div>
          </label>

          <button type="submit" className="primary-btn full-width" disabled={saving}>
            {saving ? 'Signing in…' : 'Sign in'} {!saving && <ArrowRight size={18} />}
          </button>
        </form>

        <div className="auth-footer">
          <span>Need an account?</span>
          <button type="button" className="text-link" onClick={() => navigate('/register')}>
            Create one
          </button>
        </div>
      </div>
    </div>
  );
}
