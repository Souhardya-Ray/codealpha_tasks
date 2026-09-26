import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { api } from '../api';
import { useAuth } from '../context/AuthContext.jsx';

export default function Register() {
  const { refreshUser } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', username: '', email: '', password: '' });
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  function update(field) {
    return (e) => setForm((f) => ({ ...f, [field]: e.target.value }));
  }

  async function submit(e) {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      await api('/auth/register', { method: 'POST', body: form });
      await refreshUser();
      navigate('/');
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="auth-page">
      <div className="auth-card">
        <h1 className="brand-title">Connect</h1>
        <p className="help-text" style={{ marginBottom: 24 }}>Create an account to start posting and following people.</p>
        <form className="form" onSubmit={submit}>
          <div className="field">
            <label htmlFor="name">Name</label>
            <input id="name" value={form.name} onChange={update('name')} required />
          </div>
          <div className="field">
            <label htmlFor="username">Username</label>
            <input id="username" value={form.username} onChange={update('username')} required placeholder="lowercase, letters/numbers/underscore" />
          </div>
          <div className="field">
            <label htmlFor="email">Email</label>
            <input id="email" type="email" value={form.email} onChange={update('email')} required />
          </div>
          <div className="field">
            <label htmlFor="password">Password</label>
            <input id="password" type="password" minLength={8} value={form.password} onChange={update('password')} required />
            <p className="help-text">At least 8 characters.</p>
          </div>
          <button className="btn" style={{ width: '100%' }} disabled={submitting}>{submitting ? 'Creating account...' : 'Create account'}</button>
          {error && <p className="error-text">{error}</p>}
        </form>
        <p className="help-text" style={{ marginTop: 18 }}>
          Already have an account? <Link to="/login">Log in</Link>
        </p>
      </div>
    </div>
  );
}
