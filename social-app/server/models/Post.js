const mongoose = require('mongoose');

const postSchema = new mongoose.Schema({
  authorId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  content: { type: String, required: true, maxlength: 2000 },
  imageUrl: { type: String, default: '' },
  likes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  commentCount: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now, index: true }
});

module.exports = mongoose.model('Post', postSchema);
