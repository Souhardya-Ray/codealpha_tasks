import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Trash2, UserRound } from 'lucide-react';
import { api, mediaUrl } from '../api';
import { useAuth } from '../context/AuthContext.jsx';

export default function CommentList({ postId, onCountChange }) {
  const { user } = useAuth();
  const [comments, setComments] = useState(null);
  const [text, setText] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  async function load() {
    try {
      const { comments } = await api(`/posts/${postId}/comments`);
      setComments(comments);
    } catch (err) {
      setComments([]);
    }
  }

  useEffect(() => { load(); }, [postId]);

  async function submit(e) {
    e.preventDefault();
    if (!text.trim()) return;
    setSubmitting(true);
    setError('');
    try {
      const { comment } = await api(`/posts/${postId}/comments`, { method: 'POST', body: { content: text.trim() } });
      setComments((prev) => [...prev, comment]);
      setText('');
      onCountChange && onCountChange((c) => c + 1);
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  async function remove(id) {
    try {
      await api(`/comments/${id}`, { method: 'DELETE' });
      setComments((prev) => prev.filter((c) => c._id !== id));
      onCountChange && onCountChange((c) => c - 1);
    } catch (err) {
      alert(err.message);
    }
  }

  return (
    <div className="comment-section">
      <form className="comment-form" onSubmit={submit}>
        <input
          type="text"
          placeholder="Write a comment..."
          value={text}
          onChange={(e) => setText(e.target.value)}
          maxLength={500}
        />
        <button className="btn btn-sm" disabled={submitting || !text.trim()}>Post</button>
      </form>
      {error && <p className="error-text">{error}</p>}

      {comments === null && <p className="help-text">Loading comments...</p>}
      {comments && comments.length === 0 && <p className="help-text">No comments yet.</p>}

      <ul className="comment-list">
        {comments && comments.map((c) => (
          <li key={c._id} className="comment-item">
            <Link to={`/profile/${c.authorId.username}`} className="post-avatar post-avatar-sm">
              {c.authorId.avatarUrl ? <img src={mediaUrl(c.authorId.avatarUrl)} alt="" /> : <UserRound size={14} />}
            </Link>
            <div className="comment-body">
              <span className="post-author-name">{c.authorId.name}</span>{' '}
              <span className="post-meta">@{c.authorId.username}</span>
              <p>{c.content}</p>
            </div>
            {user && user.id === c.authorId._id && (
              <button className="post-delete-btn" title="Delete comment" onClick={() => remove(c._id)}>
                <Trash2 size={14} />
              </button>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}
