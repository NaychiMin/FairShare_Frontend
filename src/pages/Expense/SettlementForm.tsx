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
  Box,
  Typography,
  Avatar,
  InputAdornment,
  Alert
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import settlementService from '../../services/settlementService';
import { useAuth } from '../../context/Authentication/useAuth';

interface Member {
  userId: string;
  name: string;
  email: string;
}

interface SettlementFormProps {
  open: boolean;
  onClose: () => void;
  groupId: string;
  groupName: string;
  members: Member[];
  onSettlementCreated: () => void;
  initialPayer?: string; 
  initialReceiver?: string; 
}

const SettlementForm: React.FC<SettlementFormProps> = ({
  open,
  onClose,
  groupId,
  groupName,
  members,
  onSettlementCreated,
  initialPayer,
  initialReceiver
}) => {
  const { user, jwtToken } = useAuth();
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const [fromUser, setFromUser] = useState<string>(initialPayer || '');
  const [toUser, setToUser] = useState<string>(initialReceiver || '');
  const [amount, setAmount] = useState<number>(0);
  const [settlementDate, setSettlementDate] = useState<Date>(new Date());
  const [paymentMethod, setPaymentMethod] = useState<string>('');
  const [notes, setNotes] = useState<string>('');

  // Reset form when opened
  useEffect(() => {
    if (open) {
      setFromUser(initialPayer || '');
      setToUser(initialReceiver || '');
      setAmount(0);
      setSettlementDate(new Date());
      setPaymentMethod('');
      setNotes('');
      setErrors({});
    }
  }, [open, initialPayer, initialReceiver]);

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!fromUser) {
      newErrors.fromUser = 'Select who is paying';
    }
    if (!toUser) {
      newErrors.toUser = 'Select who is receiving';
    }
    if (fromUser && toUser && fromUser === toUser) {
      newErrors.toUser = 'Payer and receiver cannot be the same person';
    }
    if (!amount || amount <= 0) {
      newErrors.amount = 'Amount must be greater than 0';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    setLoading(true);
    try {
      const settlementData = {
        groupId,
        fromUserId: fromUser,
        toUserId: toUser,
        amount,
        settlementDate: settlementDate.toISOString(),
        paymentMethod: paymentMethod || undefined,
        notes: notes || undefined
      };

      await settlementService.createSettlement(settlementData, jwtToken!, user!.email);
      onSettlementCreated();
      onClose();
    } catch (error: unknown) {
      console.error('Failed to create settlement:', error);
      let errorMessage = 'Failed to create settlement';
  
      if (error && typeof error === 'object' && 'response' in error) {
        const axiosError = error as { response?: { data?: { message?: string } } };
        errorMessage = axiosError.response?.data?.message || errorMessage;
      }
      
      setErrors({ submit: errorMessage });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        <Typography variant="h6">Record Settlement</Typography>
        <Typography variant="body2" color="text.secondary">
          in {groupName}
        </Typography>
      </DialogTitle>

      <DialogContent dividers>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, pt: 1 }}>
          
          {/* From (Payer) */}
          <FormControl fullWidth error={!!errors.fromUser}>
            <InputLabel>Who is paying?</InputLabel>
            <Select
              value={fromUser}
              onChange={(e) => setFromUser(e.target.value)}
              label="Who is paying?"
            >
              {members.map((member) => (
                <MenuItem key={member.userId} value={member.userId}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Avatar sx={{ width: 24, height: 24 }}>
                      {member.name.charAt(0)}
                    </Avatar>
                    <Typography>{member.name}</Typography>
                  </Box>
                </MenuItem>
              ))}
            </Select>
            {errors.fromUser && <Typography color="error" variant="caption">{errors.fromUser}</Typography>}
          </FormControl>

          {/* To (Receiver) */}
          <FormControl fullWidth error={!!errors.toUser}>
            <InputLabel>Who is receiving?</InputLabel>
            <Select
              value={toUser}
              onChange={(e) => setToUser(e.target.value)}
              label="Who is receiving?"
            >
              {members.map((member) => (
                <MenuItem key={member.userId} value={member.userId}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Avatar sx={{ width: 24, height: 24 }}>
                      {member.name.charAt(0)}
                    </Avatar>
                    <Typography>{member.name}</Typography>
                  </Box>
                </MenuItem>
              ))}
            </Select>
            {errors.toUser && <Typography color="error" variant="caption">{errors.toUser}</Typography>}
          </FormControl>

          {/* Amount */}
          <TextField
            label="Amount"
            type="number"
            fullWidth
            value={amount || ''}
            onChange={(e) => setAmount(Number.parseFloat(e.target.value))}
            error={!!errors.amount}
            helperText={errors.amount}
            InputProps={{
              startAdornment: <InputAdornment position="start">$</InputAdornment>,
            }}
          />

          {/* Date */}
          <LocalizationProvider dateAdapter={AdapterDateFns}>
            <DatePicker
              label="Settlement Date"
              value={settlementDate}
              onChange={(newDate) => newDate && setSettlementDate(newDate)}
              slotProps={{ textField: { fullWidth: true } }}
            />
          </LocalizationProvider>

          {/* Payment Method (optional) */}
          <TextField
            label="Payment Method (optional)"
            fullWidth
            value={paymentMethod}
            onChange={(e) => setPaymentMethod(e.target.value)}
            placeholder="e.g., Cash, Bank Transfer, PayNow"
          />

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
            <Alert severity="error">{errors.submit}</Alert>
          )}
        </Box>
      </DialogContent>

      <DialogActions sx={{ p: 2 }}>
        <Button onClick={onClose}>Cancel</Button>
        <Button 
          onClick={handleSubmit} 
          variant="contained" 
          disabled={loading}
        >
          {loading ? 'Recording...' : 'Record Settlement'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default SettlementForm;