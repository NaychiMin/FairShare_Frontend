import React from 'react';
import {
  Typography,
  Box,
  Chip,
  Avatar,
  Paper,
  Button,
  Dialog,
  DialogActions,
  DialogContent
} from '@mui/material';
import {
  Receipt as ReceiptIcon,
  CheckCircle as PaidIcon,
  Pending as PendingIcon
} from '@mui/icons-material';
import CreateOutlinedIcon from '@mui/icons-material/CreateOutlined';
import DeleteOutlinedIcon from '@mui/icons-material/DeleteOutlined';
import { useNavigate } from 'react-router-dom';
import type { Expense } from '../../types/Expense';
import { useAuth } from '../../context/Authentication/useAuth';
import { toast } from 'react-toastify';
import expenseService from '../../services/expenseService';

interface ExpenseCardProps {
  expense: Expense;
  setExpenseFormOpen: (open: boolean) => void;
  refresh: () => void;
  setEditingExpense: React.Dispatch<React.SetStateAction<Expense | null>>;
}

const ExpenseCard: React.FC<ExpenseCardProps> = ({ expense, setExpenseFormOpen, refresh, setEditingExpense }) => {
  const navigate = useNavigate();
  const { user, jwtToken } = useAuth();
  
  // Find current user's split
  const userSplit = expense.splits.find(s => s.userId === user?.userId);
  const userOwes = userSplit && !userSplit.isSettled && userSplit.shareAmount > 0;
  const userGetsBack = expense.paidByUserId === user?.userId && 
    expense.splits.some(s => !s.isSettled && s.userId !== user?.userId);
  const [deleteDialogOpen, setDeleteDialogOpen] = React.useState(false);

  const handleDelete = async () => {
    try {
      await expenseService.deleteExpense(expense.expenseId, jwtToken!, user!.email);
      toast.success("Expense deleted successfully");
    } catch (error) {
      console.error('Delete failed:', error);
      toast.error("Failed to delete expense");
    } finally {
      setDeleteDialogOpen(false);
      refresh();
    }
  };

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

        <Box sx={{ textAlign: 'right',  display: 'flex', justifyContent: 'space-between', my:'auto' }}>
          <Box  sx={{ my: 'auto' }}>
            <Typography variant="h6" color="primary" sx={{ fontWeight: 600 }}>
            ${expense.amount.toFixed(2)}
          </Typography>
          {userSplit && (
            <Typography variant="body2" color="text.secondary">
              Your share: ${userSplit.shareAmount.toFixed(2)}
            </Typography>
          )}
          </Box>
          <Box display={'center'} alignItems={'center'} justifyContent={'center'} sx={{ ml: 1 }}>
            <Avatar sx={{ bgcolor: 'white', border: '1px solid #1976d2', mr:1, ":hover": { bgcolor: '#E6F8FF' } }} onClick={(e) => {e.stopPropagation(); setEditingExpense(expense); setExpenseFormOpen(true);}}><CreateOutlinedIcon fontSize='large' color='primary' sx={{mb: 0.5}} /></Avatar>
            <Avatar sx={{ bgcolor: 'white', border: '1px solid red', ":hover": { bgcolor: '#FFEAE6' } }} onClick={(e) => {e.stopPropagation(); setDeleteDialogOpen(true);}}><DeleteOutlinedIcon fontSize='large' color='error' /></Avatar>
          </Box>
        </Box>
      </Box>
      <Dialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <DialogContent>
            Do you want to delete this expense? This action cannot be undone.
        </DialogContent>
        <DialogActions>
          <Button onClick={(e) => {e.stopPropagation();setDeleteDialogOpen(false)}}>Cancel</Button>
          <Button onClick={(e) => {e.stopPropagation();handleDelete()}} color="error">Delete</Button>
        </DialogActions>
      </Dialog>
    </Paper>
  );
};

export default ExpenseCard;