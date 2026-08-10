import axios from "axios";

// Live production backend URL on Render
const PRODUCTION_BACKEND_URL = "https://med-core-hms-backend.onrender.com/api/v1";

// Centralized Axios instance for all backend API endpoints
const API = axios.create({
  baseURL: import.meta.env.VITE_API_URL 
    ? `${import.meta.env.VITE_API_URL.replace(/\/$/, "")}/api/v1` 
    : PRODUCTION_BACKEND_URL,
  headers: {
    "Content-Type": "application/json",
    "Bypass-Tunnel-Remainder": "true",
  },
});

// Request Interceptor: Automatically attach Bearer token if present
API.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token") || localStorage.getItem("access_token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response Interceptor: Manage expired sessions and global response errors
API.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // Clear all possible token storage keys and send user back to login page
      localStorage.removeItem("token");
      localStorage.removeItem("access_token");
      localStorage.removeItem("user");
      if (window.location.pathname !== "/login") {
        window.location.href = "/login";
      }
    }
    return Promise.reject(error);
  }
);

// ==========================================
// DOCTOR MANAGEMENT ENDPOINTS
// ==========================================

export const fetchDoctors = async () => {
  try {
    const response = await API.get("/doctors/");
    return response.data;
  } catch (err) {
    if (err.response && (err.response.status === 404 || err.response.status === 307)) {
      const fallback = await API.get("/doctors");
      return fallback.data;
    }
    throw err;
  }
};

export const createDoctor = async (doctorData) => {
  try {
    const response = await API.post("/doctors/", doctorData);
    return response.data;
  } catch (err) {
    if (err.response && (err.response.status === 404 || err.response.status === 307)) {
      const fallback = await API.post("/doctors", doctorData);
      return fallback.data;
    }
    throw err;
  }
};

export const updateDoctor = async (doctorId, doctorData) => {
  try {
    const response = await API.put(`/doctors/${doctorId}`, doctorData);
    return response.data;
  } catch (err) {
    if (err.response && (err.response.status === 405 || err.response.status === 404)) {
      const fallback = await API.patch(`/doctors/${doctorId}`, doctorData);
      return fallback.data;
    }
    throw err;
  }
};

export const deleteDoctor = async (doctorId) => {
  try {
    const response = await API.delete(`/doctors/${doctorId}`);
    return response.data;
  } catch (err) {
    if (err.response && err.response.status === 404) {
      const fallback = await API.delete(`/doctors/${doctorId}/`);
      return fallback.data;
    }
    throw err;
  }
};

export default API;