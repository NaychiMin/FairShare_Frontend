import React from 'react';
import {
  Paper,
  Box,
  Typography,
  Chip,
  Avatar,
  CircularProgress
} from '@mui/material';
import {
  Payment as PaymentIcon,
  ArrowForward as ArrowIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
} from '@mui/icons-material';
import { format } from 'date-fns';
import { useNavigate } from 'react-router-dom';

interface SettlementCardProps {
  settlement: {
    settlementId: string;
    fromUserId: string;
    fromUserName: string;
    toUserId: string;
    toUserName: string;
    amount: number;
    settlementDate: string;
    paymentMethod?: string;
    notes?: string;
    createdByName: string;
  };
  onEdit: (settlement: {
    settlementId: string;
    fromUserName: string;
    toUserName: string;
    amount: number;
    settlementDate: string;
    paymentMethod?: string;
    notes?: string;
  }) => void;
  onDelete: (settlementId: string) => void;
  currentUserId?: string;
  isDeleting?: boolean;  // Add this to show loading state
}

const SettlementCard: React.FC<SettlementCardProps> = ({
  settlement,
  onEdit,
  onDelete,
  currentUserId,
  isDeleting = false
}) => {
  const navigate = useNavigate();

  const handleCardClick = (e: React.MouseEvent) => {
    const target = e.target as HTMLElement;
    if (target.closest('.action-button')) return;
    navigate(`/settlements/${settlement.settlementId}`);
  };

  const handleEdit = (e: React.MouseEvent) => {
    e.stopPropagation();
    onEdit(settlement);
  };

  const handleDeleteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onDelete(settlement.settlementId);  // Just call parent, let parent handle dialog
  };

  const isUserPayer = currentUserId === settlement.fromUserId;
  const isUserReceiver = currentUserId === settlement.toUserId;

  return (
    <Paper
      elevation={0}
      onClick={handleCardClick}
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
        {/* Left section */}
        <Box sx={{ display: 'flex', gap: 2 }}>
          <Avatar sx={{ bgcolor: 'success.light' }}>
            <PaymentIcon />
          </Avatar>

          <Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
              <Typography variant="subtitle2" color="text.secondary">
                Payment:
              </Typography>
              <Chip
                avatar={<Avatar sx={{ width: 24, height: 24 }}>{settlement.fromUserName.charAt(0)}</Avatar>}
                label={settlement.fromUserName}
                size="small"
                variant="outlined"
              />
              <ArrowIcon fontSize="small" color="action" />
              <Chip
                avatar={<Avatar sx={{ width: 24, height: 24 }}>{settlement.toUserName.charAt(0)}</Avatar>}
                label={settlement.toUserName}
                size="small"
                variant="outlined"
              />
            </Box>

            <Typography variant="body2" color="text.secondary">
              {format(new Date(settlement.settlementDate), 'MMM d, yyyy')}
              {settlement.paymentMethod && ` • ${settlement.paymentMethod}`}
            </Typography>

            {settlement.notes && (
              <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5, fontStyle: 'italic' }}>
                Note: {settlement.notes}
              </Typography>
            )}

            <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: 'block' }}>
              Recorded by {settlement.createdByName}
            </Typography>
          </Box>
        </Box>

        {/* Right section - Amount and Action Buttons */}
        <Box sx={{ textAlign: 'right', display: 'flex', justifyContent: 'space-between', my: 'auto' }}>
          <Box sx={{ my: 'auto', mr: 2 }}>
            <Typography variant="h6" color="primary" sx={{ fontWeight: 600 }}>
              ${settlement.amount.toFixed(2)}
            </Typography>
            {isUserPayer && (
              <Typography variant="body2" color="error.main">
                You paid
              </Typography>
            )}
            {isUserReceiver && (
              <Typography variant="body2" color="success.main">
                You received
              </Typography>
            )}
          </Box>

          {/* Action Buttons */}
          <Box display="flex" alignItems="center" justifyContent="center" sx={{ ml: 1 }}>
            <Avatar
              className="action-button"
              sx={{
                bgcolor: 'white',
                border: '1px solid #1976d2',
                mr: 1,
                cursor: 'pointer',
                ":hover": { bgcolor: '#E6F8FF' }
              }}
              onClick={handleEdit}
            >
              <EditIcon fontSize="small" color="primary" />
            </Avatar>
            <Avatar
              className="action-button"
              sx={{
                bgcolor: 'white',
                border: '1px solid red',
                cursor: 'pointer',
                ":hover": { bgcolor: '#FFEAE6' }
              }}
              onClick={handleDeleteClick}
            >
              {isDeleting ? <CircularProgress size={16} color="error" /> : <DeleteIcon fontSize="small" color="error" />}
            </Avatar>
          </Box>
        </Box>
      </Box>
    </Paper>
  );
};

export default SettlementCard;