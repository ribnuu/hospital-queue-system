import axios from 'axios';

const api = axios.create({ baseURL: '/api' });

// Attach JWT to every request
api.interceptors.request.use(cfg => {
  const token = localStorage.getItem('token');
  if (token) cfg.headers.Authorization = `Bearer ${token}`;
  return cfg;
});

// Auth
export const login    = (email, password) => api.post('/auth/login',    { email, password });
export const register = (data)            => api.post('/auth/register',  data);

// Appointments
export const getAppointments       = ()          => api.get('/appointments');
export const getByDepartment       = (dept)      => api.get(`/appointments/department/${dept}`);
export const bookAppointment       = (data)      => api.post('/appointments', data);
export const updateStatus          = (id, status)=> api.patch(`/appointments/${id}/status?status=${status}`);

export default api;
