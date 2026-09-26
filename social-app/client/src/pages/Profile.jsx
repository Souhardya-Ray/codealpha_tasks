import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { UserRound, Pencil } from 'lucide-react';
import { api, mediaUrl } from '../api';
import { useAuth } from '../context/AuthContext.jsx';
import PostCard from '../components/PostCard.jsx';
import FollowButton from '../components/FollowButton.jsx';
import { ProfileSkeleton, PostSkeleton } from '../components/Skeletons.jsx';

export default function Profile() {
  const { username } = useParams();
  const { user: viewer, setUser: setViewer } = useAuth();
  const [data, setData] = useState(null);
  const [error, setError] = useState('');
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({ name: '', bio: '' });
  const [avatarFile, setAvatarFile] = useState(null);
  const [bannerFile, setBannerFile] = useState(null);
  const [saving, setSaving] = useState(false);

  async function load() {
    setData(null);
    try {
      const d = await api(`/users/${username}`);
      setData(d);
      setForm({ name: d.user.name, bio: d.user.bio || '' });
    } catch (err) {
      setError(err.message);
    }
  }

  useEffect(() => { load(); }, [username]);

  async function saveEdit(e) {
    e.preventDefault();
    setSaving(true);
    try {
      const fd = new FormData();
      fd.append('name', form.name);
      fd.append('bio', form.bio);
      if (avatarFile) fd.append('avatar', avatarFile);
      if (bannerFile) fd.append('banner', bannerFile);
      const { user: updated } = await api(`/users/${username}/edit`, { method: 'PUT', body: fd, isFormData: true });
      setEditing(false);
      setAvatarFile(null);
      setBannerFile(null);
      if (viewer && viewer.username === username) setViewer((v) => ({ ...v, ...updated }));
      load();
    } catch (err) {
      alert(err.message);
    } finally {
      setSaving(false);
    }
  }

  if (error) return <div className="container feed-main"><div className="empty-state"><p>{error}</p></div></div>;
  if (!data) return <div className="container feed-main"><ProfileSkeleton /></div>;

  const { user, isOwnProfile, isFollowedByViewer, posts } = data;

  return (
    <div className="container feed-main">
      <div className="profile-banner" style={user.bannerUrl ? { backgroundImage: `url(${mediaUrl(user.bannerUrl)})` } : undefined} />
      <div className="profile-head">
        <div className="post-avatar profile-avatar-lg">
          {user.avatarUrl ? <img src={mediaUrl(user.avatarUrl)} alt="" /> : <UserRound size={32} />}
        </div>
        <div className="profile-head-info">
          <h1 style={{ margin: 0 }}>{user.name}</h1>
          <div className="post-meta">@{user.username} &middot; Joined {new Date(user.createdAt).toLocaleDateString()}</div>
        </div>
        {isOwnProfile ? (
          <button className="btn btn-outline btn-sm" onClick={() => setEditing((v) => !v)}>
            <Pencil size={14} style={{ marginRight: 6 }} />Edit profile
          </button>
        ) : (
          <FollowButton
            userId={user.id}
            initiallyFollowing={isFollowedByViewer}
            onChange={() => load()}
          />
        )}
      </div>

      {user.bio && <p className="profile-bio">{user.bio}</p>}

      <div className="profile-stats">
        <span><strong>{user.postCount}</strong> posts</span>
        <span><strong>{user.followerCount}</strong> followers</span>
        <span><strong>{user.followingCount}</strong> following</span>
      </div>

      {editing && (
        <form className="form" onSubmit={saveEdit} style={{ maxWidth: 480, margin: '20px 0' }}>
          <div className="field"><label htmlFor="name">Name</label><input id="name" value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} /></div>
          <div className="field"><label htmlFor="bio">Bio</label><textarea id="bio" rows={3} maxLength={280} value={form.bio} onChange={(e) => setForm((f) => ({ ...f, bio: e.target.value }))} /></div>
          <div className="field"><label htmlFor="avatar">Avatar</label><input id="avatar" type="file" accept="image/*" onChange={(e) => setAvatarFile(e.target.files[0])} /></div>
          <div className="field"><label htmlFor="banner">Banner</label><input id="banner" type="file" accept="image/*" onChange={(e) => setBannerFile(e.target.files[0])} /></div>
          <button className="btn" disabled={saving}>{saving ? 'Saving...' : 'Save changes'}</button>
        </form>
      )}

      <h2 style={{ marginTop: 28 }}>Posts</h2>
      {posts.length === 0 && <div className="empty-state"><p>No posts yet.</p></div>}
      {posts.map((p) => (
        <PostCard key={p._id} post={p} onDelete={() => load()} />
      ))}
    </div>
  );
}
