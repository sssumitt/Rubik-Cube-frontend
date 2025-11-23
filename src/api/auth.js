import axios from "axios";
// const BASE_URL = "https://rubik-cube-backend-multiplayer.onrender.com/api/auth";
const BASE_URL = "http://localhost:5000/api/auth";

const api = axios.create({
  baseURL: BASE_URL,
  withCredentials: true,
});

let csrfToken = null;
export const getCsrfToken = async () => {
  try {
    const { data } = await api.get("/csrf-token");
    csrfToken = data.csrfToken;
    return true;
  } catch (error) {
    console.error("Failed to get CSRF token", error);
    csrfToken = null;
    return false;
  }
};
api.interceptors.request.use(
  (config) => {
    if (["POST", "PUT", "DELETE", "PATCH"].includes(config.method.toUpperCase())) {
      if (csrfToken) {
        config.headers["X-CSRF-Token"] = csrfToken;
      }
    }
    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    if (error.response?.status === 401 && originalRequest.url !== '/refresh' && !originalRequest._retry) {
      originalRequest._retry = true;
      try {
        const { data } = await api.post("/refresh");
        csrfToken = data.csrfToken;
        originalRequest.headers["X-CSRF-Token"] = csrfToken;
        return api(originalRequest);
      } catch (refreshError) {
        console.error("Token refresh failed:", refreshError);
        return Promise.reject(refreshError);
      }
    }
    return Promise.reject(error);
  }
);


export const registerUser = async (credentials) => {
  const response = await api.post("/register", credentials);
  if (response.data.csrfToken) {
    csrfToken = response.data.csrfToken;
  }
  return response;
};

export const loginUser = async (credentials) => {
  const response = await api.post("/login", credentials);
  if (response.data.csrfToken) {
    csrfToken = response.data.csrfToken;
  }
  return response;
};

export const logoutUser = async () => {
  const response = await api.post("/logout");
  csrfToken = null;
  return response;
};

export const refreshToken = () => api.post("/refresh");

