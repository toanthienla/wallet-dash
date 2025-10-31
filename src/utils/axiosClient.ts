import axios, { AxiosError, AxiosInstance } from "axios";
import { ACCESS_TOKEN, PROXY_ACCESS_TOKEN } from "@/utils/constants";

// Retry configuration
const MAX_RETRIES = 3;
const RETRY_DELAY = 1000; // ms
const BACKOFF_MULTIPLIER = 2;

const axiosClient: AxiosInstance = axios.create({
  timeout: 30000, // 30 second timeout
});

// Request interceptor
axiosClient.interceptors.request.use((config) => {
  // Add authorization headers
  if (ACCESS_TOKEN) {
    config.headers.Authorization = `Bearer ${ACCESS_TOKEN}`;
  }
  if (PROXY_ACCESS_TOKEN) {
    config.headers["X-Proxy-Authorization"] = `Bearer ${PROXY_ACCESS_TOKEN}`;
  }

  // Add CORS headers
  config.headers["Access-Control-Allow-Credentials"] = "true";

  // Log request in development
  if (process.env.NODE_ENV === "development") {
    console.log("📤 API Request:", {
      method: config.method?.toUpperCase(),
      url: config.url,
      headers: config.headers,
      data: config.data,
    });
  }

  return config;
});

// Response interceptor with retry logic
let retryCount = 0;

axiosClient.interceptors.response.use(
  (response) => {
    if (process.env.NODE_ENV === "development") {
      console.log("📥 API Response:", {
        status: response.status,
        url: response.config.url,
        data: response.data,
      });
    }
    retryCount = 0; // Reset on success
    return response;
  },
  async (error: AxiosError) => {
    const config = error.config;

    // Check if it's a 502 or 503 error (server/gateway issues)
    const is502Or503 = error.response?.status === 502 || error.response?.status === 503;
    const isTimeout = error.code === "ECONNABORTED";
    const isNetworkError = error.code === "ERR_NETWORK";

    // Retry logic for transient errors
    if ((is502Or503 || isTimeout || isNetworkError) && retryCount < MAX_RETRIES && config) {
      retryCount++;
      const delayMs = RETRY_DELAY * Math.pow(BACKOFF_MULTIPLIER, retryCount - 1);

      console.warn(
        `⚠️ Retrying request (attempt ${retryCount}/${MAX_RETRIES}) after ${delayMs}ms...`,
        {
          url: config.url,
          status: error.response?.status,
          reason: is502Or503 ? "502/503 Error" : isTimeout ? "Timeout" : "Network Error",
        }
      );

      // Wait before retrying
      await new Promise((resolve) => setTimeout(resolve, delayMs));

      // Retry the request
      return axiosClient(config);
    }

    // Enhanced error logging
    if (process.env.NODE_ENV === "development") {
      console.error("❌ API Error:", {
        status: error.response?.status,
        url: error.config?.url,
        message: error.message,
        data: error.response?.data,
        headers: error.config?.headers,
      });
    }

    return Promise.reject(error);
  }
);

export default axiosClient;