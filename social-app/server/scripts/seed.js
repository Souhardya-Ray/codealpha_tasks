// Populates sample users, posts, comments and follow relationships.
// Run with: npm run seed
// Every seeded user's password is: password123
require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const Post = require('../models/Post');
const Comment = require('../models/Comment');
const Follow = require('../models/Follow');

const sampleUsers = [
  { name: 'Ava Chen', username: 'avachen', email: 'ava@example.com', bio: 'Product designer. Coffee enthusiast.' },
  { name: 'Marcus Reid', username: 'marcusreid', email: 'marcus@example.com', bio: 'Backend engineer, runner, dog dad.' },
  { name: 'Priya Nair', username: 'priyanair', email: 'priya@example.com', bio: 'Writing about frontend architecture.' },
  { name: 'Jonas Weber', username: 'jonasweber', email: 'jonas@example.com', bio: 'Photography and hiking.' },
  { name: 'Lena Okafor', username: 'lenaokafor', email: 'lena@example.com', bio: 'Building things with Node and React.' }
];

const samplePostContents = [
  'Shipped a small feature today and it feels great to close the loop.',
  'Reading through some notes on database indexing this weekend.',
  'Coffee shop working session - surprisingly productive.',
  'Finally fixed that flaky test that has been bothering the team for weeks.',
  'Sketching out a new onboarding flow, feedback welcome.',
  'Long walk, cleared my head, back to it tomorrow.',
  'Pushed a refactor that trims a good chunk of duplicate code.',
  'Trying out a new note-taking system this month.'
];

async function seed() {
  const uri = process.env.MONGO_URI || 'mongodb://localhost:27017/social-app';
  await mongoose.connect(uri);
  console.log('Connected. Clearing existing data...');
  await Promise.all([User.deleteMany({}), Post.deleteMany({}), Comment.deleteMany({}), Follow.deleteMany({})]);

  const passwordHash = await bcrypt.hash('password123', 10);
  const users = await User.insertMany(sampleUsers.map((u) => ({ ...u, passwordHash })));

  const posts = [];
  for (const user of users) {
    const count = 2 + Math.floor(Math.random() * 2);
    for (let i = 0; i < count; i++) {
      const content = samplePostContents[Math.floor(Math.random() * samplePostContents.length)];
      posts.push({ authorId: user._id, content, likes: [] });
    }
  }
  const createdPosts = await Post.insertMany(posts);

  // Random likes
  for (const post of createdPosts) {
    const likers = users.filter(() => Math.random() > 0.5).map((u) => u._id);
    post.likes = likers;
    await post.save();
  }

  // A few comments
  const commentTexts = ['Nice work!', 'Totally agree.', 'Great point.', 'Looking forward to seeing more.'];
  for (const post of createdPosts.slice(0, 10)) {
    const commenter = users[Math.floor(Math.random() * users.length)];
    const comment = await Comment.create({
      postId: post._id,
      authorId: commenter._id,
      content: commentTexts[Math.floor(Math.random() * commentTexts.length)]
    });
    await Post.findByIdAndUpdate(post._id, { $inc: { commentCount: 1 } });
  }

  // Follow relationships: each user follows 2-3 others
  const follows = [];
  for (const user of users) {
    const others = users.filter((u) => u._id.toString() !== user._id.toString());
    const shuffled = others.sort(() => 0.5 - Math.random()).slice(0, 2 + Math.floor(Math.random() * 2));
    for (const target of shuffled) {
      follows.push({ followerId: user._id, followingId: target._id });
    }
  }
  await Follow.insertMany(follows, { ordered: false }).catch(() => {}); // ignore dup key races

  console.log(`Seeded ${users.length} users, ${createdPosts.length} posts, follow relationships and comments.`);
  console.log('All seeded users have password: password123');
  await mongoose.disconnect();
}

seed().catch((err) => {
  console.error('Seed failed:', err);
  process.exit(1);
});
