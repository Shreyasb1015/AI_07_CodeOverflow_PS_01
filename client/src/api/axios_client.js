import axios from "axios";

const axiosClient = axios.create({
  baseURL: "http://localhost:3000/api/",
  withCredentials: true, 
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
});

axiosClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("authToken");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

axiosClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      console.error("Unauthorized - Redirect to login or refresh token");
    } else if (error.response?.status === 403) {
      console.error("Forbidden - Insufficient permissions");
    }
    return Promise.reject(error);
  }
);

export default axiosClient;
