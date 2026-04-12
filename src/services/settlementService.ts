// src/services/settlementService.ts
import axios from "../api/axios";

export interface CreateSettlementRequest {
  groupId: string;
  fromUserId: string;
  toUserId: string;
  amount: number;
  settlementDate: string;
  paymentMethod?: string;
  notes?: string;
}

export interface SettlementResponse {
  settlementId: string;
  groupId: string;
  groupName: string;
  fromUserId: string;
  fromUserName: string;
  fromUserEmail: string;
  toUserId: string;
  toUserName: string;
  toUserEmail: string;
  createdById: string;
  createdByName: string;
  amount: number;
  settlementDate: string;
  paymentMethod: string;
  notes: string;
  createdAt: string;
  updatedAt: string;
}

export interface EditSettlementRequest {
  amount: number;
  settlementDate: string;
  paymentMethod?: string;
  notes?: string;
}

class SettlementService {

  // Create Settlement
  async createSettlement(data: CreateSettlementRequest, jwtToken: string, userEmail: string): Promise<SettlementResponse> {
    const response = await axios.post(`/settlements`, data, {
      params: { requesterEmail: userEmail },
      headers: {
        'Authorization': `Bearer ${jwtToken}`
      },
    });
    return response.data;
  }
  
  // Get all settlements of a group
  async getGroupSettlements(groupId: string, jwtToken: string, userEmail: string): Promise<SettlementResponse[]> {
    const response = await axios.get(`/settlements/group/${groupId}/all`, {
        params: { requesterEmail: userEmail },
        headers: {
        'Authorization': `Bearer ${jwtToken}`
      },
    });
    return response.data;
  }

  // Get single settlement record by Id
  async getSettlementById(settlementId: string, jwtToken: string, userEmail: string): Promise<SettlementResponse> {
    const response = await axios.get(`/settlements/${settlementId}`, {
      params: { requesterEmail: userEmail },
      headers: {
        'Authorization': `Bearer ${jwtToken}`
      },
    });
    return response.data;
  }

  // Delete settlement by Id
  async deleteSettlement(settlementId: string, jwtToken: string, userEmail: string): Promise<void> {
    await axios.delete(`/settlements/${settlementId}`, {
      params: { requesterEmail: userEmail },
      headers: {
        'Authorization': `Bearer ${jwtToken}`
      },
    });
  }

  // Edit settlement by Id
  async editSettlement(settlementId: string, data: EditSettlementRequest, jwtToken: string, userEmail: string): Promise<SettlementResponse> {
    const response = await axios.put(`/settlements/${settlementId}`, data, {
      params: { requesterEmail: userEmail },
      headers: {
        'Authorization': `Bearer ${jwtToken}`,
        'Content-Type': 'application/json'
      }
    });
    return response.data;
  }
}

export default new SettlementService();