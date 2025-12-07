// API client configuration
import axios from "axios";

// Use environment variable for deployed backend, fallback to /api for local development
const API_BASE = import.meta.env.VITE_API_BASE_URL || "/api";

const apiClient = axios.create({
  baseURL: API_BASE,
  headers: {
    "Content-Type": "application/json",
  },
});

// Add request interceptor to include session token if needed
apiClient.interceptors.request.use((config) => {
  const sessionToken = localStorage.getItem("sessionToken");
  if (sessionToken && sessionToken !== "undefined") {
    config.data = {
      ...config.data,
      session: sessionToken,
    };
  }
  // Log API request
  console.log(
    `[API Request] ${config.method.toUpperCase()} ${config.url}`,
    config.data
  );
  return config;
});

// Add response interceptor to handle errors
apiClient.interceptors.response.use(
  (response) => {
    // Log API response
    console.log(
      `[API Response] ${response.status} ${response.config.url}`,
      response.data
    );
    return response;
  },
  (error) => {
    // Log API error
    console.error(
      `[API Error] ${error.config?.method?.toUpperCase() || "REQUEST"} ${
        error.config?.url || "Unknown URL"
      }`,
      error.response?.data || error.message
    );
    if (error.response?.data?.error === "Invalid session token") {
      // Clear invalid session
      localStorage.removeItem("sessionToken");
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

export default apiClient;
