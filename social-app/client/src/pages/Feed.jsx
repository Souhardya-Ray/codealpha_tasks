import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { UserRound, ImagePlus } from 'lucide-react';
import { api, mediaUrl } from '../api';
import { useAuth } from '../context/AuthContext.jsx';
import PostCard from '../components/PostCard.jsx';
import SuggestedUsers from '../components/SuggestedUsers.jsx';
import { PostSkeleton } from '../components/Skeletons.jsx';

export default function Feed() {
  const { user } = useAuth();
  const [posts, setPosts] = useState(null);
  const [content, setContent] = useState('');
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState('');
  const [posting, setPosting] = useState(false);
  const [error, setError] = useState('');
  const fileInputRef = useRef(null);

  async function load() {
    try {
      const { posts } = await api('/posts?page=1&limit=20');
      setPosts(posts);
    } catch (err) {
      setPosts([]);
    }
  }

  useEffect(() => { load(); }, []);

  function onFileChange(e) {
    const file = e.target.files[0];
    setImageFile(file || null);
    setImagePreview(file ? URL.createObjectURL(file) : '');
  }

  async function submitPost(e) {
    e.preventDefault();
    if (!content.trim()) return;
    setPosting(true);
    setError('');
    try {
      const fd = new FormData();
      fd.append('content', content.trim());
      if (imageFile) fd.append('image', imageFile);
      const { post } = await api('/posts', { method: 'POST', body: fd, isFormData: true });
      setPosts((prev) => [post, ...(prev || [])]);
      setContent('');
      setImageFile(null);
      setImagePreview('');
      if (fileInputRef.current) fileInputRef.current.value = '';
    } catch (err) {
      setError(err.message);
    } finally {
      setPosting(false);
    }
  }

  function handleDelete(id) {
    setPosts((prev) => prev.filter((p) => p._id !== id));
  }

  return (
    <div className="layout-3col container">
      <aside className="side-panel mini-profile">
        {user && (
          <Link to={`/profile/${user.username}`} className="mini-profile-link">
            <div className="post-avatar" style={{ width: 44, height: 44 }}>
              {user.avatarUrl ? <img src={mediaUrl(user.avatarUrl)} alt="" /> : <UserRound size={20} />}
            </div>
            <div>
              <div className="post-author-name">{user.name}</div>
              <div className="post-meta">@{user.username}</div>
            </div>
          </Link>
        )}
      </aside>

      <main className="feed-main">
        <form className="composer" onSubmit={submitPost}>
          <textarea
            placeholder="Share an update..."
            value={content}
            onChange={(e) => setContent(e.target.value)}
            maxLength={2000}
            rows={3}
          />
          {imagePreview && <img src={imagePreview} alt="" className="composer-preview" />}
          <div className="composer-actions">
            <label className="composer-attach">
              <ImagePlus size={18} />
              <input ref={fileInputRef} type="file" accept="image/*" hidden onChange={onFileChange} />
            </label>
            <button className="btn btn-sm" disabled={posting || !content.trim()}>{posting ? 'Posting...' : 'Post'}</button>
          </div>
          {error && <p className="error-text">{error}</p>}
        </form>

        {posts === null && <><PostSkeleton /><PostSkeleton /><PostSkeleton /></>}
        {posts && posts.length === 0 && (
          <div className="empty-state">
            <p>Your feed is empty. Follow some people or post something yourself.</p>
            <Link className="btn" to="/search">Find people to follow</Link>
          </div>
        )}
        {posts && posts.map((p) => (
          <PostCard key={p._id} post={p} onDelete={handleDelete} />
        ))}
      </main>

      <SuggestedUsers />
    </div>
  );
}
