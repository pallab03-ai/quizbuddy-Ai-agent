const API_BASE = 'http://localhost:3001/api';

function getToken() {
  return localStorage.getItem('token');
}

async function request(path, options = {}) {
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
  };
  const token = getToken();
  if (token) headers['Authorization'] = `Bearer ${token}`;
  const res = await fetch(API_BASE + path, {
    ...options,
    headers,
  });
  const contentType = res.headers.get('content-type');
  if (contentType && contentType.includes('application/json')) {
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'API error');
    return data;
  } else {
    // Not JSON (likely HTML error page)
    const text = await res.text();
    if (!res.ok) {
      throw new Error('Server error: ' + res.status + (text ? ' - ' + text.substring(0, 80) : ''));
    }
    throw new Error('Unexpected response from server.');
  }
}

const api = {
  post: (path, body) => request(path, { method: 'POST', body: JSON.stringify(body) }),
  get: (path) => request(path),
  delete: (path) => request(path, { method: 'DELETE' }),
};

export default api;
