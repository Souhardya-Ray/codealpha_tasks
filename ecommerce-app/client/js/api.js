// Small fetch wrapper. All requests include cookies (for the JWT httpOnly cookie).
const API_BASE = 'http://localhost:5000/api';

async function api(path, { method = 'GET', body } = {}) {
  const res = await fetch(`${API_BASE}${path}`, {
    method,
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: body ? JSON.stringify(body) : undefined
  });
  let data = {};
  try { data = await res.json(); } catch (_) { /* empty body */ }
  if (!res.ok) {
    throw new Error(data.error || 'Something went wrong. Please try again.');
  }
  return data;
}
