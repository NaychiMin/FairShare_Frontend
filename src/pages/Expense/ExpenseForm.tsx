import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Chip,
  Box,
  Typography,
  Avatar,
  ListItemText,
  Checkbox,
  OutlinedInput,
  FormHelperText,
  InputAdornment
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import expenseService from '../../services/expenseService';
import { useAuth } from '../../context/Authentication/useAuth';
import type { CreateExpenseRequest } from '../../types/Expense';

interface Member {
  userId: string;
  name: string;
  email: string;
}

interface ExpenseFormProps {
  open: boolean;
  onClose: () => void;
  groupId: string;
  groupName: string;
  members: Member[];
  onExpenseCreated: () => void;
}

const ExpenseForm: React.FC<ExpenseFormProps> = ({
  open,
  onClose,
  groupId,
  groupName,
  members,
  onExpenseCreated
}) => {
  const { user, jwtToken } = useAuth();
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Form state
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState<number>(0);
  const [paidBy, setPaidBy] = useState<string>('');
  const [participants, setParticipants] = useState<string[]>([]);
  const [expenseDate, setExpenseDate] = useState<Date>(new Date());
  const [notes, setNotes] = useState('');

  // Set defaults when form opens
  useEffect(() => {
    if (open && members.length > 0) {
      // Set default paidBy to current user if they're a member
      if (user && members.some(m => m.userId === user.userId)) {
        setPaidBy(user.userId);
      } else if (members.length > 0) {
        setPaidBy(members[0].userId);
      }
      
      // Set default participants to all members
      setParticipants(members.map(m => m.userId));
    }
  }, [open, members, user]);

  // Reset form when closed
  useEffect(() => {
    if (!open) {
      setDescription('');
      setAmount(0);
      setPaidBy('');
      setParticipants([]);
      setExpenseDate(new Date());
      setNotes('');
      setErrors({});
    }
  }, [open]);

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!description.trim()) {
      newErrors.description = 'Description is required';
    }

    if (!amount || amount <= 0) {
      newErrors.amount = 'Amount must be greater than 0';
    }

    if (!paidBy) {
      newErrors.paidBy = 'Please select who paid';
    }

    if (participants.length === 0) {
      newErrors.participants = 'Select at least one participant';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    setLoading(true);
    try {
      const expenseData: CreateExpenseRequest = {
        groupId,
        paidByUserId: paidBy,
        amount,
        description,
        notes: notes || undefined,
        expenseDate: expenseDate.toISOString(),
        splitStrategy: 'EQUAL',
        participantUserIds: participants
      };

      await expenseService.createExpense(expenseData, jwtToken!, user!.email);
      onExpenseCreated();
      onClose();
    } catch (error) {
      console.error('Failed to create expense:', error);
      setErrors({ submit: 'Failed to create expense. Please try again.' });
    } finally {
      setLoading(false);
    }
  };

  const getMemberName = (userId: string) => {
    return members.find(m => m.userId === userId)?.name || 'Unknown';
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle sx={{ borderBottom: '1px solid', borderColor: 'grey.200', pb: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Typography variant="h6" sx={{ fontWeight: 600 }}>Add Expense</Typography>
          <Typography variant="body2" color="text.secondary" sx={{ ml: 1 }}>
            in {groupName}
          </Typography>
        </Box>
      </DialogTitle>

      <DialogContent sx={{ pt: 3 }}>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
          {/* Description */}
          <TextField
            label="Description"
            fullWidth
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            error={!!errors.description}
            helperText={errors.description}
            placeholder="Dinner, Movie tickets, etc."
            variant="outlined"
          />

          {/* Amount */}
          <TextField
            label="Amount"
            type="number"
            fullWidth
            value={amount || ''}
            onChange={(e) => setAmount(parseFloat(e.target.value))}
            error={!!errors.amount}
            helperText={errors.amount}
            InputProps={{
              startAdornment: <InputAdornment position="start">$</InputAdornment>,
            }}
          />

          {/* Paid By */}
          <FormControl fullWidth error={!!errors.paidBy}>
            <InputLabel>Paid by</InputLabel>
            <Select
              value={paidBy}
              onChange={(e) => setPaidBy(e.target.value)}
              label="Paid by"
            >
              {members.map((member) => (
                <MenuItem key={member.userId} value={member.userId}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Avatar sx={{ width: 24, height: 24, bgcolor: 'primary.light' }}>
                      {member.name.charAt(0)}
                    </Avatar>
                    <Typography>{member.name}</Typography>
                  </Box>
                </MenuItem>
              ))}
            </Select>
            {errors.paidBy && <FormHelperText>{errors.paidBy}</FormHelperText>}
          </FormControl>

          {/* Participants */}
          <FormControl fullWidth error={!!errors.participants}>
            <InputLabel>Split with</InputLabel>
            <Select
              multiple
              value={participants}
              onChange={(e) => setParticipants(typeof e.target.value === 'string' 
                ? e.target.value.split(',') 
                : e.target.value
              )}
              input={<OutlinedInput label="Split with" />}
              renderValue={(selected) => (
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                  {selected.map((value) => (
                    <Chip 
                      key={value} 
                      label={getMemberName(value)} 
                      size="small"
                      sx={{ bgcolor: 'primary.light', color: 'white' }}
                    />
                  ))}
                </Box>
              )}
            >
              {members.map((member) => (
                <MenuItem key={member.userId} value={member.userId}>
                  <Checkbox checked={participants.indexOf(member.userId) > -1} />
                  <ListItemText primary={member.name} secondary={member.email} />
                </MenuItem>
              ))}
            </Select>
            {errors.participants && <FormHelperText>{errors.participants}</FormHelperText>}
          </FormControl>

          {/* Date */}
          <LocalizationProvider dateAdapter={AdapterDateFns}>
            <DatePicker
              label="Expense Date"
              value={expenseDate}
              onChange={(newDate) => newDate && setExpenseDate(newDate)}
              slotProps={{ textField: { fullWidth: true } }}
            />
          </LocalizationProvider>

          {/* Notes (optional) */}
          <TextField
            label="Notes (optional)"
            fullWidth
            multiline
            rows={2}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Add any additional details..."
          />

          {errors.submit && (
            <Typography color="error" variant="body2" sx={{ mt: 1 }}>
              {errors.submit}
            </Typography>
          )}
        </Box>
      </DialogContent>

      <DialogActions sx={{ p: 3, borderTop: '1px solid', borderColor: 'grey.200' }}>
        <Button onClick={onClose} variant="outlined">
          Cancel
        </Button>
        <Button 
          onClick={handleSubmit} 
          variant="contained" 
          disabled={loading}
          sx={{ ml: 2 }}
        >
          {loading ? 'Creating...' : 'Add Expense'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ExpenseForm; {}