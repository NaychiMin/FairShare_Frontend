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
} from "@mui/material";
import PersonAddAltOutlinedIcon from "@mui/icons-material/PersonAddAltOutlined";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import ArchiveOutlinedIcon from "@mui/icons-material/ArchiveOutlined";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import groupService from "../../services/groupService";
import { useAuth } from "../../context/Authentication/useAuth";

const categories = ["Household", "Trip", "Event", "Project", "Other"];

const GroupsPage = () => {
  const navigate = useNavigate();
  const { user, jwtToken } = useAuth();
  const [groups, setGroups] = useState<any[]>([]);

  // dialog state
  const [open, setOpen] = useState(false);
  const [selectedGroup, setSelectedGroup] = useState<any | null>(null);
  const [editForm, setEditForm] = useState({ groupName: "", category: "" });
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<any | null>(null);
  const [archiveOpen, setArchiveOpen] = useState(false);
  const [archiveTarget, setArchiveTarget] = useState<any | null>(null);
  const [inviteOpen, setInviteOpen] = useState(false);
  const [inviteTarget, setInviteTarget] = useState<any | null>(null);
  const [inviteEmail, setInviteEmail] = useState("");
  const [generatedLink, setGeneratedLink] = useState("");

  const fetchGroups = async () => {
    if (!user?.email || !jwtToken) return;

    try {
      const response = await groupService.getAll(user.email, jwtToken);
      if (response) setGroups(response);
    } catch (err) {
      toast.error(
        (err as any).response?.data?.message || "Failed to fetch groups",
      );
    }
  };

  useEffect(() => {
    fetchGroups();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleOpenArchive = (group: any) => {
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
        archiveTarget.groupId,
        jwtToken,
        user.email,
      );
      toast.success("Group archived");
      handleCloseArchive();
      fetchGroups();
    } catch (err) {
      toast.error(
        (err as any).response?.data?.message || "Failed to archive group",
      );
    }
  };

  const handleOpenEdit = (group: any) => {
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

  const handleEditChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEditForm({ ...editForm, [e.target.name]: e.target.value });
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
        groupId,
        { groupName: editForm.groupName, category: editForm.category },
        jwtToken,
        user.email,
      );
      toast.success("Group updated");
      handleCloseEdit();
      fetchGroups();
    } catch (err) {
      toast.error(
        (err as any).response?.data?.message || "Failed to update group",
      );
    }
  };

  const handleOpenDelete = (group: any) => {
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
      await groupService.deleteGroup(
        deleteTarget.groupId,
        jwtToken,
        user.email,
      );
      toast.success("Group deleted");
      handleCloseDelete();
      fetchGroups();
    } catch (err) {
      toast.error(
        (err as any).response?.data?.message || "Failed to delete group",
      );
    }
  };

  const handleOpenInvite = (group: any) => {
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
      const response = await groupService.createInvite(
        inviteTarget.groupId,
        { invitedEmail: inviteEmail },
        jwtToken,
        user.email
      );
      toast.success("Invitation created");
      setGeneratedLink(response.inviteLink);
    } catch (err) {
      toast.error((err as any).response?.data?.message || "Failed to create invitation");
    }
  };

  const handleCreateLinkInvite = async () => {
    if (!inviteTarget?.groupId || !user?.email || !jwtToken) return;

    try {
      const response = await groupService.createInvite(
        inviteTarget.groupId,
        { invitedEmail: null },
        jwtToken,
        user.email
      );
      toast.success("Invite link generated");
      setGeneratedLink(response.inviteLink);
    } catch (err) {
      toast.error((err as any).response?.data?.message || "Failed to create invite link");
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
          <div key={group.groupId}>
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

              {/* Put the conditional pencil icon here */}
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
                      borderRadius: "10px",
                      color: "success.main",
                      "&:hover": { backgroundColor: "success.main", color: "white" },
                    }}
                  >
                    <PersonAddAltOutlinedIcon />
                  </IconButton>

                  <IconButton
                    onClick={(e) => {
                      e.stopPropagation();
                      handleOpenArchive(group);
                    }}
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
                      ml: 1,
                      transition: "all 0.2s ease",
                      "&:hover": {
                        backgroundColor: "primary.main",
                        color: "white",
                      },
                    }}
                    aria-label="edit-group"
                  >
                    <EditOutlinedIcon />
                  </IconButton>

                  <IconButton
                    onClick={(e) => {
                      e.stopPropagation();
                      handleOpenDelete(group);
                    }}
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

      {/* Edit dialog */}
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

        {/* edit dialog */}
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

      {/* archive dialog */}
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

      {/* Delete dialog */}
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

      {/* Invite dialog */}
      <Dialog
        open={inviteOpen}
        onClose={handleCloseInvite}
        fullWidth
        maxWidth="sm"
        PaperProps={{ className: "rounded-2xl" }}
      >
        <div className="px-5 pt-5 pb-4">
          <div className="text-lg font-extrabold text-gray-900">Invite to Group</div>
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
                <div className="text-xs font-bold text-gray-600">Invite Link</div>
                <div className="mt-1 break-all text-sm text-gray-800">{generatedLink}</div>
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
