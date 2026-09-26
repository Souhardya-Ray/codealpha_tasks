const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:5000/api';

export async function api(path, { method = 'GET', body, isFormData = false } = {}) {
  const res = await fetch(`${API_BASE}${path}`, {
    method,
    credentials: 'include',
    headers: isFormData ? undefined : { 'Content-Type': 'application/json' },
    body: isFormData ? body : body ? JSON.stringify(body) : undefined
  });
  let data = {};
  try { data = await res.json(); } catch (_) { /* empty body */ }
  if (!res.ok) throw new Error(data.error || 'Something went wrong. Please try again.');
  return data;
}

export function mediaUrl(path) {
  if (!path) return '';
  if (path.startsWith('http')) return path;
  return `${API_BASE.replace(/\/api$/, '')}${path}`;
}
