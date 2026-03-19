import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

const api = axios.create({
  baseURL: API_URL,
  headers: { 'Content-Type': 'application/json' },
  timeout: 15000,
});

// Leads
export const submitLead = (data) => api.post('/api/leads', data);
export const getLeads = (params) => api.get('/api/leads', { params });
export const getLead = (id) => api.get(`/api/leads/${id}`);
export const updateLead = (id, data) => api.patch(`/api/leads/${id}`, data);
export const getLeadStats = () => api.get('/api/leads/stats');

// Quotes
export const estimateQuote = (data) => api.post('/api/quotes/estimate', data);
export const createQuote = (data) => api.post('/api/quotes', data);
export const getQuotes = () => api.get('/api/quotes');
export const updateQuote = (id, data) => api.patch(`/api/quotes/${id}`, data);

// Appointments
export const getAvailableSlots = () => api.get('/api/appointments/slots');
export const createAppointment = (data) => api.post('/api/appointments', data);
export const getAppointments = (params) => api.get('/api/appointments', { params });

// AI Chat
export const startChat = () => api.get('/api/conversations/start');
export const sendMessage = (data) => api.post('/api/conversations/chat', data);

// Jobs
export const getJobs = (params) => api.get('/api/jobs', { params });
export const createJob = (data) => api.post('/api/jobs', data);
export const updateJob = (id, data) => api.patch(`/api/jobs/${id}`, data);

// Analytics
export const getDashboard = () => api.get('/api/analytics/dashboard');

export default api;
