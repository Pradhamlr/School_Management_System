import axios from 'axios';

const baseURL = import.meta.env.VITE_BACKEND_URL || '';

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

export default api;
