export interface UserSummary {
  userId: string;
  name: string;
  email: string;
}

export interface ExpenseSplit {
  splitId: string;
  userId: string;
  userName: string;
  userEmail: string;
  shareAmount: number;
  settledAmount: number;
  isSettled: boolean;
}

export interface Expense {
  expenseId: string;
  groupId: string;
  groupName: string;
  paidByUserId: string;
  paidByName: string;
  paidByEmail: string;
  createdByUserId: string;
  createdByName: string;
  createdByEmail: string;
  amount: number;
  description: string;
  notes?: string;
  splitStrategy: string;
  isSettled: boolean;
  expenseDate: string;
  createdAt: string;
  updatedAt?: string;
  splits: ExpenseSplit[];
}

export interface CreateExpenseRequest {
  groupId: string;
  paidByUserId: string;
  amount: number;
  description: string;
  notes?: string;
  expenseDate: string;
  splitStrategy: 'EQUAL'; // For Sprint2
  participantUserIds: string[];
}