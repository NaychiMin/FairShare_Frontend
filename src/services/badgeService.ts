import axios from "../api/axios";

export interface UserBadge {
  badgeName: string;
  description: string;
  badgeType: string;
  badgeScope: string;
  groupName?: string;
  earnedAt: string; // or Date, depending on how you handle it
}

class BadgeService {
  // Get badges for the currently authenticated user
  async getUserBadges(email: string): Promise<UserBadge[]> {
    const response = await axios.get<UserBadge[]>(`/user/badges/${email}`);
    return response.data;
}
}

export default new BadgeService();