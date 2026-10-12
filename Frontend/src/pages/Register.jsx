import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { ArrowRight, LockKeyhole, Mail, UserRound } from 'lucide-react';
import { api } from '../api/client';

export default function Register() {
  const location = useLocation();
  const [form, setForm] = useState({
    username: '',
    email: '',
    password: '',
    role: location.state?.role || 'student',
  });
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);
  const navigate = useNavigate();

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setSaving(true);
    try {
      await api.register({
        username: form.username.trim(),
        email: form.email.trim(),
        password: form.password,
        role: form.role,
      });
      navigate('/login', {
        state: {
          registeredEmail: form.email.trim(),
          registrationMessage:
            form.role === 'instructor'
              ? 'Account created. An administrator must approve your instructor account before you can log in.'
              : 'Account created. You can now log in.',
        },
      });
    } catch (error) {
      setError(error.message || 'Registration failed. Please check your details and try again.');
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="auth-shell">
      <div className="auth-visual">
        <div className="auth-visual-content">
          <div className="badge-row">
            <UserRound size={16} />
            Build confidence before the interview
          </div>
          <h2>Start practicing with structured interview tracks.</h2>
          <p>
            Join your coaching platform and begin personalized preparation with real feedback and
            progress insights.
          </p>
          <img
            src="https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=900&q=80"
            alt="Professional using a laptop to prepare for a technical interview"
          />
        </div>
      </div>

      <div className="auth-card">
        <div className="auth-header">
          <p>Create account</p>
          <h1>Register your profile</h1>
        </div>

        <form onSubmit={handleSubmit} className="auth-form">
          {error && (
            <div className="workspace-alert error" role="alert">
              {error}
            </div>
          )}
          <label>
            <span>Username</span>
            <div className="input-wrap">
              <UserRound size={16} />
              <input
                type="text"
                required
                value={form.username}
                onChange={(e) => setForm({ ...form, username: e.target.value })}
                placeholder="Your full name or handle"
              />
            </div>
          </label>

          <label>
            <span>Email address</span>
            <div className="input-wrap">
              <Mail size={16} />
              <input
                type="email"
                autoComplete="email"
                required
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                placeholder="name@example.com"
              />
            </div>
          </label>

          <label>
            <span>Role</span>
            <div className="input-wrap">
              <select
                value={form.role}
                onChange={(e) => setForm({ ...form, role: e.target.value })}
                style={{ background: 'transparent', border: 'none', color: 'white', width: '100%' }}
              >
                <option value="student">Student</option>
                <option value="instructor">Instructor</option>
              </select>
            </div>
          </label>

          <label>
            <span>Password</span>
            <div className="input-wrap">
              <LockKeyhole size={16} />
              <input
                type="password"
                autoComplete="new-password"
                minLength={8}
                required
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                placeholder="Minimum 8 characters"
              />
            </div>
          </label>

          <button type="submit" className="primary-btn full-width" disabled={saving}>
            {saving ? 'Creating account…' : 'Create account'} {!saving && <ArrowRight size={18} />}
          </button>
        </form>

        <div className="auth-footer">
          <span>Already have an account?</span>
          <button type="button" className="text-link" onClick={() => navigate('/login')}>
            Log in
          </button>
        </div>
      </div>
    </div>
  );
}
