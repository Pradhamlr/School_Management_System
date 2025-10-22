import axios from 'axios';

const baseURL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000';

const api = axios.create({
  baseURL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Token getter can be registered by AuthProvider to supply token from context
let tokenGetter: (() => string | null) | null = null;
export function setTokenGetter(getter: () => string | null) {
  tokenGetter = getter;
}

api.interceptors.request.use((config) => {
  try {
    // Prefer token from registered getter (AuthContext) to avoid localStorage reliance
    const token = tokenGetter ? tokenGetter() : localStorage.getItem('token');
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  } catch (e) {
    // ignore
  }
  return config;
});

// API functions matching backend routes
export const studentAPI = {
  getCurrentStudent: () => api.get('/api/students/me'),
  getStudentAssignments: (studentId: number) => api.get(`/api/assignments/student/${studentId}`),
};

export const subjectAPI = {
  getSubjects: () => api.get('/api/subjects'),
};

export const timetableAPI = {
  getTimetables: () => api.get('/api/timetables'),
};

export const notificationAPI = {
  getNotifications: () => api.get('/api/notifications'),
};

export const examAPI = {
  getExams: () => api.get('/api/exams'),
};

export default api;
