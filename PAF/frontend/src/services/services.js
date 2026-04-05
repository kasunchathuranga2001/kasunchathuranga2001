import api from './api'

export const resourceService = {
  getAll: () => api.get('/resources'),
  getById: (id) => api.get(`/resources/${id}`),
  search: (params) => api.get('/resources/search', { params }),
  create: (data) => api.post('/resources', data),
  update: (id, data) => api.put(`/resources/${id}`, data),
  updateStatus: (id, status) => api.patch(`/resources/${id}/status`, null, { params: { status } }),
  delete: (id) => api.delete(`/resources/${id}`),
}

export const bookingService = {
  getAll: () => api.get('/bookings'),
  getById: (id) => api.get(`/bookings/${id}`),
  getMyBookings: () => api.get('/bookings/my-bookings'),
  filter: (params) => api.get('/bookings/filter', { params }),
  create: (data) => api.post('/bookings', data),
  approve: (id, remarks) => api.patch(`/bookings/${id}/approve`, null, { params: { remarks } }),
  reject: (id, reason) => api.patch(`/bookings/${id}/reject`, null, { params: { reason } }),
  cancel: (id) => api.patch(`/bookings/${id}/cancel`),
}

export const ticketService = {
  getAll: () => api.get('/tickets'),
  getById: (id) => api.get(`/tickets/${id}`),
  getMyTickets: () => api.get('/tickets/my-tickets'),
  getAssigned: () => api.get('/tickets/assigned'),
  filter: (params) => api.get('/tickets/filter', { params }),
  create: (formData) => api.post('/tickets', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  assign: (id, technicianId) => api.patch(`/tickets/${id}/assign/${technicianId}`),
  updateStatus: (id, status, notes) => api.patch(`/tickets/${id}/status`, null, { params: { status, notes } }),
  delete: (id) => api.delete(`/tickets/${id}`),
  
  // Comments
  getComments: (ticketId) => api.get(`/tickets/${ticketId}/comments`),
  addComment: (ticketId, data) => api.post(`/tickets/${ticketId}/comments`, data),
  updateComment: (commentId, data) => api.put(`/tickets/comments/${commentId}`, data),
  deleteComment: (commentId) => api.delete(`/tickets/comments/${commentId}`),
}

export const notificationService = {
  getAll: () => api.get('/notifications'),
  getUnread: () => api.get('/notifications/unread'),
  getUnreadCount: () => api.get('/notifications/unread/count'),
  markAsRead: (id) => api.patch(`/notifications/${id}/read`),
  markAllAsRead: () => api.patch('/notifications/read-all'),
}

export const userService = {
  getAll: () => api.get('/users'),
  getById: (id) => api.get(`/users/${id}`),
  getMe: () => api.get('/users/me'),
  getByRole: (role) => api.get(`/users/role/${role}`),
  updateProfile: (data) => api.put('/users/me', data),
  updateRole: (id, role) => api.patch(`/users/${id}/role`, null, { params: { role } }),
  deactivate: (id) => api.patch(`/users/${id}/deactivate`),
  activate: (id) => api.patch(`/users/${id}/activate`),
}
