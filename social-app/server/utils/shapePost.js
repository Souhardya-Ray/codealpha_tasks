function shapePost(post, viewerId) {
  const p = post.toObject ? post.toObject() : post;
  return {
    _id: p._id,
    content: p.content,
    imageUrl: p.imageUrl,
    author: p.authorId,
    likeCount: (p.likes || []).length,
    likedByViewer: viewerId ? (p.likes || []).some((id) => id.toString() === viewerId) : false,
    commentCount: p.commentCount,
    createdAt: p.createdAt
  };
}

module.exports = { shapePost };
