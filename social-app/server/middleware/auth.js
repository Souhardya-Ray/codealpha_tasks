const jwt = require('jsonwebtoken');

function requireAuth(req, res, next) {
  const token = req.cookies && req.cookies.token;
  if (!token) return res.status(401).json({ error: 'Not authenticated' });
  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    req.userId = payload.userId;
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Invalid or expired session' });
  }
}

// Like requireAuth, but doesn't reject when there's no session - just leaves
// req.userId undefined. Useful for routes that render differently for a
// logged-in viewer (e.g. "am I following this profile") but are still
// readable while logged out.
function attachUserIfPresent(req, res, next) {
  const token = req.cookies && req.cookies.token;
  if (!token) return next();
  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    req.userId = payload.userId;
  } catch (_) { /* ignore invalid token */ }
  next();
}

module.exports = { requireAuth, attachUserIfPresent };
