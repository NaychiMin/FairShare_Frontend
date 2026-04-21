import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Box,
  Typography,
  InputAdornment,
  Alert,
  CircularProgress
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import settlementService from '../../services/settlementService';
import { useAuth } from '../../context/Authentication/useAuth';

interface EditSettlementModalProps {
  open: boolean;
  onClose: () => void;
  settlement: {
    settlementId: string;
    fromUserName: string;
    toUserName: string;
    amount: number;
    settlementDate: string;
    paymentMethod?: string;
    notes?: string;
  } | null;
  onSettlementUpdated: () => void;
}

const EditSettlementModal: React.FC<EditSettlementModalProps> = ({
  open,
  onClose,
  settlement,
  onSettlementUpdated
}) => {
  const { user, jwtToken } = useAuth();
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  
  const [amount, setAmount] = useState<number>(0);
  const [settlementDate, setSettlementDate] = useState<Date>(new Date());
  const [paymentMethod, setPaymentMethod] = useState<string>('');
  const [notes, setNotes] = useState<string>('');

  useEffect(() => {
    if (open && settlement) {
      setAmount(settlement.amount);
      setSettlementDate(new Date(settlement.settlementDate));
      setPaymentMethod(settlement.paymentMethod || '');
      setNotes(settlement.notes || '');
      setErrors({});
    }
  }, [open, settlement]);

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!amount || amount <= 0) {
      newErrors.amount = 'Amount must be greater than 0';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm() || !settlement) return;

    setLoading(true);
    try {
      const editData = {
        amount,
        settlementDate: settlementDate.toISOString(),
        paymentMethod: paymentMethod || undefined,
        notes: notes || undefined
      };

      await settlementService.editSettlement(
        settlement.settlementId, 
        editData, 
        jwtToken!, 
        user!.email
      );
      onSettlementUpdated();
      onClose();
    } catch (error: unknown) {
        console.error('Failed to edit settlement:', error);
        const errorMessage = error instanceof Error 
            ? error.message 
            : (error as { response?: { data?: { message?: string } } })?.response?.data?.message 
            || 'Failed to edit settlement';
        setErrors({ submit: errorMessage });
    } finally {
      setLoading(false);
    }
  };

  if (!settlement) return null;

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        <Typography variant="h6">Edit Settlement</Typography>
        <Typography variant="body2" color="text.secondary">
          {settlement.fromUserName} → {settlement.toUserName}
        </Typography>
      </DialogTitle>

      <DialogContent dividers>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, pt: 1 }}>
          
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

          <LocalizationProvider dateAdapter={AdapterDateFns}>
            <DatePicker
              label="Settlement Date"
              value={settlementDate}
              onChange={(newDate) => newDate && setSettlementDate(newDate)}
              slotProps={{ textField: { fullWidth: true } }}
            />
          </LocalizationProvider>

          <TextField
            label="Payment Method (optional)"
            fullWidth
            value={paymentMethod}
            onChange={(e) => setPaymentMethod(e.target.value)}
            placeholder="e.g., Cash, Bank Transfer, PayNow"
          />

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
          {loading ? <CircularProgress size={24} /> : 'Save Changes'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default EditSettlementModal;