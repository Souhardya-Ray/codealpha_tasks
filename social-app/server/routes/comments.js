const express = require('express');
const router = express.Router();
const { requireAuth } = require('../middleware/auth');
const Comment = require('../models/Comment');
const Post = require('../models/Post');

// DELETE /api/comments/:id - only the author can delete
router.delete('/:id', requireAuth, async (req, res, next) => {
  try {
    const comment = await Comment.findById(req.params.id);
    if (!comment) return res.status(404).json({ error: 'Comment not found' });
    if (comment.authorId.toString() !== req.userId) {
      return res.status(403).json({ error: 'You can only delete your own comments' });
    }
    await Promise.all([
      comment.deleteOne(),
      Post.findByIdAndUpdate(comment.postId, { $inc: { commentCount: -1 } })
    ]);
    res.json({ ok: true });
  } catch (err) { next(err); }
});

module.exports = router;
