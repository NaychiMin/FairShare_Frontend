import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Container,
  Typography,
  Box,
  Paper,
  Button,
  Chip,
  Avatar,
  Tabs,
  Tab,
  Skeleton,
  Alert,
  IconButton,
  Menu,
  MenuItem,
  Divider
} from '@mui/material';
import {
  ArrowBack as BackIcon,
  Add as AddIcon,
  MoreVert as MoreIcon,
  People as PeopleIcon,
  Receipt as ReceiptIcon,
  Payment as PaymentIcon,
  Settings as SettingsIcon
} from '@mui/icons-material';
import groupService from '../../services/groupService';
import expenseService from '../../services/expenseService';
import settlementService from '../../services/settlementService';
import ExpenseCard from '../Expense/ExpenseCard';
import ExpenseForm from '../Expense/ExpenseForm';
import SettlementForm from '../Expense/SettlementForm'; 
import SettlementCard from '../Expense/SettlementCard'; 
import { useAuth } from '../../context/Authentication/useAuth';
import BalanceCard from '../Expense/BalanceCard';

interface Group {
  groupId: string;
  groupName: string;
  category: string;
  status: string;
}

interface Member {
  userId: string;
  name: string;
  email: string;
  role?: string;
}

interface Settlement {
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
}

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`group-tabpanel-${index}`}
      aria-labelledby={`group-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ py: 3 }}>{children}</Box>}
    </div>
  );
}

const GroupDetailsPage: React.FC = () => {
  const { groupId } = useParams<{ groupId: string }>();
  const navigate = useNavigate();
  const { user, jwtToken } = useAuth();
  
  const [group, setGroup] = useState<Group | null>(null);
  const [members, setMembers] = useState<Member[]>([]);
  const [expenses, setExpenses] = useState<any[]>([]);
  const [settlements, setSettlements] = useState<Settlement[]>([]); // Add this
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [tabValue, setTabValue] = useState(0);
  const [expenseFormOpen, setExpenseFormOpen] = useState(false);
  const [settlementFormOpen, setSettlementFormOpen] = useState(false); 
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  const fetchGroupDetails = async () => {
    try {
      const data = await groupService.getGroupById(groupId!, jwtToken!, user!.email);
      setGroup(data);
    } catch (err) {
      console.error('Failed to fetch group:', err);
      setError('Failed to load group details');
    }
  };

  const fetchGroupMembers = async () => {
    try {
      const data = await groupService.getGroupMembers(groupId!, jwtToken!, user!.email);
      setMembers(data);
    } catch (err) {
      console.error('Failed to fetch members:', err);
    }
  };

  const fetchGroupExpenses = async () => {
    try {
      const data = await expenseService.getGroupExpenses(groupId!, jwtToken!, user!.email);
      setExpenses(data);
    } catch (err) {
      console.error('Failed to fetch expenses:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchSettlements = async () => {
    try {
      const data = await settlementService.getGroupSettlements(groupId!, jwtToken!, user!.email);
      setSettlements(data);
    } catch (err) {
      console.error('Failed to fetch settlements:', err);
    }
  };

  useEffect(() => {
    if (groupId && user?.email) {
      fetchGroupDetails();
      fetchGroupExpenses();
      fetchGroupMembers();
      fetchSettlements(); 
    }
  }, [groupId, user]);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleExpenseCreated = () => {
    fetchGroupExpenses();
    setExpenseFormOpen(false);
  };

  // Add this new function
  const handleSettlementCreated = () => {
    fetchSettlements();
    setSettlementFormOpen(false);
  };

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Skeleton variant="text" height={60} width="60%" />
        <Skeleton variant="rectangular" height={120} sx={{ my: 2 }} />
        <Skeleton variant="rectangular" height={400} />
      </Container>
    );
  }

  if (error || !group) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Alert severity="error">{error || 'Group not found'}</Alert>
        <Button startIcon={<BackIcon />} onClick={() => navigate('/groups')} sx={{ mt: 2 }}>
          Back to Groups
        </Button>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* Header */}
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
        <IconButton onClick={() => navigate('/groups')} sx={{ mr: 2 }}>
          <BackIcon />
        </IconButton>
        <Box sx={{ flex: 1 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Typography variant="h4" component="h1">
              {group.groupName}
            </Typography>
            <Chip 
              label={group.status} 
              color={group.status === 'Active' ? 'success' : 'default'}
              size="small"
            />
            <Chip 
              icon={<PeopleIcon />} 
              label={`${members.length} members`} 
              variant="outlined"
              size="small"
            />
          </Box>
          <Typography variant="body1" color="text.secondary" sx={{ mt: 1 }}>
            {group.category}
          </Typography>
        </Box>
        
        <Box sx={{ display: 'flex', gap: 2 }}>
          {/* Conditional button based on active tab */}
          {tabValue === 0 ? (
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => setExpenseFormOpen(true)}
            >
              Add Expense
            </Button>
          ) : tabValue === 2 ? (
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => setSettlementFormOpen(true)}
            >
              Record Settlement
            </Button>
          ) : null}
          
          <IconButton onClick={handleMenuOpen}>
            <MoreIcon />
          </IconButton>
          <Menu
            anchorEl={anchorEl}
            open={Boolean(anchorEl)}
            onClose={handleMenuClose}
          >
            <MenuItem onClick={() => { handleMenuClose(); navigate(`/groups/edit/${groupId}`); }}>
              <SettingsIcon sx={{ mr: 1 }} /> Edit Group
            </MenuItem>
            <MenuItem onClick={handleMenuClose}>
              <PeopleIcon sx={{ mr: 1 }} /> Manage Members
            </MenuItem>
            <Divider />
            <MenuItem onClick={handleMenuClose} sx={{ color: 'error.main' }}>
              Archive Group
            </MenuItem>
          </Menu>
        </Box>
      </Box>

      <Box sx={{ mb: 3 }}>
        <BalanceCard groupId={groupId!} />
      </Box>

      {/* Tabs */}
      <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
        <Tabs value={tabValue} onChange={handleTabChange}>
          <Tab label="Expenses" icon={<ReceiptIcon />} iconPosition="start" />
          <Tab label="Members" icon={<PeopleIcon />} iconPosition="start" />
          <Tab label="Settlements" icon={<PaymentIcon />} iconPosition="start" />
        </Tabs>
      </Box>

      {/* Expenses Tab */}
      <TabPanel value={tabValue} index={0}>
        {expenses.length > 0 ? (
          <Box>
            {expenses.map((expense) => (
              <ExpenseCard key={expense.expenseId} expense={expense} />
            ))}
          </Box>
        ) : (
          <Paper 
            sx={{ 
              p: 6, 
              textAlign: 'center',
              bgcolor: 'grey.50',
              borderRadius: 2
            }}
          >
            <ReceiptIcon sx={{ fontSize: 60, color: 'grey.400', mb: 2 }} />
            <Typography variant="h6" color="text.secondary" gutterBottom>
              No expenses yet
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              Click the "Add Expense" button to track your first shared expense
            </Typography>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => setExpenseFormOpen(true)}
            >
              Add Your First Expense
            </Button>
          </Paper>
        )}
      </TabPanel>

      {/* Members Tab */}
      <TabPanel value={tabValue} index={1}>
        <Paper sx={{ p: 2 }}>
          <Typography variant="h6" gutterBottom>
            Group Members
          </Typography>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            {members.map((member) => (
              <Box
                key={member.userId}
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  p: 2,
                  borderRadius: 1,
                  '&:hover': { bgcolor: 'grey.50' }
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <Avatar>{member.name?.charAt(0) || '?'}</Avatar>
                  <Box>
                    <Typography variant="subtitle1">{member.name || 'Unknown'}</Typography>
                    <Typography variant="body2" color="text.secondary">
                      {member.email}
                    </Typography>
                  </Box>
                </Box>
                <Chip 
                  label={member.role || 'Member'} 
                  size="small"
                  variant="outlined"
                />
              </Box>
            ))}
          </Box>
        </Paper>
      </TabPanel>

      {/* Settlements Tab */}
      <TabPanel value={tabValue} index={2}>
        {settlements.length > 0 ? (
          <Box>
            {settlements.map((settlement) => (
              <SettlementCard key={settlement.settlementId} settlement={settlement} />
            ))}
          </Box>
        ) : (
          <Paper 
            sx={{ 
              p: 6, 
              textAlign: 'center',
              bgcolor: 'grey.50',
              borderRadius: 2
            }}
          >
            <PaymentIcon sx={{ fontSize: 60, color: 'grey.400', mb: 2 }} />
            <Typography variant="h6" color="text.secondary" gutterBottom>
              No settlements yet
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              Record payments between members to settle debts
            </Typography>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => setSettlementFormOpen(true)}
            >
              Record Your First Settlement
            </Button>
          </Paper>
        )}
      </TabPanel>

      {/* Expense Form Modal */}
      {groupId && (
        <ExpenseForm
          open={expenseFormOpen}
          onClose={() => setExpenseFormOpen(false)}
          groupId={groupId}
          groupName={group.groupName}
          members={members}
          onExpenseCreated={handleExpenseCreated}
        />
      )}

      {/* Settlement Form Modal */}
      {groupId && (
        <SettlementForm
          open={settlementFormOpen}
          onClose={() => setSettlementFormOpen(false)}
          groupId={groupId}
          groupName={group.groupName}
          members={members}
          onSettlementCreated={handleSettlementCreated}
        />
      )}
    </Container>
  );
};

export default GroupDetailsPage;