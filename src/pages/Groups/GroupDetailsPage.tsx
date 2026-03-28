import React, { useEffect, useMemo, useState } from 'react';
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
  Tooltip
  Menu,
  MenuItem,
  Divider,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle
} from '@mui/material';
import {
  ArrowBack as BackIcon,
  Add as AddIcon,
  People as PeopleIcon,
  Receipt as ReceiptIcon,
  AdminPanelSettings as AdminPanelSettingsIcon,
  ShieldOutlined as ShieldOutlinedIcon
  ExitToApp as TimeToLeaveIcon,
  MoreVert as MoreIcon,
  People as PeopleIcon,
  Receipt as ReceiptIcon,
  Payment as PaymentIcon,
  Settings as SettingsIcon
} from '@mui/icons-material';
import { toast } from 'react-toastify';
import groupService from '../../services/groupService';
import expenseService from '../../services/expenseService';
import settlementService from '../../services/settlementService';
import ExpenseCard from '../Expense/ExpenseCard';
import ExpenseForm from '../Expense/ExpenseForm';
import SettlementForm from '../Expense/SettlementForm'; 
import SettlementCard from '../Expense/SettlementCard'; 
import { useAuth } from '../../context/Authentication/useAuth';
import BalanceCard from '../Expense/BalanceCard';
import { toast } from 'react-toastify';

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
  roleName?: string;
  membershipStatus?: string;
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
  const [settlements, setSettlements] = useState<Settlement[]>([]); 
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [tabValue, setTabValue] = useState(0);
  const [expenseFormOpen, setExpenseFormOpen] = useState(false);
  const [settlementFormOpen, setSettlementFormOpen] = useState(false);
    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
    const [editingExpense, setEditingExpense] = useState<any>(null);
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [selectedSettlementId, setSelectedSettlementId] = useState<string | null>(null);

  useEffect(() => {
    if (groupId && jwtToken && user?.email) {
      fetchAll();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [groupId, jwtToken, user?.email]);

  const fetchAll = async () => {
    setLoading(true);
    try {
      await Promise.all([
        fetchGroupDetails(),
        fetchGroupExpenses(),
        fetchGroupMembers()
      ]);
    } finally {
      setLoading(false);
    }
  };

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
      toast.error((err as any).response?.data?.message || 'Failed to load members');
    }
  };

  const fetchGroupExpenses = async () => {
    try {
      const data = await expenseService.getGroupExpenses(groupId!, jwtToken!, user!.email);
      setExpenses(data);
    } catch (err) {
      console.error('Failed to fetch expenses:', err);
    }
  };


  //const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {

  const leaveGroup = async () => {
    try {
      await groupService.leaveGroup(groupId!, jwtToken!, user!.email);
      toast.success("Left group successfully");
      navigate('/groups')
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

  const handleDeleteSettlement = async (settlementId: string) => {
    try {
      await settlementService.deleteSettlement(settlementId, jwtToken!, user!.email);
      fetchSettlements(); 
      setDeleteDialogOpen(false);
    } catch (err) {
      console.error('Failed to delete settlement:', err);
      alert('Failed to delete settlement');
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

  const normalizedMembers = useMemo(() => {
    return members.map((member) => ({
      ...member,
      effectiveRole: member.roleName || member.role || 'GROUP_MEMBER'
    }));
  }, [members]);

  const currentUserMembership = useMemo(() => {
    return normalizedMembers.find((m) => m.email === user?.email);
  }, [normalizedMembers, user?.email]);

  const isCurrentUserAdmin = currentUserMembership?.effectiveRole === 'GROUP_ADMIN';

  const handleAssignAdmin = async (member: Member & { effectiveRole?: string }) => {
    if (!groupId || !jwtToken || !user?.email) return;

    try {
      await groupService.assignAdmin(groupId, member.userId, jwtToken, user.email);
      toast.success(`Admin privileges assigned to ${member.name}`);
      fetchGroupMembers();
    } catch (err) {
      toast.error((err as any).response?.data?.message || 'Failed to assign admin privileges');
    }
  };

  const handleRevokeAdmin = async (member: Member & { effectiveRole?: string }) => {
    if (!groupId || !jwtToken || !user?.email) return;

    try {
      await groupService.revokeAdmin(groupId, member.userId, jwtToken, user.email);
      toast.success(`Admin privileges revoked for ${member.name}`);
      fetchGroupMembers();
    } catch (err) {
      toast.error((err as any).response?.data?.message || 'Failed to revoke admin privileges');
    }
  };

  // Add this new function
  const handleSettlementCreated = () => {
    fetchSettlements();
    setSettlementFormOpen(false);
  };

  const totalShareAmount = expenses.reduce((sum, expense) => {
  const userSplit = expense.splits.find((s: any) => s.userId === user?.userId);
    return sum + (userSplit?.shareamount || 0);
  }, 0);


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
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
        <IconButton onClick={() => navigate('/groups')} sx={{ mr: 2 }}>
          <BackIcon />
        </IconButton>

        <Box sx={{ flex: 1 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'wrap' }}>
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

      <TabPanel value={tabValue} index={0}>
        {expenses.length > 0 ? (
          <>
            <Box>
              {expenses.map((expense) => (
                <ExpenseCard key={expense.expenseId} expense={expense} setExpenseFormOpen={setExpenseFormOpen} setEditingExpense={setEditingExpense} />
              ))}
            </Box>
            {totalShareAmount == 0 && <Button
              variant="contained"
              color='error'
              startIcon={<TimeToLeaveIcon />}
              onClick={() => leaveGroup()}
            >
              Leave Group
            </Button>}
          </>
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

      <TabPanel value={tabValue} index={1}>
        <Paper sx={{ p: 3, borderRadius: 3, boxShadow: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
            <Typography variant="h6" fontWeight={700}>
              Group Members
            </Typography>

            {isCurrentUserAdmin && (
              <Chip
                label="You are an admin"
                color="primary"
                size="small"
                variant="outlined"
              />
            )}
          </Box>

          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            {normalizedMembers.map((member) => {
              const isMemberAdmin = member.effectiveRole === 'GROUP_ADMIN';
              const isSelf = member.email === user?.email;

              return (
                <Box
                  key={member.userId}
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    p: 2,
                    borderRadius: 2,
                    border: '1px solid',
                    borderColor: 'grey.200',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
                    '&:hover': { bgcolor: 'grey.50' }
                  }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Avatar>{member.name?.charAt(0) || '?'}</Avatar>

                    <Box>
                      <Typography variant="subtitle1" fontWeight={700}>
                        {member.name || 'Unknown'}
                      </Typography>

                      <Typography variant="body2" color="text.secondary">
                        {member.email}
                      </Typography>
                    </Box>
                  </Box>

                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                    <Chip
                      label={isMemberAdmin ? 'GROUP_ADMIN' : 'GROUP_MEMBER'}
                      size="small"
                      color={isMemberAdmin ? 'primary' : 'default'}
                      variant={isMemberAdmin ? 'filled' : 'outlined'}
                    />

                    {isCurrentUserAdmin && !isSelf && (
                      <>
                        {!isMemberAdmin && (
                          <Tooltip title="Assign admin privileges">
                            <IconButton
                              onClick={() => handleAssignAdmin(member)}
                              sx={{
                                border: '1px solid',
                                borderColor: 'primary.main',
                                borderRadius: '10px',
                                color: 'primary.main',
                                '&:hover': {
                                  backgroundColor: 'primary.main',
                                  color: 'white'
                                }
                              }}
                            >
                              <AdminPanelSettingsIcon />
                            </IconButton>
                          </Tooltip>
                        )}

                        {isMemberAdmin && (
                          <Tooltip title="Revoke admin privileges">
                            <IconButton
                              onClick={() => handleRevokeAdmin(member)}
                              sx={{
                                border: '1px solid',
                                borderColor: 'warning.main',
                                borderRadius: '10px',
                                color: 'warning.main',
                                '&:hover': {
                                  backgroundColor: 'warning.main',
                                  color: 'white'
                                }
                              }}
                            >
                              <ShieldOutlinedIcon />
                            </IconButton>
                          </Tooltip>
                        )}
                      </>
                    )}
                  </Box>
                </Box>
              );
            })}
          </Box>
        </Paper>
      </TabPanel>

      <TabPanel value={tabValue} index={2}>
        {settlements.length > 0 ? (
          <Box>
            {settlements.map((settlement) => (
              <SettlementCard 
                key={settlement.settlementId} 
                settlement={settlement}
                onDelete={(settlementId: string) => {
                  setSelectedSettlementId(settlementId);
                  setDeleteDialogOpen(true);
                }}
              />
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

      {groupId && (
        <ExpenseForm
          open={expenseFormOpen}
          onClose={() => {setExpenseFormOpen(false); setEditingExpense(null);}}
          groupId={groupId}
          groupName={group.groupName}
          members={members}
          expenseToEdit={editingExpense}
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

      {/* Settlement Delete Dialogue */}
      <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
        <DialogTitle>Delete Settlement</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete this settlement? This action cannot be undone.
            The balance will be restored to its previous state.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
          <Button 
            onClick={() => handleDeleteSettlement(selectedSettlementId!)} 
            color="error"
            variant="contained"
          >
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default GroupDetailsPage;