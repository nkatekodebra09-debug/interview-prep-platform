import axios from 'axios';

const configuredBase = import.meta.env.VITE_API_URL?.trim();
const BASE = configuredBase
  ? `${configuredBase.replace(/\/+$/, '').replace(/\/api$/i, '')}/api`
  : '/api';

const apiClient = axios.create({
  baseURL: BASE,
  headers: {
    'Content-Type': 'application/json',
  },
});

apiClient.interceptors.response.use(
  (response) => response.data,
  (error) => {
    const message =
      error.response?.data?.message ||
      (error.code === 'ERR_NETWORK'
        ? 'Cannot reach the API. Start the backend and verify that MongoDB is running.'
        : error.message || 'Request failed');
    return Promise.reject(new Error(message));
  },
);

async function request(path, { method = 'GET', body, token } = {}) {
  const config = {
    url: path,
    method,
    data: body,
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  };

  return apiClient.request(config);
}

export const api = {
  register: (body) => request('/auth/register', { method: 'POST', body }),
  login: (body) => request('/auth/login', { method: 'POST', body }),
  me: (token) => request('/auth/me', { token }),

  getSets: (token, query = '') => request(`/question-sets${query}`, { token }),
  getSet: (token, id) => request(`/question-sets/${id}`, { token }),
  createSet: (token, body) => request('/question-sets', { method: 'POST', body, token }),
  updateSet: (token, id, body) => request(`/question-sets/${id}`, { method: 'PUT', body, token }),
  publishSet: (token, id) => request(`/question-sets/${id}/publish`, { method: 'PATCH', token }),
  deleteSet: (token, id) => request(`/question-sets/${id}`, { method: 'DELETE', token }),

  createQuestion: (token, body) => request('/questions', { method: 'POST', body, token }),
  updateQuestion: (token, id, body) => request(`/questions/${id}`, { method: 'PUT', body, token }),
  deleteQuestion: (token, id) => request(`/questions/${id}`, { method: 'DELETE', token }),

  submitAttempt: (token, body) => request('/submissions', { method: 'POST', body, token }),
  myAttempts: (token) => request('/submissions', { token }),
  attempt: (token, id) => request(`/submissions/${id}`, { token }),
  leaderboard: (token) => request('/submissions/leaderboard', { token }),
  performance: (token) => request('/submissions/performance', { token }),
  reviewQueue: (token) => request('/submissions/review-queue', { token }),
  reviewSubmission: (token, id, body) =>
    request(`/submissions/${id}/review`, { method: 'PATCH', body, token }),

  adminUsers: (token, query = '') => request(`/admin/users${query}`, { token }),
  approveUser: (token, id) => request(`/admin/users/${id}/approve`, { method: 'PATCH', token }),
  blockUser: (token, id, blocked) =>
    request(`/admin/users/${id}/block`, { method: 'PATCH', body: { blocked }, token }),
  deleteUser: (token, id) => request(`/admin/users/${id}`, { method: 'DELETE', token }),
  adminSets: (token, status) => request(`/admin/question-sets?status=${status}`, { token }),
  reviewSet: (token, id, status) =>
    request(`/admin/question-sets/${id}/status`, { method: 'PATCH', body: { status }, token }),
  analytics: (token) => request('/admin/analytics', { token }),
};
