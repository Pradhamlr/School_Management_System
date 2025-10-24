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

// Response interceptor to handle auth errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Clear auth data on 401
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login/student';
    }
    return Promise.reject(error);
  }
);

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
  getStudentTimetables: (studentId: number) => api.get(`/api/timetables/student/${studentId}`),
};

export const notificationAPI = {
  getNotifications: () => api.get('/api/notifications'),
};

export const examAPI = {
  getExams: () => api.get('/api/exams'),
  getExamDetails: (examId: number) => api.get(`/api/exams/${examId}`),
};

export const authAPI = {
  login: (credentials: {email: string, password: string}) => api.post('/api/auth/login', credentials),
  forgotPassword: (payload: { email: string }) => api.post('/api/auth/forgot-password', payload),
  resetPassword: (payload: { token: string, newPassword: string }) => api.post('/api/auth/reset-password', payload),
};

export const assignmentAPI = {
  getStudentAssignments: (studentId: number) => api.get(`/api/assignments/student/${studentId}`),

  submitAssignment: (assignmentId: number, studentId: number, remarks?: string) => 
    api.post('/api/assignments/submissions', { assignmentId, studentId, remarks }),

  submitAssignmentWithFile: (assignmentId: number, studentId: number, file: File, remarks?: string) => {
    const formData = new FormData();
    formData.append('assignmentId', assignmentId.toString());
    formData.append('studentId', studentId.toString());
    formData.append('file', file);
    if (remarks) formData.append('remarks', remarks);

    return api.post('/api/assignments/submissions/with-file', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
  },

  getSubmissions: () => api.get('/api/assignments/submissions'),
};


export const attendanceAPI = {
  getStudentAttendance: (studentId: number, params?: any) => 
    api.get(`/api/attendance/students/${studentId}`, { params }),
  getAttendanceStats: () => api.get('/api/attendance/stats'),
  getAllStudentsAttendanceToday: () => api.get('/api/attendance/students/today'),
  getAllTeachersAttendanceToday: () => api.get('/api/attendance/teachers/today'),
  markStudentAttendance: (payload: any) => api.post('/api/attendance/students', payload),
};

export const resultAPI = {
  getStudentResults: (studentId: number) => api.get(`/api/results/student/${studentId}`),
};

export const classAPI = {
  getStudentClass: () => api.get('/api/classes/me'),
  getClasses: () => api.get('/api/classes'),
};

export const eventAPI = {
  getEvents: () => api.get('/api/events'),
  getEventById: (eventId: number) => api.get(`/api/events/${eventId}`),
  signupVolunteer: (eventId: number) => api.post(`/api/events/${eventId}/volunteer`),
};

// Convenience functions
export const getEvents = () => eventAPI.getEvents();
export const getEventById = (eventId: number) => eventAPI.getEventById(eventId);
export const signupVolunteer = (eventId: number) => eventAPI.signupVolunteer(eventId);

export default api;
