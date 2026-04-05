import axios from "../api/axios";

class NotificationService {
  async getMyNotifications(jwtToken: string, requesterEmail: string) {
    const response = await axios.get("/notifications/me", {
      params: { requesterEmail },
      headers: { Authorization: `Bearer ${jwtToken}` },
    });
    return response.data;
  }

  async getUnreadCount(jwtToken: string, requesterEmail: string) {
    const response = await axios.get("/notifications/unread-count", {
      params: { requesterEmail },
      headers: { Authorization: `Bearer ${jwtToken}` },
    });
    return response.data;
  }

  async getUnreadByGroup(jwtToken: string, requesterEmail: string) {
    const response = await axios.get("/notifications/unread-by-group", {
      params: { requesterEmail },
      headers: { Authorization: `Bearer ${jwtToken}` },
    });
    return response.data;
  }

  async markAsRead(notificationId: string, jwtToken: string, requesterEmail: string) {
    await axios.put(`/notifications/${notificationId}/read`, null, {
      params: { requesterEmail },
      headers: { Authorization: `Bearer ${jwtToken}` },
    });
  }

  async markAllAsRead(jwtToken: string, requesterEmail: string) {
    await axios.put("/notifications/read-all", null, {
      params: { requesterEmail },
      headers: { Authorization: `Bearer ${jwtToken}` },
    });
  }
}

export default new NotificationService();