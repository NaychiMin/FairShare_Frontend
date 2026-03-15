import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Container,
  Typography,
  Box,
  Paper,
  Chip,
  Avatar,
  Divider,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Button,
  Skeleton,
  Alert,
  IconButton
} from '@mui/material';
import {
  ArrowBack as BackIcon,
  CheckCircle as PaidIcon,
  RadioButtonUnchecked as UnpaidIcon
} from '@mui/icons-material';
import expenseService from '../../services/expenseService';
import type { Expense } from '../../types/Expense';
import { useAuth } from '../../context/Authentication/useAuth';

const ExpenseDetails: React.FC = () => {
  const { expenseId } = useParams<{ expenseId: string }>();
  const navigate = useNavigate();
  const { jwtToken } = useAuth();
  const { user } = useAuth(); 
  const [expense, setExpense] = useState<Expense | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (expenseId && jwtToken && user) {
      fetchExpenseDetails();
    }
  }, [expenseId, jwtToken]);

  const fetchExpenseDetails = async () => {
    try {
      setLoading(true);
      const data = await expenseService.getExpenseById(expenseId!, jwtToken!, user!.email);
      setExpense(data);
    } catch (err) {
      setError('Failed to load expense details');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Container maxWidth="md" sx={{ py: 4 }}>
        <Skeleton variant="text" height={60} />
        <Skeleton variant="rectangular" height={200} sx={{ my: 2 }} />
        <Skeleton variant="rectangular" height={300} />
      </Container>
    );
  }

  if (error || !expense) {
    return (
      <Container maxWidth="md" sx={{ py: 4 }}>
        <Alert severity="error">{error || 'Expense not found'}</Alert>
        <Button startIcon={<BackIcon />} onClick={() => navigate(-1)} sx={{ mt: 2 }}>
          Go Back
        </Button>
      </Container>
    );
  }

  const totalPaid = expense.splits.reduce((sum, split) => sum + split.settledAmount, 0);
  const remainingAmount = expense.amount - totalPaid;

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      {/* Header with back button */}
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
        <IconButton onClick={() => navigate(-1)} sx={{ mr: 2 }}>
          <BackIcon />
        </IconButton>
        <Typography variant="h5" component="h1" sx={{ fontWeight: 600 }}>
          Expense Details
        </Typography>
      </Box>

      {/* Main expense card */}
      <Paper sx={{ p: 4, borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 3 }}>
          <Box>
            <Typography variant="h4" gutterBottom sx={{ fontWeight: 600 }}>
              {expense.description}
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Added by {expense.createdByName} on {new Date(expense.createdAt).toLocaleDateString()}
            </Typography>
          </Box>
          <Chip 
            label={expense.isSettled ? 'Settled' : 'Pending'} 
            color={expense.isSettled ? 'success' : 'warning'}
            sx={{ fontWeight: 500 }}
          />
        </Box>

        <Divider sx={{ my: 3 }} />

        {/* Amount and payment info */}
        <Box sx={{ display: 'flex', gap: 4, mb: 4 }}>
          <Box>
            <Typography variant="body2" color="text.secondary">Total Amount</Typography>
            <Typography variant="h3" color="primary" sx={{ fontWeight: 700 }}>
              ${expense.amount.toFixed(2)}
            </Typography>
          </Box>
          <Box>
            <Typography variant="body2" color="text.secondary">Paid By</Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 1 }}>
              <Avatar sx={{ bgcolor: 'secondary.light' }}>
                {expense.paidByName.charAt(0)}
              </Avatar>
              <Typography variant="h6">{expense.paidByName}</Typography>
            </Box>
          </Box>
          <Box>
            <Typography variant="body2" color="text.secondary">Split Strategy</Typography>
            <Chip label={expense.splitStrategy} sx={{ mt: 1 }} />
          </Box>
        </Box>

        {/* Notes if any */}
        {expense.notes && (
          <Box sx={{ mb: 3 }}>
            <Typography variant="body2" color="text.secondary">Notes</Typography>
            <Paper variant="outlined" sx={{ p: 2, bgcolor: 'grey.50', mt: 1 }}>
              <Typography>{expense.notes}</Typography>
            </Paper>
          </Box>
        )}

        <Divider sx={{ my: 3 }} />

        {/* Splits list */}
        <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
          Splits
        </Typography>
        <List>
          {expense.splits.map((split) => (
            <ListItem
              key={split.splitId}
              sx={{
                px: 0,
                borderBottom: '1px solid',
                borderColor: 'grey.100',
                '&:last-child': { borderBottom: 'none' }
              }}
              secondaryAction={
                <Box sx={{ textAlign: 'right' }}>
                  <Typography variant="body1" fontWeight="bold">
                    ${split.shareAmount.toFixed(2)}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Paid: ${split.settledAmount.toFixed(2)}
                  </Typography>
                </Box>
              }
            >
              <ListItemAvatar>
                <Avatar sx={{ bgcolor: 'primary.light' }}>
                  {split.userName.charAt(0)}
                </Avatar>
              </ListItemAvatar>
              <ListItemText
                primary={
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    {split.userName}
                    {split.isSettled ? (
                      <PaidIcon color="success" fontSize="small" />
                    ) : (
                      <UnpaidIcon color="action" fontSize="small" />
                    )}
                  </Box>
                }
                secondary={split.userEmail}
              />
            </ListItem>
          ))}
        </List>

        {/* Summary */}
        <Box sx={{ mt: 3, p: 2, bgcolor: 'grey.50', borderRadius: 1 }}>
          <Typography variant="body2" color="text.secondary">Summary</Typography>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 1 }}>
            <Typography>Total collected:</Typography>
            <Typography fontWeight="bold">${totalPaid.toFixed(2)}</Typography>
          </Box>
          <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
            <Typography>Remaining to collect:</Typography>
            <Typography fontWeight="bold" color={remainingAmount > 0 ? 'warning.main' : 'success.main'}>
              ${remainingAmount.toFixed(2)}
            </Typography>
          </Box>
        </Box>
      </Paper>
    </Container>
  );
};

export default ExpenseDetails;  {}