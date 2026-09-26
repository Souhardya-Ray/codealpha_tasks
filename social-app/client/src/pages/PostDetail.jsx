import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { api } from '../api';
import PostCard from '../components/PostCard.jsx';
import CommentList from '../components/CommentList.jsx';
import { PostSkeleton } from '../components/Skeletons.jsx';

export default function PostDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [post, setPost] = useState(null);
  const [error, setError] = useState('');
  const [commentCount, setCommentCount] = useState(0);

  useEffect(() => {
    api(`/posts/${id}`)
      .then((d) => { setPost(d.post); setCommentCount(d.post.commentCount); })
      .catch((err) => setError(err.message));
  }, [id]);

  function handleDelete() {
    navigate('/');
  }

  if (error) return <div className="container feed-main"><div className="empty-state"><p>{error}</p></div></div>;
  if (!post) return <div className="container feed-main"><PostSkeleton /></div>;

  return (
    <div className="container feed-main">
      <PostCard post={{ ...post, commentCount }} onDelete={handleDelete} linkToDetail={false} />
      <CommentList postId={id} onCountChange={(updater) => setCommentCount(updater)} />
    </div>
  );
}
