import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { UserRound } from 'lucide-react';
import { api, mediaUrl } from '../api';
import FollowButton from './FollowButton.jsx';

export default function SuggestedUsers() {
  const [users, setUsers] = useState(null);

  useEffect(() => {
    api('/users/suggested').then((d) => setUsers(d.users)).catch(() => setUsers([]));
  }, []);

  if (users === null) return null;
  if (users.length === 0) return null;

  return (
    <aside className="side-panel">
      <h2 className="side-panel-title">Suggested for you</h2>
      <ul className="suggested-list">
        {users.map((u) => (
          <li key={u.id} className="suggested-item">
            <Link to={`/profile/${u.username}`} className="post-avatar">
              {u.avatarUrl ? <img src={mediaUrl(u.avatarUrl)} alt="" /> : <UserRound size={16} />}
            </Link>
            <div className="suggested-info">
              <Link to={`/profile/${u.username}`} className="post-author-name">{u.name}</Link>
              <div className="post-meta">@{u.username}</div>
            </div>
            <FollowButton userId={u.id} initiallyFollowing={false} onChange={(f) => f && setUsers((prev) => prev.filter((x) => x.id !== u.id))} />
          </li>
        ))}
      </ul>
    </aside>
  );
}
