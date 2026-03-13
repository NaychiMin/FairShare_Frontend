import React from 'react';
import {
  Card,
  CardContent,
  Typography,
  Box,
  Chip,
  Avatar,
  Paper
} from '@mui/material';
import {
  Receipt as ReceiptIcon,
  CheckCircle as PaidIcon,
  Pending as PendingIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import type { Expense } from '../../types/Expense';
import { useAuth } from '../../context/Authentication/useAuth';

interface ExpenseCardProps {
  expense: Expense;
}

const ExpenseCard: React.FC<ExpenseCardProps> = ({ expense }) => {
  const navigate = useNavigate();
  const { user } = useAuth();

  // Find current user's split
  const userSplit = expense.splits.find(s => s.userId === user?.userId);
  const userOwes = userSplit && !userSplit.isSettled && userSplit.shareAmount > 0;
  const userGetsBack = expense.paidByUserId === user?.userId && 
    expense.splits.some(s => !s.isSettled && s.userId !== user?.userId);

  const getStatusChip = () => {
    if (expense.isSettled) {
      return <Chip icon={<PaidIcon />} label="Settled" color="success" size="small" />;
    }
    if (userOwes) {
      return <Chip icon={<PendingIcon />} label="You owe" color="warning" size="small" />;
    }
    if (userGetsBack) {
      return <Chip icon={<ReceiptIcon />} label="You get back" color="info" size="small" />;
    }
    return <Chip label="Pending" size="small" variant="outlined" />;
  };

  return (
    <Paper
      elevation={0}
      onClick={() => navigate(`/expenses/${expense.expenseId}`)}
      sx={{
        p: 2,
        mb: 2,
        backgroundColor: 'white',
        borderRadius: '12px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
        cursor: 'pointer',
        transition: 'all 0.2s ease',
        '&:hover': {
          boxShadow: '0 4px 14px rgba(0,0,0,0.12)',
          transform: 'translateY(-2px)',
        },
      }}
    >
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <Avatar sx={{ bgcolor: 'primary.light' }}>
            <ReceiptIcon />
          </Avatar>
          
          <Box>
            <Typography variant="h6" component="div" sx={{ fontWeight: 500 }}>
              {expense.description}
            </Typography>
            
            <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
              Paid by {expense.paidByName} • {new Date(expense.expenseDate).toLocaleDateString()}
            </Typography>

            <Box sx={{ display: 'flex', gap: 1, mt: 1 }}>
              {getStatusChip()}
              <Chip 
                label={`${expense.splits.length} people`} 
                size="small" 
                variant="outlined" 
              />
            </Box>
          </Box>
        </Box>

        <Box sx={{ textAlign: 'right' }}>
          <Typography variant="h6" color="primary" sx={{ fontWeight: 600 }}>
            ${expense.amount.toFixed(2)}
          </Typography>
          {userSplit && (
            <Typography variant="body2" color="text.secondary">
              Your share: ${userSplit.shareAmount.toFixed(2)}
            </Typography>
          )}
        </Box>
      </Box>
    </Paper>
  );
};

export default ExpenseCard; {}