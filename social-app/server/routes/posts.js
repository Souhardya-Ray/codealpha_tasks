const express = require('express');
const router = express.Router();
const { requireAuth, attachUserIfPresent } = require('../middleware/auth');
const { upload } = require('../middleware/upload');
const Post = require('../models/Post');
const Follow = require('../models/Follow');
const Comment = require('../models/Comment');
const { shapePost } = require('../utils/shapePost');

// GET /api/posts - feed: own posts + posts from followed users, paginated
router.get('/', requireAuth, async (req, res, next) => {
  try {
    const page = Math.max(parseInt(req.query.page, 10) || 1, 1);
    const limit = Math.min(Math.max(parseInt(req.query.limit, 10) || 10, 1), 30);

    const following = await Follow.find({ followerId: req.userId }).select('followingId');
    const authorIds = [req.userId, ...following.map((f) => f.followingId)];

    const [posts, total] = await Promise.all([
      Post.find({ authorId: { $in: authorIds } })
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .populate('authorId', 'name username avatarUrl'),
      Post.countDocuments({ authorId: { $in: authorIds } })
    ]);

    res.json({
      posts: posts.map((p) => shapePost(p, req.userId)),
      pagination: { page, limit, total, pages: Math.ceil(total / limit) }
    });
  } catch (err) { next(err); }
});

// POST /api/posts - create a post, optional single image under field "image"
router.post('/', requireAuth, upload.single('image'), async (req, res, next) => {
  try {
    const { content } = req.body;
    if (!content || !content.trim()) return res.status(400).json({ error: 'Post content is required' });
    if (content.length > 2000) return res.status(400).json({ error: 'Post is too long (max 2000 characters)' });

    const post = await Post.create({
      authorId: req.userId,
      content: content.trim(),
      imageUrl: req.file ? `/uploads/${req.file.filename}` : ''
    });
    await post.populate('authorId', 'name username avatarUrl');
    res.status(201).json({ post: shapePost(post, req.userId) });
  } catch (err) { next(err); }
});

// GET /api/posts/:id
router.get('/:id', attachUserIfPresent, async (req, res, next) => {
  try {
    const post = await Post.findById(req.params.id).populate('authorId', 'name username avatarUrl');
    if (!post) return res.status(404).json({ error: 'Post not found' });
    res.json({ post: shapePost(post, req.userId) });
  } catch (err) { next(err); }
});

// DELETE /api/posts/:id - only the author can delete
router.delete('/:id', requireAuth, async (req, res, next) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ error: 'Post not found' });
    if (post.authorId.toString() !== req.userId) return res.status(403).json({ error: 'You can only delete your own posts' });
    await Promise.all([post.deleteOne(), Comment.deleteMany({ postId: post._id })]);
    res.json({ ok: true });
  } catch (err) { next(err); }
});

// POST /api/posts/:id/like
router.post('/:id/like', requireAuth, async (req, res, next) => {
  try {
    const post = await Post.findByIdAndUpdate(
      req.params.id,
      { $addToSet: { likes: req.userId } },
      { new: true }
    ).populate('authorId', 'name username avatarUrl');
    if (!post) return res.status(404).json({ error: 'Post not found' });
    res.json({ post: shapePost(post, req.userId) });
  } catch (err) { next(err); }
});

// POST /api/posts/:id/unlike
router.post('/:id/unlike', requireAuth, async (req, res, next) => {
  try {
    const post = await Post.findByIdAndUpdate(
      req.params.id,
      { $pull: { likes: req.userId } },
      { new: true }
    ).populate('authorId', 'name username avatarUrl');
    if (!post) return res.status(404).json({ error: 'Post not found' });
    res.json({ post: shapePost(post, req.userId) });
  } catch (err) { next(err); }
});

// GET /api/posts/:id/comments?page=&limit=
router.get('/:id/comments', async (req, res, next) => {
  try {
    const page = Math.max(parseInt(req.query.page, 10) || 1, 1);
    const limit = Math.min(Math.max(parseInt(req.query.limit, 10) || 20, 1), 50);
    const [comments, total] = await Promise.all([
      Comment.find({ postId: req.params.id })
        .sort({ createdAt: 1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .populate('authorId', 'name username avatarUrl'),
      Comment.countDocuments({ postId: req.params.id })
    ]);
    res.json({ comments, pagination: { page, limit, total, pages: Math.ceil(total / limit) } });
  } catch (err) { next(err); }
});

// POST /api/posts/:id/comments - add a comment to a post
router.post('/:id/comments', requireAuth, async (req, res, next) => {
  try {
    const { content } = req.body;
    if (!content || !content.trim()) return res.status(400).json({ error: 'Comment cannot be empty' });
    if (content.length > 500) return res.status(400).json({ error: 'Comment is too long (max 500 characters)' });

    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ error: 'Post not found' });

    const comment = await Comment.create({ postId: post._id, authorId: req.userId, content: content.trim() });
    await Promise.all([
      comment.populate('authorId', 'name username avatarUrl'),
      Post.findByIdAndUpdate(post._id, { $inc: { commentCount: 1 } })
    ]);
    res.status(201).json({ comment });
  } catch (err) { next(err); }
});

module.exports = router;
