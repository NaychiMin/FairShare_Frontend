import axios from "axios"
import authService from "../services/authService";

const instance = axios.create({
  baseURL: "http://localhost:8080/api",
});

instance.interceptors.request.use((config) => {
  const token = authService.getToken();

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

export default instance;
