import axios from "../api/axios";
const TOKEN_KEY = "token";

class GroupService {

  async create(data: any, jwtToken: string) {
    const response = await axios.post(`/group/create-new-group`, data, {
        headers: {
          'Authorization': `Bearer ${jwtToken}`,
          'Content-Type': 'application/json',
        },
      });
    return response.data;
  }

  async getAll(email: any, jwtToken: string) {
    const response = await axios.get(`/group/all/${email}`, {
        headers: {
          'Authorization': `Bearer ${jwtToken}`,
        },
      });
    return response.data;
  }

  getToken() {
    return localStorage.getItem(TOKEN_KEY);
  }

}

export default new GroupService();
