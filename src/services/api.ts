import axios from "axios";
import {
  getAccessToken,
  getRefreshToken,
  saveTokens,
  clearTokens
} from "../utils/token";

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "https://localhost:7216/api";

const api = axios.create({
  baseURL: API_BASE_URL
});

let isRefreshing = false;
let refreshQueue: Array<(token: string) => void> = [];

function resolveRefreshQueue(token: string) {
  refreshQueue.forEach((cb) => cb(token));
  refreshQueue = [];
}

api.interceptors.request.use((config) => {
  const token = getAccessToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (res) => res,
  async (error) => {
    const original = error.config;

    if (error.response?.status === 401 && !original._retry) {
      original._retry = true;

      if (isRefreshing) {
        return new Promise((resolve) => {
          refreshQueue.push((token) => {
            original.headers.Authorization = `Bearer ${token}`;
            resolve(api(original));
          });
        });
      }

      isRefreshing = true;

      try {
        const refreshToken = getRefreshToken();

        const resp = await axios.post(
          `${API_BASE_URL}/Auth/refresh-token`,
          { refreshToken }
        );

        const { accessToken, refreshToken: newRefresh } = resp.data.data;

        saveTokens(accessToken, newRefresh);
        resolveRefreshQueue(accessToken);

        original.headers.Authorization = `Bearer ${accessToken}`;

        return api(original);
      } catch {
        clearTokens();
        window.location.href = "/login";
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

export default api;