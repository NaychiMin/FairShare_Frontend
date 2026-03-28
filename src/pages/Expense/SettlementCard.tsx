import React from 'react';
import {
  Paper,
  Box,
  Typography,
  Chip,
  Avatar,
  IconButton,
  Menu,
  MenuItem,
} from '@mui/material';
import {
  Payment as PaymentIcon,
  ArrowForward as ArrowIcon,
  MoreVert as MoreIcon,
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
  onEdit?: (settlementId: string) => void;
  onDelete?: (settlementId: string) => void;
  onClick?: (settlementId: string) => void; 
}

const SettlementCard: React.FC<SettlementCardProps> = ({ 
  settlement, 
  onEdit, 
  onDelete,
  onClick 
}) => {
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const navigate = useNavigate();

  const handleCardClick = (e: React.MouseEvent) => {
    if (e.target instanceof Element && e.target.closest('.MuiMenu-paper')) {
      return;
    }
    if (onClick) {
      onClick(settlement.settlementId);
    } else {
      navigate(`/settlements/${settlement.settlementId}`);
    }
  };

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    event.stopPropagation();
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  return (
    <Paper
      sx={{
        p: 2,
        mb: 2,
        backgroundColor: 'white',
        borderRadius: '12px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
        transition: 'all 0.2s ease',
        cursor: 'pointer',
        '&:hover': {
          boxShadow: '0 4px 14px rgba(0,0,0,0.12)',
          transform: 'translateY(-2px)',
        },
      }}
      onClick={handleCardClick}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flex: 1 }}>
          <Avatar sx={{ bgcolor: 'success.light' }}>
            <PaymentIcon />
          </Avatar>

          <Box sx={{ flex: 1 }}>
            {/* Payment flow: From & To */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
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
              <Chip
                label={`$${settlement.amount.toFixed(2)}`}
                color="primary"
                size="small"
                sx={{ ml: 1 }}
              />
            </Box>

            {/* Payment details */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Typography variant="body2" color="text.secondary">
                {format(new Date(settlement.settlementDate), 'MMM d, yyyy')}
              </Typography>
              {settlement.paymentMethod && (
                <>
                  <Typography variant="body2" color="text.secondary">•</Typography>
                  <Typography variant="body2" color="text.secondary">
                    {settlement.paymentMethod}
                  </Typography>
                </>
              )}
            </Box>

            {/* Notes if any */}
            {settlement.notes && (
              <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                Note: {settlement.notes}
              </Typography>
            )}

            {/* Recorded by */}
            <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
              Recorded by {settlement.createdByName}
            </Typography>
          </Box>
        </Box>

        {/* Actions menu (for edit/delete) */}
        {(onEdit || onDelete) && (
          <>
            <IconButton size="small" onClick={handleMenuOpen}>
              <MoreIcon />
            </IconButton>
            <Menu
              anchorEl={anchorEl}
              open={Boolean(anchorEl)}
              onClose={handleMenuClose}
            >
              {onEdit && (
                <MenuItem onClick={() => { handleMenuClose(); onEdit(settlement.settlementId); }}>
                  <EditIcon sx={{ mr: 1, fontSize: 18 }} /> Edit
                </MenuItem>
              )}
              {onDelete && (
                <MenuItem onClick={() => { handleMenuClose(); onDelete(settlement.settlementId); }} sx={{ color: 'error.main' }}>
                  <DeleteIcon sx={{ mr: 1, fontSize: 18 }} /> Delete
                </MenuItem>
              )}
            </Menu>
          </>
        )}
      </Box>
    </Paper>
  );
};

export default SettlementCard;