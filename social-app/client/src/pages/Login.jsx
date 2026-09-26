import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { api } from '../api';
import { useAuth } from '../context/AuthContext.jsx';

export default function Login() {
  const { refreshUser } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  async function submit(e) {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      await api('/auth/login', { method: 'POST', body: { email, password } });
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
        <p className="help-text" style={{ marginBottom: 24 }}>Log in to see posts from people you follow.</p>
        <form className="form" onSubmit={submit}>
          <div className="field">
            <label htmlFor="email">Email</label>
            <input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
          </div>
          <div className="field">
            <label htmlFor="password">Password</label>
            <input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
          </div>
          <button className="btn" style={{ width: '100%' }} disabled={submitting}>{submitting ? 'Logging in...' : 'Log in'}</button>
          {error && <p className="error-text">{error}</p>}
        </form>
        <p className="help-text" style={{ marginTop: 18 }}>
          Don't have an account? <Link to="/register">Register</Link>
        </p>
      </div>
    </div>
  );
}
