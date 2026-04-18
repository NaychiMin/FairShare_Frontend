import axios from "../api/axios";
import type { CreateExpenseRequest, EditExpenseRequest } from "../types/Expense";
const TOKEN_KEY = "token";

class ExpenseService {

  // Create a new expense
  async createExpense(data: CreateExpenseRequest, jwtToken: string, userEmail: string) {
    const response = await axios.post(`/expenses`, data, {
      params: { requesterEmail: userEmail },
      headers: {
        'Authorization': `Bearer ${jwtToken}`
      },
    });
    return response.data;
  }

  async updateExpense(data: EditExpenseRequest, jwtToken: string, userEmail: string) {
    const response = await axios.put(`/expenses/${data.expenseId}`, data, {
      params: { requesterEmail: userEmail },
      headers: {
        'Authorization': `Bearer ${jwtToken}`
      },
    });
    return response.data;
  }

  // Get expense by ID
  async getExpenseById(expenseId: string, jwtToken: string, userEmail: string) {
    const response = await axios.get(`/expenses/${expenseId}`, {
      params: { requesterEmail: userEmail },
      headers: {
        'Authorization': `Bearer ${jwtToken}`,
      },
    });
    return response.data;
  }

  // Get all expenses for a group
  async getGroupExpenses(groupId: string, jwtToken: string, userEmail: string) {
    const response = await axios.get(`/expenses/group/${groupId}`, {
      params: { requesterEmail: userEmail },
      headers: {
        'Authorization': `Bearer ${jwtToken}`,
      },
    });
    return response.data;
  }

  async deleteExpense(expenseId: string, jwtToken: string, userEmail: string) {
    const response = await axios.delete(`/expenses/${expenseId}`, {
      params: { requesterEmail: userEmail },
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

export default new ExpenseService();