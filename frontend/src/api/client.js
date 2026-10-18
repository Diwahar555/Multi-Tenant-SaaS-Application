import axios from 'axios';
export const api = axios.create({ baseURL: '/api/v1', withCredentials: true });
let accessToken = null;
let refreshPromise = null;
export const setAccessToken = (token) => { accessToken = token; };
export const csrfToken = () => {
  const entry = document.cookie.split('; ').find((row) => row.startsWith('csrftoken='));
  return entry ? decodeURIComponent(entry.split('=').slice(1).join('=')) : '';
};
export const ensureCsrf = async () => api.get('/auth/csrf/');
const refreshAccess = async () => {
  if (!refreshPromise) {
    refreshPromise = axios.post('/api/v1/auth/token/refresh/', {}, {
      withCredentials: true, headers: { 'X-CSRFToken': csrfToken() },
    }).then(({data}) => { accessToken = data.access; return accessToken; })
      .catch((err) => { accessToken = null; throw err; })
      .finally(() => { refreshPromise = null; });
  }
  return refreshPromise;
};
export { refreshAccess };
api.interceptors.request.use((config) => {
  if (accessToken && !config.url?.startsWith('/auth/')) config.headers.Authorization = `Bearer ${accessToken}`;
  if (['post', 'put', 'patch', 'delete'].includes((config.method || '').toLowerCase())) {
    config.headers['X-CSRFToken'] = csrfToken();
  }
  return config;
});
api.interceptors.response.use((response) => response, async (error) => {
  const request = error.config;
  if (error.response?.status === 401 && request && !request._retry && !request.url?.startsWith('/auth/')) {
    request._retry = true;
    try { request.headers.Authorization = `Bearer ${await refreshAccess()}`; return api(request); }
    catch { window.dispatchEvent(new Event('teamspace:signedout')); }
  }
  return Promise.reject(error);
});
export const getError = (error) => {
  const data = error?.response?.data;
  if (!data) return 'Something went wrong. Check your connection.';
  if (typeof data.detail === 'string') return data.detail;
  const first = Object.values(data)[0];
  return Array.isArray(first) ? first[0] : (typeof first === 'string' ? first : 'Please review your input.');
};
export const items = (data) => Array.isArray(data) ? data : (data?.results || []);
