import { Link, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { Home, Search, LogOut, UserRound } from 'lucide-react';
import { useAuth } from '../context/AuthContext.jsx';
import { mediaUrl } from '../api';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [q, setQ] = useState('');

  function submitSearch(e) {
    e.preventDefault();
    if (q.trim()) navigate(`/search?q=${encodeURIComponent(q.trim())}`);
  }

  return (
    <header className="navbar">
      <div className="navbar-inner">
        <Link to="/" className="navbar-logo">Connect</Link>

        <form className="navbar-search" onSubmit={submitSearch}>
          <Search size={16} className="navbar-search-icon" />
          <input
            type="text"
            placeholder="Search people"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            aria-label="Search people"
          />
        </form>

        <nav className="navbar-actions">
          <Link to="/" className="navbar-icon-btn" title="Feed" aria-label="Feed"><Home size={20} /></Link>
          <Link to="/search" className="navbar-icon-btn" title="Search" aria-label="Search"><Search size={20} /></Link>
          {user && (
            <Link to={`/profile/${user.username}`} className="navbar-avatar" title="Your profile">
              {user.avatarUrl
                ? <img src={mediaUrl(user.avatarUrl)} alt="" />
                : <UserRound size={18} />}
            </Link>
          )}
          <button className="navbar-icon-btn" title="Log out" aria-label="Log out" onClick={() => { logout(); navigate('/login'); }}>
            <LogOut size={20} />
          </button>
        </nav>
      </div>
    </header>
  );
}
