# Mini Social Media Platform

Full-stack demo: profiles, posts (with optional image), comments, likes, and
a follow system with a personalized feed.

Stack: Express + MongoDB (Mongoose) backend, React (Vite) frontend with
react-router-dom for routing and lucide-react for icons.

## Project layout

```
social-app/
  server/   Express API (port 5000)
  client/   React app via Vite (port 5173)
```

## 1. Backend setup

```bash
cd server
npm install
cp .env.example .env
# edit .env: set MONGO_URI and a long random JWT_SECRET
npm run seed   # 5 sample users, posts, comments, follow relationships
npm run dev    # http://localhost:5000
```

Every seeded user's password is `password123` (e.g. ava@example.com).
You need a MongoDB instance — local or a free MongoDB Atlas cluster.

Uploaded avatars/banners/post images are stored on disk under
`server/uploads/` and served at `/uploads/<filename>`. For production you'd
swap `multer.diskStorage` for an S3 (or similar) storage engine — the route
code in `routes/users.js` and `routes/posts.js` doesn't need to change much,
just the multer storage config in `middleware/upload.js`.

## 2. Frontend setup

```bash
cd client
npm install
cp .env.example .env
# edit .env if your API isn't on http://localhost:5000
npm run dev    # http://localhost:5173
```

## What's implemented

- Register/login with bcrypt-hashed passwords and a JWT in an httpOnly cookie
- Feed scoped to the logged-in user's own posts + posts from people they
  follow, paginated, with skeleton loaders while it fetches
- Create a post with optional image upload (Multer, 5MB limit, image types only)
- Like/unlike (optimistic UI update), comment (add/delete own), delete own posts
- Follow/unfollow, follower/following counts, a "Suggested for you" panel of
  users you don't already follow, and a search page for finding people
- Profile page: banner, avatar, bio, join date, stats, edit-in-place for your
  own profile (name/bio/avatar/banner)
- Three-column desktop layout (mini profile · feed · suggestions) collapsing
  to a single column on mobile; sticky top nav with search and icon actions

## Design choices

- Follow relationships live in their own collection (`Follow`), not as
  embedded arrays on `User` — this keeps "who follows X" and "does A follow
  B" as simple indexed queries and avoids unbounded array growth on popular
  accounts, at the cost of an extra query when computing counts.
- Palette: off-white background, charcoal text, one forest-green accent — no
  gradients, no purple/violet, no decorative emoji. Icons are lucide-react
  throughout instead of emoji for like/comment/share/follow.
- Comment count and like count are denormalized onto `Post`
  (`likes: [userId]`, `commentCount`) so the feed doesn't need a separate
  aggregation per post to render counts.

## Known limitations (kept intentionally simple)

- No nested/threaded comment replies (flat list, as the spec allows)
- No real-time updates (no websockets) — likes/comments update for the user
  who triggered them, not live for other open tabs
- Rate limiting is not implemented (noted here per the spec) — for
  production, add something like `express-rate-limit` on the post/comment/
  like routes to prevent spam
- Search is a simple case-insensitive regex match on name/username, fine for
  a demo but not for a large user base (would want a text index or a real
  search service at scale)
