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
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
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

  const fetchGroups = async () => {
    if (!user?.email || !jwtToken) return;

    try {
      const response = await groupService.getAll(user.email, jwtToken);
      if (response) setGroups(response);
    } catch (err) {
      toast.error((err as any).response?.data?.message || "Failed to fetch groups");
    }
  };

  useEffect(() => {
    fetchGroups();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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
        user.email
      );
      toast.success("Group updated");
      handleCloseEdit();
      fetchGroups();
    } catch (err) {
      toast.error((err as any).response?.data?.message || "Failed to update group");
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
      await groupService.deleteGroup(deleteTarget.groupId, jwtToken, user.email);
      toast.success("Group deleted");
      handleCloseDelete();
      fetchGroups();
    } catch (err) {
      toast.error((err as any).response?.data?.message || "Failed to delete group");
    }
  };

  return (
  <Grid size={12} width={"95%"} ml={2} mt={2}>

      <MenuList>
          {groups.map((group) => (
            <div key={group.groupId}>
              <MenuItem
                onClick={() => navigate(`/groups/${group.groupId}`)}
                sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}
              >
                <ListItemText primary={group.groupName} secondary={group.category} />

                {/* Put the conditional pencil icon here */}
                {group.isAdmin === true && (
                  <>
                    <IconButton
                      edge="end"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleOpenEdit(group);
                      }}
                      aria-label="edit-group"
                    >
                      <EditOutlinedIcon />
                    </IconButton>

                    <IconButton
                      edge="end"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleOpenDelete(group);
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
      <Dialog open={open} onClose={handleCloseEdit} fullWidth maxWidth="sm">
        <DialogTitle>Edit group</DialogTitle>
        <DialogContent sx={{ display: "flex", flexDirection: "column", gap: 2, mt: 1 }}>
          <TextField
            label="Group Name"
            name="groupName"
            value={editForm.groupName}
            onChange={handleEditChange}
            fullWidth
            required
          />

          <TextField
            select
            label="Category"
            name="category"
            value={editForm.category}
            onChange={handleEditChange}
            fullWidth
            required
          >
            {categories.map((option) => (
              <MenuItem key={option} value={option}>
                {option}
              </MenuItem>
            ))}
          </TextField>
        </DialogContent>

        <DialogActions>
          <Button onClick={handleCloseEdit}>Cancel</Button>
          <Button
            onClick={handleSaveEdit}
            variant="contained"
            disabled={!editForm.groupName || !editForm.category}
          >
            Save
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete dialog */}
      <Dialog open={deleteOpen} onClose={handleCloseDelete} fullWidth maxWidth="xs">
        <DialogTitle>Delete group</DialogTitle>
        <DialogContent>
          This will permanently delete{" "}
          <strong>{deleteTarget?.groupName ?? "this group"}</strong> and its memberships.
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDelete}>Cancel</Button>
          <Button variant="contained" onClick={handleConfirmDelete}>
            Delete
          </Button>
        </DialogActions>
      </Dialog>

    </Grid>
  );
};

export default GroupsPage;