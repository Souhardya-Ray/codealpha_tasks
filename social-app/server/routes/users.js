const express = require('express');
const router = express.Router();
const { requireAuth, attachUserIfPresent } = require('../middleware/auth');
const { upload } = require('../middleware/upload');
const User = require('../models/User');
const Post = require('../models/Post');
const Follow = require('../models/Follow');
const { shapePost } = require('../utils/shapePost');

function publicUser(u) {
  return {
    id: u._id, name: u.name, username: u.username,
    bio: u.bio, avatarUrl: u.avatarUrl, bannerUrl: u.bannerUrl, createdAt: u.createdAt
  };
}

// GET /api/users/suggested - a handful of users the viewer doesn't already follow
router.get('/suggested', requireAuth, async (req, res, next) => {
  try {
    const following = await Follow.find({ followerId: req.userId }).select('followingId');
    const excludeIds = [req.userId, ...following.map((f) => f.followingId.toString())];
    const users = await User.aggregate([
      { $match: { _id: { $nin: excludeIds.map((id) => new (require('mongoose').Types.ObjectId)(id)) } } },
      { $sample: { size: 5 } }
    ]);
    res.json({ users: users.map(publicUser) });
  } catch (err) { next(err); }
});

// GET /api/users/search?q=
router.get('/search', async (req, res, next) => {
  try {
    const q = (req.query.q || '').trim();
    if (!q) return res.json({ users: [] });
    const users = await User.find({
      $or: [
        { username: { $regex: q, $options: 'i' } },
        { name: { $regex: q, $options: 'i' } }
      ]
    }).limit(20);
    res.json({ users: users.map(publicUser) });
  } catch (err) { next(err); }
});

// GET /api/users/:username - profile + counts + viewer's follow state
router.get('/:username', attachUserIfPresent, async (req, res, next) => {
  try {
    const user = await User.findOne({ username: req.params.username.toLowerCase() });
    if (!user) return res.status(404).json({ error: 'User not found' });

    const [followerCount, followingCount, postCount, posts] = await Promise.all([
      Follow.countDocuments({ followingId: user._id }),
      Follow.countDocuments({ followerId: user._id }),
      Post.countDocuments({ authorId: user._id }),
      Post.find({ authorId: user._id }).sort({ createdAt: -1 }).limit(30).populate('authorId', 'name username avatarUrl')
    ]);

    let isFollowedByViewer = false;
    if (req.userId && req.userId !== user._id.toString()) {
      isFollowedByViewer = !!(await Follow.findOne({ followerId: req.userId, followingId: user._id }));
    }

    res.json({
      user: { ...publicUser(user), followerCount, followingCount, postCount },
      isOwnProfile: req.userId === user._id.toString(),
      isFollowedByViewer,
      posts: posts.map((p) => shapePost(p, req.userId))
    });
  } catch (err) { next(err); }
});

// PUT /api/users/:username/edit - update own profile (name, bio, avatar, banner)
router.put('/:username/edit', requireAuth, upload.fields([{ name: 'avatar', maxCount: 1 }, { name: 'banner', maxCount: 1 }]), async (req, res, next) => {
  try {
    const user = await User.findById(req.userId);
    if (!user || user.username !== req.params.username.toLowerCase()) {
      return res.status(403).json({ error: "You can only edit your own profile" });
    }
    const { name, bio } = req.body;
    if (name) user.name = name;
    if (bio !== undefined) {
      if (bio.length > 280) return res.status(400).json({ error: 'Bio must be 280 characters or fewer' });
      user.bio = bio;
    }
    if (req.files?.avatar?.[0]) user.avatarUrl = `/uploads/${req.files.avatar[0].filename}`;
    if (req.files?.banner?.[0]) user.bannerUrl = `/uploads/${req.files.banner[0].filename}`;
    await user.save();
    res.json({ user: publicUser(user) });
  } catch (err) { next(err); }
});

// POST /api/users/:id/follow
router.post('/:id/follow', requireAuth, async (req, res, next) => {
  try {
    if (req.params.id === req.userId) return res.status(400).json({ error: "You can't follow yourself" });
    const target = await User.findById(req.params.id);
    if (!target) return res.status(404).json({ error: 'User not found' });
    await Follow.updateOne(
      { followerId: req.userId, followingId: req.params.id },
      { $setOnInsert: { followerId: req.userId, followingId: req.params.id, createdAt: new Date() } },
      { upsert: true }
    );
    res.json({ ok: true });
  } catch (err) { next(err); }
});

// POST /api/users/:id/unfollow
router.post('/:id/unfollow', requireAuth, async (req, res, next) => {
  try {
    await Follow.deleteOne({ followerId: req.userId, followingId: req.params.id });
    res.json({ ok: true });
  } catch (err) { next(err); }
});

module.exports = router;
