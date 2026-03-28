import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Container,
  Paper,
  Typography,
  Box,
  Chip,
  Avatar,
  Divider,
  Button,
  IconButton,
  Skeleton,
  Alert,
  Card,
  CardContent
} from '@mui/material';
import {
  ArrowBack as BackIcon,
  Payment as PaymentIcon,
  ArrowForward as ArrowIcon,
  Person as PersonIcon,
  CalendarToday as CalendarIcon,
  AttachMoney as MoneyIcon,
  CreditCard as CreditCardIcon,
  Notes as NotesIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
} from '@mui/icons-material';
import { format } from 'date-fns';
import settlementService from '../../services/settlementService';
import { useAuth } from '../../context/Authentication/useAuth';

const SettlementDetailsPage: React.FC = () => {
  const { settlementId } = useParams<{ settlementId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { jwtToken } = useAuth();
  const [settlement, setSettlement] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (settlementId && user?.email) {
      fetchSettlementDetails();
    }
  }, [settlementId, user]);

  const fetchSettlementDetails = async () => {
    try {
      setLoading(true);
      const data = await settlementService.getSettlementById(settlementId!, jwtToken!, user!.email);
      setSettlement(data);
    } catch (err) {
      console.error('Failed to fetch settlement:', err);
      setError('Could not load settlement details');
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

  if (error || !settlement) {
    return (
      <Container maxWidth="md" sx={{ py: 4 }}>
        <Alert severity="error">{error || 'Settlement not found'}</Alert>
        <Button startIcon={<BackIcon />} onClick={() => navigate(-1)} sx={{ mt: 2 }}>
          Go Back
        </Button>
      </Container>
    );
  }

  const isUserPayer = settlement.fromUserEmail === user?.email;
  const isUserReceiver = settlement.toUserEmail === user?.email;

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      {/* Header with back button */}
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
        <IconButton onClick={() => navigate(-1)} sx={{ mr: 2 }}>
          <BackIcon />
        </IconButton>
        <Typography variant="h5" sx={{ fontWeight: 600 }}>
          Settlement Details
        </Typography>
      </Box>

      {/* Main settlement card */}
      <Paper sx={{ p: 4, borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
        
        {/* Payment flow */}
        <Box sx={{ textAlign: 'center', mb: 4 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 3, mb: 2 }}>
            <Box sx={{ textAlign: 'center' }}>
              <Avatar sx={{ width: 56, height: 56, mb: 1, bgcolor: 'error.light', mx: 'auto' }}>
                <PersonIcon />
              </Avatar>
              <Typography variant="subtitle1" fontWeight="bold">{settlement.fromUserName}</Typography>
              <Typography variant="caption" color="text.secondary">Payer</Typography>
            </Box>
            
            <ArrowIcon sx={{ fontSize: 40, color: 'action.active' }} />
            
            <Box sx={{ textAlign: 'center' }}>
              <Avatar sx={{ width: 56, height: 56, mb: 1, bgcolor: 'success.light', mx: 'auto' }}>
                <PersonIcon />
              </Avatar>
              <Typography variant="subtitle1" fontWeight="bold">{settlement.toUserName}</Typography>
              <Typography variant="caption" color="text.secondary">Receiver</Typography>
            </Box>
          </Box>
          
          <Chip
            icon={<MoneyIcon />}
            label={`$${settlement.amount.toFixed(2)}`}
            color="primary"
            sx={{ fontSize: '1.2rem', p: 2 }}
          />
        </Box>

        <Divider sx={{ my: 3 }} />

        {/* Details Grid */}
        <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 3 }}>
          <Card variant="outlined">
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                <CalendarIcon color="action" fontSize="small" />
                <Typography variant="body2" color="text.secondary">Date</Typography>
              </Box>
              <Typography variant="body1">
                {format(new Date(settlement.settlementDate), 'EEEE, MMMM d, yyyy')}
              </Typography>
            </CardContent>
          </Card>

          {settlement.paymentMethod && (
            <Card variant="outlined">
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                  <CreditCardIcon color="action" fontSize="small" />
                  <Typography variant="body2" color="text.secondary">Payment Method</Typography>
                </Box>
                <Typography variant="body1">{settlement.paymentMethod}</Typography>
              </CardContent>
            </Card>
          )}

          <Card variant="outlined">
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                <PersonIcon color="action" fontSize="small" />
                <Typography variant="body2" color="text.secondary">Recorded By</Typography>
              </Box>
              <Typography variant="body1">{settlement.createdByName}</Typography>
              <Typography variant="caption" color="text.secondary">
                {format(new Date(settlement.createdAt), 'MMM d, yyyy h:mm a')}
              </Typography>
            </CardContent>
          </Card>

          <Card variant="outlined">
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                <PaymentIcon color="action" fontSize="small" />
                <Typography variant="body2" color="text.secondary">Status</Typography>
              </Box>
              <Chip
                label={isUserPayer ? 'You paid' : isUserReceiver ? 'You received' : 'Completed'}
                color={isUserPayer ? 'error' : isUserReceiver ? 'success' : 'default'}
                size="small"
              />
            </CardContent>
          </Card>
        </Box>

        {/* Notes */}
        {settlement.notes && (
          <>
            <Divider sx={{ my: 3 }} />
            <Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                <NotesIcon color="action" fontSize="small" />
                <Typography variant="body2" color="text.secondary">Notes</Typography>
              </Box>
              <Paper variant="outlined" sx={{ p: 2, bgcolor: 'grey.50' }}>
                <Typography>{settlement.notes}</Typography>
              </Paper>
            </Box>
          </>
        )}

        {/* Group info */}
        <Divider sx={{ my: 3 }} />
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Box>
            <Typography variant="body2" color="text.secondary">Group</Typography>
            <Typography variant="body1">{settlement.groupName}</Typography>
          </Box>
          <Button
            variant="outlined"
            onClick={() => navigate(`/groups/${settlement.groupId}`)}
          >
            View Group
          </Button>
        </Box>
      </Paper>
    </Container>
  );
};

export default SettlementDetailsPage;