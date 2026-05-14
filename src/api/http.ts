import axios from "axios";

const http = axios.create({
  baseURL: "/api",
  timeout: 15000,
  headers: {
    "Content-Type": "application/json",
  },
});

// Response interceptor for consistent error handling
http.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.name === "CanceledError" || error.code === "ERR_CANCELED") {
      return Promise.reject(error);
    }
    console.error("API Error:", error?.response?.data || error.message);
    return Promise.reject(error);
  }
);

export default http;
