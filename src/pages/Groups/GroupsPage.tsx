import {
  Button,
  Divider,
  Grid,
  ListItemText,
  MenuItem,
  MenuList,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Tooltip
} from "@mui/material";
import PersonAddAltOutlinedIcon from "@mui/icons-material/PersonAddAltOutlined";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import ArchiveOutlinedIcon from "@mui/icons-material/ArchiveOutlined";
import { useEffect, useState } from "react";
import type { ChangeEvent } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import groupService from "../../services/groupService";
import { useAuth } from "../../context/Authentication/useAuth";

const categories = ["Household", "Trip", "Event", "Project", "Other"] as const;

interface Group {
  id?: string | number;
  groupId?: string | number;
  groupName?: string;
  category?: string;
  isAdmin?: boolean;
}

interface EditForm {
  groupName: string;
  category: string;
}

interface InviteResponse {
  inviteLink: string;
}

interface ApiErrorResponse {
  response?: {
    data?: {
      message?: string;
    };
  };
}

interface GroupActionStatus {
  canArchive: boolean;
  canDelete: boolean;
  warningMessage?: string | null;
}

const getErrorMessage = (err: unknown, fallback: string): string => {
  if (err instanceof Error && err.message) {
    return err.message;
  }

  const apiError = err as ApiErrorResponse;
  return apiError.response?.data?.message ?? fallback;
};

const GroupsPage = () => {
  const navigate = useNavigate();
  const { user, jwtToken } = useAuth();

  const [groups, setGroups] = useState<Group[]>([]);

  const [open, setOpen] = useState(false);
  const [selectedGroup, setSelectedGroup] = useState<Group | null>(null);
  const [editForm, setEditForm] = useState<EditForm>({
    groupName: "",
    category: "",
  });

  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<Group | null>(null);

  const [archiveOpen, setArchiveOpen] = useState(false);
  const [archiveTarget, setArchiveTarget] = useState<Group | null>(null);

  const [inviteOpen, setInviteOpen] = useState(false);
  const [inviteTarget, setInviteTarget] = useState<Group | null>(null);
  const [inviteEmail, setInviteEmail] = useState("");
  const [generatedLink, setGeneratedLink] = useState("");

  const [actionStatusMap, setActionStatusMap] = useState<
      Record<string, GroupActionStatus>
    >({});

  const fetchGroups = async () => {
    if (!user?.email || !jwtToken) return;

    try {
      const response = await groupService.getAll(user.email, jwtToken);

      if (response) {
        setGroups(response);

        // load button states separately, but do not block group rendering
        fetchActionStatuses(response);
      }
    } catch (err: unknown) {
      toast.error(getErrorMessage(err, "Failed to fetch groups"));
    }
  };

  useEffect(() => {
    fetchGroups();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);


  const fetchActionStatuses = async (groupList: Group[]) => {
    if (!user?.email || !jwtToken) return;

    try {
      const entries = await Promise.all(
        groupList
          .filter((group) => group.isAdmin === true && group.groupId)
          .map(async (group) => {
            try {
              const status = await groupService.getGroupActionStatus(
                String(group.groupId),
                jwtToken,
                user.email
              );

              return [
                String(group.groupId),
                {
                  canArchive: status.canArchive,
                  canDelete: status.canDelete,
                  warningMessage: status.warningMessage,
                },
              ] as const;
            } catch {
              // fallback so the page still works even if status API fails
              return [
                String(group.groupId),
                {
                  canArchive: true,
                  canDelete: true,
                  warningMessage: null,
                },
              ] as const;
            }
          })
      );

      setActionStatusMap(Object.fromEntries(entries));
    } catch (err) {
      console.error("Failed to fetch group action statuses", err);
    }
  };

  const handleOpenArchive = (group: Group) => {
    setArchiveTarget(group);
    setArchiveOpen(true);
  };

  const handleCloseArchive = () => {
    setArchiveOpen(false);
    setArchiveTarget(null);
  };

  const handleConfirmArchive = async () => {
    if (!archiveTarget?.groupId) return;
    if (!user?.email || !jwtToken) return;

    try {
      await groupService.archiveGroup(
        String(archiveTarget.groupId),
        jwtToken,
        user.email,
      );
      toast.success("Group archived");
      handleCloseArchive();
      fetchGroups();
    } catch (err: unknown) {
      toast.error(getErrorMessage(err, "Failed to archive group"));
    }
  };

  const handleOpenEdit = (group: Group) => {
    setSelectedGroup(group);
    setEditForm({
      groupName: group.groupName ?? "",
      category: group.category ?? "",
    });
    setOpen(true);
  };

  const handleCloseEdit = () => {
    setOpen(false);
    setSelectedGroup(null);
  };

  const handleEditChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;

    setEditForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSaveEdit = async () => {
    if (!selectedGroup?.id && !selectedGroup?.groupId) {
      toast.error("Missing group id");
      return;
    }

    if (!user?.email || !jwtToken) return;

    const groupId = selectedGroup.id ?? selectedGroup.groupId;

    try {
      await groupService.updateGroup(
        String(groupId),
        {
          groupName: editForm.groupName,
          category: editForm.category,
        },
        jwtToken,
        user.email,
      );
      toast.success("Group updated");
      handleCloseEdit();
      fetchGroups();
    } catch (err: unknown) {
      toast.error(getErrorMessage(err, "Failed to update group"));
    }
  };

  const handleOpenDelete = (group: Group) => {
    setDeleteTarget(group);
    setDeleteOpen(true);
  };

  const handleCloseDelete = () => {
    setDeleteOpen(false);
    setDeleteTarget(null);
  };

  const handleConfirmDelete = async () => {
    if (!deleteTarget?.groupId) {
      toast.error("Missing groupId");
      return;
    }

    if (!user?.email || !jwtToken) return;

    try {
      await groupService.deleteGroup(String(deleteTarget.groupId), jwtToken, user.email);
      toast.success("Group deleted");
      handleCloseDelete();
      fetchGroups();
    } catch (err: unknown) {
      toast.error(getErrorMessage(err, "Failed to delete group"));
    }
  };

  const handleOpenInvite = (group: Group) => {
    setInviteTarget(group);
    setInviteEmail("");
    setGeneratedLink("");
    setInviteOpen(true);
  };

  const handleCloseInvite = () => {
    setInviteOpen(false);
    setInviteTarget(null);
    setInviteEmail("");
    setGeneratedLink("");
  };

  const handleCreateEmailInvite = async () => {
    if (!inviteTarget?.groupId || !user?.email || !jwtToken) return;

    try {
      const response = (await groupService.createInvite(
        String(inviteTarget.groupId),
        { invitedEmail: inviteEmail },
        jwtToken,
        user.email,
      )) as InviteResponse;

      toast.success("Invitation created");
      setGeneratedLink(response.inviteLink);
    } catch (err: unknown) {
      toast.error(getErrorMessage(err, "Failed to create invitation"));
    }
  };

  const handleCreateLinkInvite = async () => {
    if (!inviteTarget?.groupId || !user?.email || !jwtToken) return;

    try {
      const response = (await groupService.createInvite(
        String(inviteTarget.groupId),
        { invitedEmail: null },
        jwtToken,
        user.email,
      )) as InviteResponse;

      toast.success("Invite link generated");
      setGeneratedLink(response.inviteLink);
    } catch (err: unknown) {
      toast.error(getErrorMessage(err, "Failed to create invite link"));
    }
  };

  const handleCopyLink = async () => {
    if (!generatedLink) return;
    await navigator.clipboard.writeText(generatedLink);
    toast.success("Invite link copied");
  };

  return (
    <Grid size={12} width={"95%"} ml={2} mt={2}>
      <MenuList>
        {groups.map((group) => (
          <div key={String(group.groupId ?? group.id ?? group.groupName)}>
            <MenuItem
              onClick={() => navigate(`/groups/${group.groupId}`)}
              sx={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                backgroundColor: "white",
                borderRadius: "12px",
                boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
                mb: 2,
                p: 2,
                transition: "all 0.2s ease",
                "&:hover": {
                  boxShadow: "0 4px 14px rgba(0,0,0,0.12)",
                  transform: "translateY(-2px)",
                },
              }}
            >
              <ListItemText
                primary={group.groupName}
                secondary={group.category}
              />

              {group.isAdmin === true && (
                <>
                  <IconButton
                    onClick={(e) => {
                      e.stopPropagation();
                      handleOpenInvite(group);
                    }}
                    sx={{
                      border: "1px solid",
                      borderColor: "success.main",
                      borderRadius: "8px",
                      color: "success.main",
                      width: 40,
                      height: 40,
                      "&:hover": {
                        backgroundColor: "success.main",
                        color: "white",
                      },
                    }}
                  >
                    <PersonAddAltOutlinedIcon />
                  </IconButton>

                  <IconButton
                    onClick={(e) => {
                      e.stopPropagation();
                      handleOpenEdit(group);
                    }}
                    sx={{
                      border: "1px solid",
                      borderColor: "primary.main",
                      borderRadius: "8px",
                      color: "primary.main",
                      width: 40,
                      height: 40,
                      ml: 1,
                      "&:hover": {
                        backgroundColor: "primary.main",
                        color: "white",
                      },
                    }}
                  >
                    <EditOutlinedIcon />
                  </IconButton>

                  <Tooltip
                    title={
                      actionStatusMap[String(group.groupId)]?.canArchive === false
                        ? actionStatusMap[String(group.groupId)]?.warningMessage ||
                          "Cannot archive group until all balances are zero"
                        : "Archive group"
                    }
                  >
                    <span>
                      <IconButton
                        onClick={(e) => {
                          e.stopPropagation();
                          handleOpenArchive(group);
                        }}
                        disabled={actionStatusMap[String(group.groupId)]?.canArchive === false}
                        sx={{
                          border: "1px solid",
                          borderColor: "warning.main",
                          borderRadius: "8px",
                          color: "warning.main",
                          ml: 1,
                          transition: "all 0.2s ease",
                          "&:hover": {
                            backgroundColor: "warning.main",
                            color: "white",
                          },
                        }}
                        aria-label="archive-group"
                      >
                        <ArchiveOutlinedIcon />
                      </IconButton>
                    </span>
                  </Tooltip>

                 <Tooltip
                  title={
                    actionStatusMap[String(group.groupId)]?.canDelete === false
                      ? actionStatusMap[String(group.groupId)]?.warningMessage ||
                        "Cannot delete group until all balances are zero"
                      : "Delete group"
                  }
                >
                  <span>
                    <IconButton
                      onClick={(e) => {
                        e.stopPropagation();
                        handleOpenDelete(group);
                      }}
                      disabled={actionStatusMap[String(group.groupId)]?.canDelete === false}
                      sx={{
                        border: "1px solid",
                        borderColor: "error.main",
                        borderRadius: "8px",
                        color: "error.main",
                        ml: 1,
                        transition: "all 0.2s ease",
                        "&:hover": {
                          backgroundColor: "error.main",
                          color: "white",
                        },
                      }}
                      aria-label="delete-group"
                    >
                      <DeleteOutlineIcon />
                    </IconButton>
                  </span>
                </Tooltip>



                </>
              )}
            </MenuItem>
            <Divider />
          </div>
        ))}
      </MenuList>

      <Button variant="outlined" onClick={() => navigate("/newGroup")}>
        Add New
      </Button>

      <Dialog
        open={open}
        onClose={handleCloseEdit}
        fullWidth
        maxWidth="sm"
        PaperProps={{
          sx: {
            borderRadius: "16px",
            p: 1,
          },
        }}
      >
        <DialogTitle sx={{ fontWeight: 700 }}>Edit Group</DialogTitle>

        <DialogContent
          sx={{
            display: "flex",
            flexDirection: "column",
            gap: 3,
            mt: 1,
          }}
        >
          <TextField
            label="Group Name"
            name="groupName"
            value={editForm.groupName}
            onChange={handleEditChange}
            fullWidth
          />

          <TextField
            select
            label="Category"
            name="category"
            value={editForm.category}
            onChange={handleEditChange}
            fullWidth
          >
            {categories.map((option) => (
              <MenuItem key={option} value={option}>
                {option}
              </MenuItem>
            ))}
          </TextField>
        </DialogContent>

        <DialogActions sx={{ pb: 2, pr: 3 }}>
          <Button onClick={handleCloseEdit}>Cancel</Button>
          <Button
            variant="contained"
            onClick={handleSaveEdit}
            sx={{
              borderRadius: "8px",
              px: 3,
              fontWeight: 600,
            }}
          >
            Save Changes
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog
        open={archiveOpen}
        onClose={handleCloseArchive}
        fullWidth
        maxWidth="xs"
        PaperProps={{ sx: { borderRadius: "16px", p: 1 } }}
      >
        <DialogTitle sx={{ fontWeight: 800, color: "warning.main" }}>
          Archive Group
        </DialogTitle>
        <DialogContent sx={{ mt: 1 }}>
          <div style={{ fontSize: "14px", color: "#555" }}>Archive</div>
          <div style={{ fontWeight: 800, fontSize: "16px", marginTop: "6px" }}>
            {archiveTarget?.groupName}
          </div>
          <div style={{ marginTop: "10px", fontSize: "13px", color: "#777" }}>
            You can restore it later from Archived Groups.
          </div>
        </DialogContent>
        <DialogActions sx={{ pb: 2, pr: 3 }}>
          <Button onClick={handleCloseArchive}>Cancel</Button>
          <Button
            variant="contained"
            onClick={handleConfirmArchive}
            sx={{
              borderRadius: "8px",
              px: 3,
              fontWeight: 700,
              backgroundColor: "warning.main",
            }}
          >
            Archive
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog
        open={deleteOpen}
        onClose={handleCloseDelete}
        fullWidth
        maxWidth="xs"
        PaperProps={{
          sx: {
            borderRadius: "16px",
            p: 1,
          },
        }}
      >
        <DialogTitle sx={{ fontWeight: 700, color: "error.main" }}>
          Delete Group
        </DialogTitle>

        <DialogContent sx={{ mt: 1 }}>
          <div style={{ fontSize: "14px", color: "#555" }}>
            You are about to permanently delete
          </div>

          <div
            style={{
              fontWeight: 700,
              fontSize: "16px",
              marginTop: "6px",
            }}
          >
            {deleteTarget?.groupName}
          </div>

          <div style={{ marginTop: "10px", fontSize: "13px", color: "#777" }}>
            This action cannot be undone.
          </div>
        </DialogContent>

        <DialogActions sx={{ pb: 2, pr: 3 }}>
          <Button onClick={handleCloseDelete}>Cancel</Button>
          <Button
            variant="contained"
            color="error"
            onClick={handleConfirmDelete}
            sx={{
              borderRadius: "8px",
              px: 3,
              fontWeight: 600,
            }}
          >
            Delete
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog
        open={inviteOpen}
        onClose={handleCloseInvite}
        fullWidth
        maxWidth="sm"
        PaperProps={{ className: "rounded-2xl" }}
      >
        <div className="px-5 pt-5 pb-4">
          <div className="text-lg font-extrabold text-gray-900">
            Invite to Group
          </div>
          <div className="mt-1 text-sm text-gray-500">
            Invite users by email or generate a shareable link.
          </div>

          <div className="mt-5 space-y-4">
            <TextField
              fullWidth
              label="Invite by email"
              value={inviteEmail}
              onChange={(e) => setInviteEmail(e.target.value)}
            />

            <div className="flex gap-2">
              <Button
                variant="contained"
                onClick={handleCreateEmailInvite}
                disabled={!inviteEmail}
                sx={{ borderRadius: "12px", fontWeight: 700 }}
              >
                Send Invite
              </Button>

              <Button
                variant="outlined"
                onClick={handleCreateLinkInvite}
                sx={{ borderRadius: "12px", fontWeight: 700 }}
              >
                Generate Link
              </Button>
            </div>

            {generatedLink && (
              <div className="rounded-xl border border-gray-200 bg-gray-50 p-3">
                <div className="text-xs font-bold text-gray-600">
                  Invite Link
                </div>
                <div className="mt-1 break-all text-sm text-gray-800">
                  {generatedLink}
                </div>
                <Button
                  variant="text"
                  onClick={handleCopyLink}
                  sx={{ mt: 1, px: 0, fontWeight: 700 }}
                >
                  Copy Link
                </Button>
              </div>
            )}
          </div>

          <div className="mt-6 flex justify-end gap-2">
            <Button onClick={handleCloseInvite}>Close</Button>
          </div>
        </div>
      </Dialog>
    </Grid>
  );
};

export default GroupsPage;