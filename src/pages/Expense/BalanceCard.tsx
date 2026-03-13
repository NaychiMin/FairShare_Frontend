import React, { useEffect, useState } from 'react';
import {
  Card,
  CardContent,
  Typography,
  Box,
  Chip,
  Avatar,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  CircularProgress,
  Alert
} from '@mui/material';
import {
  ArrowUpward as OweIcon,
  ArrowDownward as OwedIcon,
  AccountBalanceWallet as BalanceIcon
} from '@mui/icons-material';
import balanceService, { type GroupBalanceResponse } from '../../services/balanceService';
import { useAuth } from '../../context/Authentication/useAuth';

interface BalanceCardProps {
  groupId: string;
}

const BalanceCard: React.FC<BalanceCardProps> = ({ groupId }) => {
  const { user, jwtToken } = useAuth();
  const [balance, setBalance] = useState<GroupBalanceResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (groupId && user?.email) {
      fetchBalance();
    }
  }, [groupId, user]);

  const fetchBalance = async () => {
    try {
      setLoading(true);
      const data = await balanceService.getUserBalanceInGroup(groupId, jwtToken!, user!.email);
      setBalance(data);
    } catch (err) {
      console.error('Failed to fetch balance:', err);
      setError('Could not load balance information');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Card sx={{ mb: 3 }}>
        <CardContent sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
          <CircularProgress />
        </CardContent>
      </Card>
    );
  }

  if (error || !balance) {
    return (
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Alert severity="error">{error || 'Balance data unavailable'}</Alert>
        </CardContent>
      </Card>
    );
  }

  const isPositive = balance.netBalance > 0;
  const isNegative = balance.netBalance < 0;

  return (
    <Card sx={{ mb: 3 }}>
      <CardContent>
        {/* Header */}
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <BalanceIcon sx={{ mr: 1, color: 'primary.main' }} />
          <Typography variant="h6">Your Balance</Typography>
        </Box>

        {/* Net Balance */}
        <Box 
          sx={{ 
            p: 2, 
            bgcolor: isPositive ? 'success.light' : isNegative ? 'error.light' : 'grey.100',
            borderRadius: 2,
            mb: 2,
            textAlign: 'center'
          }}
        >
          <Typography variant="body2" color="text.secondary">
            Net Balance
          </Typography>
          <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
            ${Math.abs(balance.netBalance).toFixed(2)}
          </Typography>
          <Chip 
            label={isPositive ? 'You are owed' : isNegative ? 'You owe' : 'Settled up'}
            color={isPositive ? 'success' : isNegative ? 'error' : 'default'}
            size="small"
            sx={{ mt: 1 }}
          />
        </Box>

        {/* People who owe you */}
        {balance.owesYou.length > 0 && (
          <>
            <Typography variant="subtitle2" color="success.main" sx={{ mt: 2, mb: 1 }}>
              Owes You (${balance.owesYou.reduce((sum, b) => sum + b.amount, 0).toFixed(2)})
            </Typography>
            <List dense>
              {balance.owesYou.map((debtor) => (
                <ListItem key={debtor.userId}>
                  <ListItemAvatar>
                    <Avatar sx={{ bgcolor: 'success.light' }}>
                      <OwedIcon />
                    </Avatar>
                  </ListItemAvatar>
                  <ListItemText 
                    primary={debtor.name}
                    secondary={debtor.email}
                  />
                  <Typography variant="body2" color="success.main" fontWeight="bold">
                    +${debtor.amount.toFixed(2)}
                  </Typography>
                </ListItem>
              ))}
            </List>
          </>
        )}

        {/* People you owe */}
        {balance.youOwe.length > 0 && (
          <>
            <Typography variant="subtitle2" color="error.main" sx={{ mt: 2, mb: 1 }}>
              You Owe (${Math.abs(balance.youOwe.reduce((sum, b) => sum + b.amount, 0)).toFixed(2)})
            </Typography>
            <List dense>
              {balance.youOwe.map((creditor) => (
                <ListItem key={creditor.userId}>
                  <ListItemAvatar>
                    <Avatar sx={{ bgcolor: 'error.light' }}>
                      <OweIcon />
                    </Avatar>
                  </ListItemAvatar>
                  <ListItemText 
                    primary={creditor.name}
                    secondary={creditor.email}
                  />
                  <Typography variant="body2" color="error.main" fontWeight="bold">
                    ${Math.abs(creditor.amount).toFixed(2)}
                  </Typography>
                </ListItem>
              ))}
            </List>
          </>
        )}

        {/* All settled up */}
        {balance.owesYou.length === 0 && balance.youOwe.length === 0 && (
          <Box sx={{ textAlign: 'center', py: 2 }}>
            <Typography color="text.secondary">
              All settled up! No outstanding balances.
            </Typography>
          </Box>
        )}
      </CardContent>
    </Card>
  );
};

export default BalanceCard;