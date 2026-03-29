import axios from "axios";

const baseURL = import.meta.env.VITE_REACT_APP_FAIRSHARE_BACKEND_SERVICE_URL;

const instance = axios.create({
  baseURL,
  withCredentials: true
});

instance.interceptors.request.use((config) => {
  return config;
});

export default instance;
