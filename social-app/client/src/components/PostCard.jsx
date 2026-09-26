import { Link } from 'react-router-dom';
import { Heart, MessageCircle, Share2, Trash2, UserRound } from 'lucide-react';
import { useState } from 'react';
import { api, mediaUrl } from '../api';
import { useAuth } from '../context/AuthContext.jsx';

function timeAgo(dateStr) {
  const diff = (Date.now() - new Date(dateStr).getTime()) / 1000;
  if (diff < 60) return 'just now';
  if (diff < 3600) return `${Math.floor(diff / 60)}m`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h`;
  return `${Math.floor(diff / 86400)}d`;
}

export default function PostCard({ post, onChange, onDelete, linkToDetail = true }) {
  const { user } = useAuth();
  const [liked, setLiked] = useState(post.likedByViewer);
  const [likeCount, setLikeCount] = useState(post.likeCount);
  const [busy, setBusy] = useState(false);

  async function toggleLike() {
    if (busy) return;
    setBusy(true);
    const nextLiked = !liked;
    setLiked(nextLiked);
    setLikeCount((c) => c + (nextLiked ? 1 : -1));
    try {
      const { post: updated } = await api(`/posts/${post._id}/${nextLiked ? 'like' : 'unlike'}`, { method: 'POST' });
      setLiked(updated.likedByViewer);
      setLikeCount(updated.likeCount);
      onChange && onChange(updated);
    } catch (err) {
      setLiked(!nextLiked);
      setLikeCount((c) => c + (nextLiked ? -1 : 1));
    } finally {
      setBusy(false);
    }
  }

  async function handleDelete() {
    if (!confirm('Delete this post?')) return;
    try {
      await api(`/posts/${post._id}`, { method: 'DELETE' });
      onDelete && onDelete(post._id);
    } catch (err) {
      alert(err.message);
    }
  }

  function handleShare() {
    const url = `${location.origin}/post/${post._id}`;
    navigator.clipboard?.writeText(url);
    alert('Link copied to clipboard');
  }

  return (
    <article className="post-card">
      <div className="post-card-head">
        <Link to={`/profile/${post.author.username}`} className="post-avatar">
          {post.author.avatarUrl ? <img src={mediaUrl(post.author.avatarUrl)} alt="" /> : <UserRound size={18} />}
        </Link>
        <div>
          <Link to={`/profile/${post.author.username}`} className="post-author-name">{post.author.name}</Link>
          <div className="post-meta">@{post.author.username} &middot; {timeAgo(post.createdAt)}</div>
        </div>
        {user && user.id === post.author._id && (
          <button className="post-delete-btn" title="Delete post" aria-label="Delete post" onClick={handleDelete}>
            <Trash2 size={16} />
          </button>
        )}
      </div>

      <div className="post-content">
        {linkToDetail ? <Link to={`/post/${post._id}`} className="post-content-link">{post.content}</Link> : post.content}
      </div>

      {post.imageUrl && (
        <div className="post-image">
          <img src={mediaUrl(post.imageUrl)} alt="" />
        </div>
      )}

      <div className="post-actions">
        <button className={`post-action-btn ${liked ? 'liked' : ''}`} onClick={toggleLike} aria-pressed={liked}>
          <Heart size={18} fill={liked ? 'currentColor' : 'none'} />
          <span>{likeCount}</span>
        </button>
        <Link to={`/post/${post._id}`} className="post-action-btn">
          <MessageCircle size={18} />
          <span>{post.commentCount}</span>
        </Link>
        <button className="post-action-btn" onClick={handleShare}>
          <Share2 size={18} />
        </button>
      </div>
    </article>
  );
}
