import { api } from './client';
const org = (slug) => `/organizations/${encodeURIComponent(slug)}`;
export const organizationsApi = {
  list: () => api.get('/organizations/'), create: (data) => api.post('/organizations/', data),
  get: (s) => api.get(`${org(s)}/`), update: (s, data) => api.patch(`${org(s)}/`, data),
  members: (s) => api.get(`${org(s)}/members/`),
  editMember: (s, id, data) => api.patch(`${org(s)}/members/${id}/`, data),
  removeMember: (s, id) => api.delete(`${org(s)}/members/${id}/`),
  invitations: (s) => api.get(`${org(s)}/invitations/`),
  invite: (s, data) => api.post(`${org(s)}/invitations/`, data),
  revokeInvite: (s, id) => api.delete(`${org(s)}/invitations/${id}/`),
};
export const projectsApi = {
  list: (s, params) => api.get(`${org(s)}/projects/`, {params}),
  get: (s, id) => api.get(`${org(s)}/projects/${id}/`),
  create: (s, data) => api.post(`${org(s)}/projects/`, data),
  update: (s, id, data) => api.patch(`${org(s)}/projects/${id}/`, data),
  remove: (s, id) => api.delete(`${org(s)}/projects/${id}/`),
};
export const tasksApi = {
  list: (s, params) => api.get(`${org(s)}/tasks/`, {params}),
  get: (s, id) => api.get(`${org(s)}/tasks/${id}/`),
  create: (s, data) => api.post(`${org(s)}/tasks/`, data),
  update: (s, id, data) => api.patch(`${org(s)}/tasks/${id}/`, data),
  remove: (s, id) => api.delete(`${org(s)}/tasks/${id}/`),
};
export const collaborationApi = {
  comments: (s, task) => api.get(`${org(s)}/tasks/${task}/comments/`),
  addComment: (s, task, body) => api.post(`${org(s)}/tasks/${task}/comments/`, {body}),
  editComment: (s, id, body) => api.patch(`${org(s)}/comments/${id}/`, {body}),
  deleteComment: (s, id) => api.delete(`${org(s)}/comments/${id}/`),
  attachments: (s, task) => api.get(`${org(s)}/tasks/${task}/attachments/`),
  upload: (s, task, file) => { const data = new FormData(); data.append('file', file); return api.post(`${org(s)}/tasks/${task}/attachments/`, data); },
  removeAttachment: (s, id) => api.delete(`${org(s)}/attachments/${id}/`),
  download: (s, id) => api.get(`${org(s)}/attachments/${id}/`, {responseType:'blob'}),
};
export const approvalsApi = {
  list: (s, params) => api.get(`${org(s)}/approvals/`, {params}),
  forTask: (s, task) => api.get(`${org(s)}/tasks/${task}/approvals/`),
  request: (s, task, data) => api.post(`${org(s)}/tasks/${task}/approvals/`, data),
  decide: (s, id, data) => api.patch(`${org(s)}/approvals/${id}/`, data),
};
export const notificationsApi = {
  list: (s, params) => api.get(`${org(s)}/notifications/`, {params}),
  update: (s, id, is_read) => api.patch(`${org(s)}/notifications/${id}/`, {is_read}),
  readAll: (s) => api.post(`${org(s)}/notifications/read-all/`),
};
export const dashboardApi = (s) => api.get(`${org(s)}/dashboard/`);
export const activityApi = (s, params) => api.get(`${org(s)}/activity/`, {params});
