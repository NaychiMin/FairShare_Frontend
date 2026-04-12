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
  Tooltip,
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
  MoreVert as MoreIcon,
  People as PeopleIcon,
  Receipt as ReceiptIcon,
  Payment as PaymentIcon,
  Settings as SettingsIcon,
  AdminPanelSettings as AdminPanelSettingsIcon,
  ShieldOutlined as ShieldOutlinedIcon,
  ExitToApp as TimeToLeaveIcon
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
import type { Expense } from '../../types/Expense';
import EditSettlementModal from '../Expense/EditSettlementModal';

export interface Group {
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

interface GroupMemberActionStatus {
  userId: string;
  netBalance: number;
  canLeave: boolean;
  canRemove: boolean;
  warningMessage?: string | null;
}

interface ApiErrorResponse {
  response?: {
    data?: {
      message?: string;
    } | string;
  };
}

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

const getErrorMessage = (err: unknown, fallback: string): string => {
  if (err instanceof Error && err.message) {
    return err.message;
  }

  const apiError = err as ApiErrorResponse;
  const responseData = apiError.response?.data;

  if (typeof responseData === 'string') {
    return responseData;
  }

  return responseData?.message ?? fallback;
};

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
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [settlements, setSettlements] = useState<Settlement[]>([]);
  const [memberActionStatuses, setMemberActionStatuses] = useState<GroupMemberActionStatus[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [tabValue, setTabValue] = useState(0);
  const [expenseFormOpen, setExpenseFormOpen] = useState(false);
  const [settlementFormOpen, setSettlementFormOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedSettlementId, setSelectedSettlementId] = useState<string | null>(null);
  const [editSettlementModalOpen, setEditSettlementModalOpen] = useState(false);
  const [selectedSettlement, setSelectedSettlement] = useState<Settlement | null>(null);

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
        fetchGroupMembers(),
        fetchGroupMemberActionStatuses(),
        fetchSettlements()
      ]);
    } finally {
      setLoading(false);
    }
  };

  const fetchGroupDetails = async () => {
    try {
      const data = await groupService.getGroupById(groupId!, jwtToken!, user!.email) as Group;
      setGroup(data);
    } catch (err: unknown) {
      console.error('Failed to fetch group:', err);
      setError('Failed to load group details');
    }
  };

  const fetchGroupMembers = async () => {
    try {
      const data = await groupService.getGroupMembers(groupId!, jwtToken!, user!.email) as Member[];
      setMembers(data);
    } catch (err: unknown) {
      console.error('Failed to fetch members:', err);
      toast.error(getErrorMessage(err, 'Failed to load members'));
    }
  };

  const fetchGroupMemberActionStatuses = async () => {
    try {
      const data = await groupService.getGroupMemberActionStatus(
        groupId!,
        jwtToken!,
        user!.email
      ) as GroupMemberActionStatus[];
      setMemberActionStatuses(data);
    } catch (err: unknown) {
      console.error('Failed to fetch member action statuses:', err);
      toast.error(getErrorMessage(err, 'Failed to load member action statuses'));
    }
  };

  const fetchGroupExpenses = async () => {
    try {
      const data = await expenseService.getGroupExpenses(groupId!, jwtToken!, user!.email) as Expense[];
      setExpenses(data);
    } catch (err: unknown) {
      console.error('Failed to fetch expenses:', err);
    }
  };

  const fetchSettlements = async () => {
    try {
      const data = await settlementService.getGroupSettlements(
        groupId!,
        jwtToken!,
        user!.email
      ) as Settlement[];
      setSettlements(data);
    } catch (err: unknown) {
      console.error('Failed to fetch settlements:', err);
    }
  };

  const handleDeleteSettlement = async (settlementId: string) => {
    try {
      await settlementService.deleteSettlement(settlementId, jwtToken!, user!.email);
      await Promise.all([fetchSettlements(), fetchGroupMemberActionStatuses()]);
      setDeleteDialogOpen(false);
      setSelectedSettlementId(null);
      toast.success('Settlement deleted successfully');
    } catch (err: unknown) {
      console.error('Failed to delete settlement:', err);
      toast.error('Failed to delete settlement');
    }
  };

  const handleEditSettlement = (settlement: Settlement) => {
    setSelectedSettlement(settlement);
    setEditSettlementModalOpen(true);
  };

  const handleSettlementUpdated = async () => {
    await Promise.all([fetchSettlements(), fetchGroupMemberActionStatuses()]);
    setEditSettlementModalOpen(false);
    setSelectedSettlement(null);
  };

  const leaveGroup = async () => {
    if (!groupId || !jwtToken || !user?.email) return;

    try {
      await groupService.leaveGroup(groupId, jwtToken, user.email);
      toast.success('Left group successfully');
      navigate('/groups');
    } catch (err: unknown) {
      console.error('Failed to leave group:', err);
      toast.error(getErrorMessage(err, 'Failed to leave group'));
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveMember = async (member: Member & { effectiveRole?: string }) => {
    if (!groupId || !jwtToken || !user?.email) return;

    try {
      await groupService.removeGroupMember(groupId, member.userId, jwtToken, user.email);
      toast.success(`${member.name} removed successfully`);
      await Promise.all([fetchGroupMembers(), fetchGroupMemberActionStatuses()]);
    } catch (err: unknown) {
      toast.error(getErrorMessage(err, 'Failed to remove member'));
    }
  };

  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleExpenseCreated = async () => {
    await Promise.all([fetchGroupExpenses(), fetchGroupMemberActionStatuses()]);
    setExpenseFormOpen(false);
    setEditingExpense(null);
  };

  const handleSettlementCreated = async () => {
    await Promise.all([fetchSettlements(), fetchGroupMemberActionStatuses()]);
    setSettlementFormOpen(false);
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

  const currentUserActionStatus = useMemo(() => {
    return memberActionStatuses.find((status) => status.userId === user?.userId);
  }, [memberActionStatuses, user?.userId]);

  const getMemberActionStatus = (memberUserId: string) => {
    return memberActionStatuses.find((status) => status.userId === memberUserId);
  };

  const handleAssignAdmin = async (member: Member & { effectiveRole?: string }) => {
    if (!groupId || !jwtToken || !user?.email) return;

    try {
      await groupService.assignAdmin(groupId, member.userId, jwtToken, user.email);
      toast.success(`Admin privileges assigned to ${member.name}`);
      await Promise.all([fetchGroupMembers(), fetchGroupMemberActionStatuses()]);
    } catch (err: unknown) {
      toast.error(getErrorMessage(err, 'Failed to assign admin privileges'));
    }
  };

  const handleRevokeAdmin = async (member: Member & { effectiveRole?: string }) => {
    if (!groupId || !jwtToken || !user?.email) return;

    try {
      await groupService.revokeAdmin(groupId, member.userId, jwtToken, user.email);
      toast.success(`Admin privileges revoked for ${member.name}`);
      await Promise.all([fetchGroupMembers(), fetchGroupMemberActionStatuses()]);
    } catch (err: unknown) {
      toast.error(getErrorMessage(err, 'Failed to revoke admin privileges'));
    }
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

          <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={handleMenuClose}>
            <MenuItem
              onClick={() => {
                handleMenuClose();
                navigate(`/groups/edit/${groupId}`);
              }}
            >
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
                <ExpenseCard
                  key={expense.expenseId}
                  expense={expense}
                  setExpenseFormOpen={setExpenseFormOpen}
                  setEditingExpense={setEditingExpense}
                />
              ))}
            </Box>

            {currentUserActionStatus?.canLeave && (
              <Button
                variant="contained"
                color="error"
                startIcon={<TimeToLeaveIcon />}
                onClick={leaveGroup}
              >
                Leave Group
              </Button>
            )}

            {currentUserActionStatus && !currentUserActionStatus.canLeave && (
              <>
                <Tooltip title={currentUserActionStatus.warningMessage || 'You cannot leave this group yet'}>
                  <span>
                    <Button
                      variant="contained"
                      color="error"
                      startIcon={<TimeToLeaveIcon />}
                      disabled
                    >
                      Leave Group
                    </Button>
                  </span>
                </Tooltip>

                {currentUserActionStatus.warningMessage && (
                  <Typography variant="body2" color="error" sx={{ mt: 1 }}>
                    {currentUserActionStatus.warningMessage}
                  </Typography>
                )}
              </>
            )}
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
              const memberActionStatus = getMemberActionStatus(member.userId);

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

                      {memberActionStatus?.warningMessage &&
                        !memberActionStatus.canRemove &&
                        isCurrentUserAdmin &&
                        !isSelf && (
                          <Typography variant="caption" color="error" display="block" sx={{ mt: 0.5 }}>
                            {memberActionStatus.warningMessage}
                          </Typography>
                        )}
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

                        <Tooltip
                          title={
                            memberActionStatus?.canRemove
                              ? 'Remove member'
                              : memberActionStatus?.warningMessage || 'Cannot remove member'
                          }
                        >
                          <span>
                            <IconButton
                              onClick={() => handleRemoveMember(member)}
                              disabled={!memberActionStatus?.canRemove}
                              sx={{
                                border: '1px solid',
                                borderColor: 'error.main',
                                borderRadius: '10px',
                                color: 'error.main',
                                '&:hover': {
                                  backgroundColor: 'error.main',
                                  color: 'white'
                                }
                              }}
                            >
                              <TimeToLeaveIcon />
                            </IconButton>
                          </span>
                        </Tooltip>
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
            // In GroupDetailsPage.tsx, the SettlementCard usage:
            {settlements.map((settlement) => (
              <SettlementCard
                key={settlement.settlementId}
                settlement={settlement}
                onEdit={() => handleEditSettlement(settlement)}
                onDelete={(settlementId: string) => {
                  setSelectedSettlementId(settlementId);
                  setDeleteDialogOpen(true);
                }}
                currentUserId={user?.userId}                
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
          onClose={() => {
            setExpenseFormOpen(false);
            setEditingExpense(null);
          }}
          groupId={groupId}
          groupName={group.groupName}
          members={members}
          expenseToEdit={editingExpense}
          onExpenseCreated={handleExpenseCreated}
        />
      )}

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

      {selectedSettlement && (
        <EditSettlementModal
          open={editSettlementModalOpen}
          onClose={() => setEditSettlementModalOpen(false)}
          settlement={selectedSettlement}
          onSettlementUpdated={handleSettlementUpdated}
        />
      )}

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
            onClick={() => selectedSettlementId && handleDeleteSettlement(selectedSettlementId)}
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