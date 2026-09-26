import { useState } from 'react';
import { api } from '../api';

export default function FollowButton({ userId, initiallyFollowing, onChange }) {
  const [following, setFollowing] = useState(initiallyFollowing);
  const [busy, setBusy] = useState(false);

  async function toggle() {
    if (busy) return;
    setBusy(true);
    const next = !following;
    setFollowing(next);
    try {
      await api(`/users/${userId}/${next ? 'follow' : 'unfollow'}`, { method: 'POST' });
      onChange && onChange(next);
    } catch (err) {
      setFollowing(!next);
      alert(err.message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <button className={`btn btn-sm ${following ? 'btn-outline' : ''}`} onClick={toggle} disabled={busy}>
      {following ? 'Following' : 'Follow'}
    </button>
  );
}
