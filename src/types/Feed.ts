import type { SettlementResponse } from "../services/settlementService";
import type { UserBadgeDto } from "./Badge";
import type { Expense } from "./Expense";

export interface FeedEntry {
  feedEntryId: string;
  feedEntryType: string;
  createdAt: string;
  expenseAdded?: Expense;
  settlementAdded?: SettlementResponse;
  userBadgeEarned?: UserBadgeDto;
  groupSettled?: any;
  group?: { groupName: string, category: string };
  groupUpdatedFieldOld?: string;
  groupUpdatedFieldNew?: string;
}

export interface FeedPage {
  content: FeedEntry[];
  totalElements: number;
  totalPages: number;
  number: number;
  size: number;
  last: boolean;
}

export interface FeedEntryFilteredRequestDto {
  userId: string;
  page: number;
  size: number;
  sortBy: string;
  direction: string;
  types: FeedEntryType[] | null;
}

export type FeedEntryType =
  | 'EXPENSE_ADDED'
  | 'SETTLEMENT_ADDED'
  | 'BADGE_EARNED'
  | 'GROUP_UPDATE'
  | 'GROUP_ALL_SETTLED';

export const FEED_ENTRY_TYPES: FeedEntryType[] = [
  'EXPENSE_ADDED',
  'SETTLEMENT_ADDED',
  'BADGE_EARNED',
  'GROUP_UPDATE',
  'GROUP_ALL_SETTLED'
];