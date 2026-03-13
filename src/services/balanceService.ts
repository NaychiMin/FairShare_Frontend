import axios from "../api/axios";

export interface UserBalance {
  userId: string;
  name: string;
  email: string;
  amount: number;
}

export interface GroupBalanceResponse {
  netBalance: number;
  owesYou: UserBalance[];
  youOwe: UserBalance[];
}

class BalanceService {
  // Get net balance of group
  async getUserBalanceInGroup(groupId: string, jwtToken: string, userEmail: string): Promise<GroupBalanceResponse> {
    const response = await axios.get(`/balances/group/${groupId}/user`, {
      params: { requesterEmail: userEmail },
      headers: {
        'Authorization': `Bearer ${jwtToken}`
      },
    });
    return response.data;
  }

  // Get net balance of user
  async getUserNetBalance(groupId: string, jwtToken: string, userEmail: string): Promise<number> {
    const response = await axios.get(`/balances/group/${groupId}/user/net`, {
      params: { requesterEmail: userEmail },
      headers: {
        'Authorization': `Bearer ${jwtToken}`
      },
    });
    return response.data;
  }
}

export default new BalanceService();