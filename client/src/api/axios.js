import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
});

// Called once from store.js. The token is read from the store on every request,
// so the store stays the single place where the session lives.
export function setupInterceptors(store, logout) {
  api.interceptors.request.use((config) => {
    const { token } = store.getState().auth;
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
  });

  api.interceptors.response.use(
    (response) => response,
    (error) => {
      if (error.response?.status === 401 && store.getState().auth.token) {
        store.dispatch(logout());
      }
      return Promise.reject(error);
    }
  );
}

// Shape used by every thunk's rejectWithValue, matching the API's { message, errors }.
export function toApiError(error) {
  if (!error.response) {
    return {
      status: 0,
      message: 'Could not reach the server. Check your connection and try again.',
      errors: {},
    };
  }
  return {
    status: error.response.status,
    message: error.response.data?.message || 'Something went wrong, please try again',
    errors: error.response.data?.errors || {},
  };
}

export default api;
