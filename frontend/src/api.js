/**
 * api.js — SpaceNexus API client
 * Uses React proxy (package.json "proxy": "http://localhost:5000")
 * so all /api/* calls go to the backend automatically.
 */

const BASE = '/api';

// ── TOKEN ─────────────────────────────────────────────────────────────────
export const token = {
  get  : ()  => localStorage.getItem('sn_token'),
  set  : (t) => localStorage.setItem('sn_token', t),
  clear: ()  => localStorage.removeItem('sn_token'),
};

// ── FETCH WRAPPER ─────────────────────────────────────────────────────────
async function req(method, path, body) {
  const headers = { 'Content-Type': 'application/json' };
  const t = token.get();
  if (t) headers['Authorization'] = `Bearer ${t}`;
  const res  = await fetch(`${BASE}${path}`, {
    method, headers,
    body: body ? JSON.stringify(body) : undefined,
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || `HTTP ${res.status}`);
  return data;
}

const get   = (p)    => req('GET',    p);
const post  = (p, b) => req('POST',   p, b);
const patch = (p, b) => req('PATCH',  p, b);
const del   = (p)    => req('DELETE', p);

const api = {
  auth: {
    login   : (email, password) => post('/auth/login', { email, password }),
    register: (data)            => post('/auth/register', data),
    me      : ()                => get('/auth/me'),
    update  : (data)            => patch('/auth/me', data),
    password: (cur, next)       => patch('/auth/password', { currentPassword: cur, newPassword: next }),
  },
  spaces: {
    getAll : ()      => get('/spaces'),
    getOne : (id)    => get(`/spaces/${id}`),
    create : (data)  => post('/spaces', data),
    update : (id, d) => patch(`/spaces/${id}`, d),
    approve: (id)    => patch(`/spaces/${id}/approve`),
    reject : (id)    => patch(`/spaces/${id}/reject`),
    delete : (id)    => del(`/spaces/${id}`),
    getFloorImages : (id)            => get(`/spaces/${id}/floors`),
    saveFloorImage : (id, floor, image) => req('PATCH', `/spaces/${id}/floor-image`, { floor, image }),
  },
  units: {
    getAll : (p) => get(`/units${p ? '?'+new URLSearchParams(p) : ''}`),
    getOne : (id)    => get(`/units/${id}`),
    create : (data)  => post('/units', data),
    update : (id, d) => patch(`/units/${id}`, d),
    delete : (id)    => del(`/units/${id}`),
  },
  bookings: {
    getAll : (p) => get(`/bookings${p ? '?'+new URLSearchParams(p) : ''}`),
    getOne : (id)    => get(`/bookings/${id}`),
    create : (data)  => post('/bookings', data),
    approve: (id)    => patch(`/bookings/${id}/approve`),
    reject : (id)    => patch(`/bookings/${id}/reject`),
    cancel : (id)    => patch(`/bookings/${id}/cancel`),
    pay    : (id)    => patch(`/bookings/${id}/pay`),
  },
  analytics: {
    dashboard: () => get('/analytics/dashboard'),
  },
  payments: {
    initiate : (bookingId) => post('/payments/initiate', { bookingId }),
    status   : (bookingId) => get(`/payments/status/${bookingId}`),
  },

  users: {
    getAll   : (p) => get(`/users${p ? '?'+new URLSearchParams(p) : ''}`),
    setStatus: (id, status) => patch(`/users/${id}/status`, { status }),
  },
};

export default api;
