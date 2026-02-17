import axios from "../api/axios";
import type { LoginFormInputs } from "../pages/Authentication/LoginPage/index.types";
import type { RegisterFormInputs } from "../pages/Authentication/RegisterPage/index.types";

const TOKEN_KEY = "token";

class AuthService {
  async login(data: LoginFormInputs) {
    const response = await axios.post("/auth/login", data);

    const token = response.data.token;
    localStorage.setItem(TOKEN_KEY, token);

    return response.data;
  }

  async register(data: RegisterFormInputs) {
    const response = await axios.post("/auth/register", data);
    return response.data;
  }

  logout() {
    localStorage.removeItem(TOKEN_KEY);
  }

  getToken() {
    return localStorage.getItem(TOKEN_KEY);
  }

  isAuthenticated() {
    return !!this.getToken();
  }
}

export default new AuthService();
