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


  async getArchived(email: string, jwtToken: string) {
    const response = await axios.get(`/group/archived/${email}`, {
      headers: { Authorization: `Bearer ${jwtToken}` },
    });
    return response.data;
  }

  async archiveGroup(groupId: string, jwtToken: string, requesterEmail: string) {
    const response = await axios.put(`/group/archive/${groupId}`, null, {
      params: { requesterEmail },
      headers: { Authorization: `Bearer ${jwtToken}` },
    });
    return response.data;
  }

  async unarchiveGroup(groupId: string, jwtToken: string, requesterEmail: string) {
    const response = await axios.put(`/group/unarchive/${groupId}`, null, {
      params: { requesterEmail },
      headers: { Authorization: `Bearer ${jwtToken}` },
    });
    return response.data;
  }

  async updateGroup(groupId: string, data: any, jwtToken: string, requesterEmail: string) {
    const response = await axios.put(`/group/${groupId}`, data, {
      params: { requesterEmail }, // matches your controller @RequestParam
      headers: {
        'Authorization': `Bearer ${jwtToken}`,
        'Content-Type': 'application/json',
      },
    });
    return response.data;
  }

  async deleteGroup(groupId: string, jwtToken: string, requesterEmail: string) {
    const response = await axios.delete(`/group/${groupId}`, {
      params: { requesterEmail },
      headers: {
        Authorization: `Bearer ${jwtToken}`,
      },
    });
    return response.data;
  }

  getToken() {
    return localStorage.getItem(TOKEN_KEY);
  }

  // Get group details to be displayed on group page
  async getGroupById(groupId: string, jwtToken: string, userEmail: string) {
    const response = await axios.get(`/group/${groupId}`, {
      params: { requesterEmail: userEmail }, 
      headers: {
        'Authorization': `Bearer ${jwtToken}`,
      },
    });
    return response.data;
  }

  // Get group members to be displayed on group page
  async getGroupMembers(groupId: string, jwtToken: string, userEmail: string) {
    const response = await axios.get(`/group/${groupId}/members`, {
      params: { requesterEmail: userEmail }, 
      headers: {
        'Authorization': `Bearer ${jwtToken}`,
      },
    });
    return response.data;
  }

  // async createInvite(groupId: string, data: any, jwtToken: string, requesterEmail: string) {
  //   const response = await axios.post(`/group/${groupId}/invite`, data, {
  //     params: { requesterEmail },
  //     headers: {
  //       Authorization: `Bearer ${jwtToken}`,
  //       "Content-Type": "application/json",
  //     },
  //   });
  //   return response.data;
  // }

  // async acceptInvite(token: string, jwtToken: string, requesterEmail: string) {
  //   const response = await axios.post(`/group/invite/accept`, null, {
  //     params: { token, requesterEmail },
  //     headers: {
  //       Authorization: `Bearer ${jwtToken}`,
  //     },
  //   });
  //   return response.data;
  // }

  async createInvite(groupId: string, data: any, jwtToken: string, requesterEmail: string) {
    const response = await axios.post(`/group/${groupId}/invite`, data, {
      params: { requesterEmail },
      headers: {
        Authorization: `Bearer ${jwtToken}`,
        "Content-Type": "application/json",
      },
    });
    return response.data;
  }

  async acceptInvite(token: string, jwtToken: string, requesterEmail: string) {
    const response = await axios.post(`/group/invite/accept`, null, {
      params: { token, requesterEmail },
      headers: {
        Authorization: `Bearer ${jwtToken}`,
      },
    });
    return response.data;
  }

  async getInviteByToken(token: string) {
    const response = await axios.get(`/group/invite/by-token`, {
      params: { token },
    });
    return response.data;
  }

  async getPendingInvites(email: string, jwtToken: string) {
    const response = await axios.get(`/group/invitations/pending/${email}`, {
      headers: {
        Authorization: `Bearer ${jwtToken}`,
      },
    });
    return response.data;
  }

  async getSentInvites(email: string, jwtToken: string) {
    const response = await axios.get(`/group/invitations/sent/${email}`, {
      headers: {
        Authorization: `Bearer ${jwtToken}`,
      },
    });
    return response.data;
  }

}

export default new GroupService();
