import axios from "axios"
import authService from "../services/authService";

const baseURL = import.meta.env.VITE_REACT_APP_FAIRSHARE_BACKEND_SERVICE_URL;

const instance = axios.create({
  baseURL
});

instance.interceptors.request.use((config) => {
  const token = authService.getToken();

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

export default instance;
