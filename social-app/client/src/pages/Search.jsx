import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { UserRound } from 'lucide-react';
import { api, mediaUrl } from '../api';
import FollowButton from '../components/FollowButton.jsx';

export default function Search() {
  const [params, setParams] = useSearchParams();
  const [q, setQ] = useState(params.get('q') || '');
  const [users, setUsers] = useState(null);

  async function runSearch(query) {
    if (!query.trim()) { setUsers([]); return; }
    setUsers(null);
    try {
      const { users } = await api(`/users/search?q=${encodeURIComponent(query.trim())}`);
      setUsers(users);
    } catch (_) {
      setUsers([]);
    }
  }

  useEffect(() => { runSearch(params.get('q') || ''); }, [params]);

  function submit(e) {
    e.preventDefault();
    setParams(q.trim() ? { q: q.trim() } : {});
  }

  return (
    <div className="container feed-main">
      <h1>Search people</h1>
      <form className="filters" onSubmit={submit}>
        <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search by name or username" />
        <button className="btn btn-sm">Search</button>
      </form>

      {users === null && <p className="help-text">Searching...</p>}
      {users && users.length === 0 && <div className="empty-state"><p>No people found.</p></div>}

      <ul className="suggested-list">
        {users && users.map((u) => (
          <li key={u.id} className="suggested-item">
            <Link to={`/profile/${u.username}`} className="post-avatar">
              {u.avatarUrl ? <img src={mediaUrl(u.avatarUrl)} alt="" /> : <UserRound size={16} />}
            </Link>
            <div className="suggested-info">
              <Link to={`/profile/${u.username}`} className="post-author-name">{u.name}</Link>
              <div className="post-meta">@{u.username}</div>
            </div>
            <FollowButton userId={u.id} initiallyFollowing={false} />
          </li>
        ))}
      </ul>
    </div>
  );
}
