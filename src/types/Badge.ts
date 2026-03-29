import type { Group } from "../pages/Groups/GroupDetailsPage";
import type { User } from "./User";

export interface Badge {
  badgeId: string;
  name: string;
  description: string;
  badgeType: string;
  badgeRuleType: string;
}

export interface UserBadgeDto {
  userBadgeId: string;
  badge: Badge;
  group?: Group;
  user: User;
  createdAt: string;
  updatedAt: string;
}

export interface BadgeNotificationContextType {
  currentBadge: UserBadgeDto | null;
  showBadgePopup: (badge: UserBadgeDto) => void;
  hideBadgePopup: () => void;
  isPopupOpen: boolean;
}