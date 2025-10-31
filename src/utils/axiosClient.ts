import axios from "axios";
import { ACCESS_TOKEN, PROXY_ACCESS_TOKEN } from "@/utils/constants";

const axiosClient = axios.create();

// Automatically attach Authorization header
axiosClient.interceptors.request.use((config) => {
  if (ACCESS_TOKEN) {
    config.headers.Authorization = `Bearer ${ACCESS_TOKEN}`;
  }
  if (PROXY_ACCESS_TOKEN) {
    config.headers["X-Proxy-Authorization"] = `Bearer ${PROXY_ACCESS_TOKEN}`;
  }
  return config;
});

export default axiosClient;
