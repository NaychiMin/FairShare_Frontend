import {
  Box,
  Button,
  Grid,
  MenuItem,
  MenuList,
  ListItemText,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Tooltip,
} from "@mui/material";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { useAuth } from "../../context/Authentication/useAuth";
import groupService from "../../services/groupService";
import RestoreOutlinedIcon from "@mui/icons-material/RestoreOutlined";

interface Group {
  groupId: string;
  groupName: string;
  category: string;
  isAdmin?: boolean;
  status?: string;
}

interface GroupActionStatus {
  canArchive: boolean;
  canDelete: boolean;
  warningMessage?: string | null;
}

interface ApiErrorResponse {
  response?: {
    data?: {
      message?: string;
    };
  };
}

const getErrorMessage = (err: unknown, fallback: string): string => {
  if (err instanceof Error && err.message) {
    return err.message;
  }

  const apiError = err as ApiErrorResponse;
  return apiError.response?.data?.message ?? fallback;
};

const ArchivedGroupsPage = () => {
  const { user, jwtToken } = useAuth();
  const [groups, setGroups] = useState<Group[]>([]);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [target, setTarget] = useState<Group | null>(null);
  const [actionStatusMap, setActionStatusMap] = useState<Record<string, GroupActionStatus>>({});
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);

  const fetchArchived = async () => {
    if (!user?.email || !jwtToken) return;

    try {
      // const data = (await groupService.getArchived(user.email, jwtToken)) as
      //   | Group[]
      //   | undefined;

      // setGroups(data || []);

      const data = await groupService.getArchived(user.email, jwtToken);
      setGroups(data);
      await fetchActionStatuses(data);

    } catch (err: unknown) {
      toast.error(getErrorMessage(err, "Failed to fetch archived groups"));
    }
  };

  useEffect(() => {
    fetchArchived();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const openConfirm = (group: Group) => {
    setTarget(group);
    setConfirmOpen(true);
  };

  const closeConfirm = () => {
    setConfirmOpen(false);
    setTarget(null);
  };

  const confirmUnarchive = async () => {
    if (!target?.groupId) return;
    if (!user?.email || !jwtToken) return;

    try {
      await groupService.unarchiveGroup(String(target.groupId), jwtToken, user.email);
      toast.success("Group unarchived");
      closeConfirm();
      fetchArchived();
    } catch (err: unknown) {
      toast.error(getErrorMessage(err, "Failed to unarchive group"));
    }
  };

  const fetchActionStatuses = async (archivedGroups: Group[]) => {
    if (!jwtToken || !user?.email) return;

    try {
      const entries = await Promise.all(
        archivedGroups
          .filter((g) => g.isAdmin && g.groupId)
          .map(async (g) => {
            const status = await groupService.getGroupActionStatus(String(g.groupId), jwtToken, user.email);
            return [String(g.groupId), status] as const;
          })
      );

      setActionStatusMap(Object.fromEntries(entries));
    } catch (err) {
      console.error("Failed to fetch group action statuses", err);
    }
  };



  const openDeleteConfirm = (group: Group) => {
    setTarget(group);
    setDeleteConfirmOpen(true);
  };

  const closeDeleteConfirm = () => {
    setDeleteConfirmOpen(false);
    setTarget(null);
  };

  const confirmDelete = async () => {
    if (!target?.groupId || !jwtToken || !user?.email) return;

    try {
      await groupService.deleteGroup(String(target.groupId), jwtToken, user.email);
      toast.success("Group permanently deleted");
      closeDeleteConfirm();
      fetchArchived();
    } catch (err: unknown) {
      toast.error(getErrorMessage(err, "Failed to delete group"));
    }
  };

  return (
    <Grid size={12} width={"95%"} ml={2} mt={2}>
      <MenuList>
        {groups.map((group) => (
          <div key={String(group.groupId ?? group.groupId ?? group.groupName)}>
            <MenuItem
              sx={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                backgroundColor: "white",
                borderRadius: "12px",
                boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
                mb: 2,
                p: 2,
              }}
            >
              <ListItemText
                primary={<span style={{ fontWeight: 700 }}>{group.groupName}</span>}
                secondary={<span style={{ color: "#777" }}>{group.category}</span>}
              />


              {group.isAdmin === true && (
                <Box sx={{ display: "flex", gap: 1 }}>
                  <Tooltip
                    title={
                      actionStatusMap[String(group.groupId)]?.canArchive
                        ? "Unarchive group"
                        : actionStatusMap[String(group.groupId)]?.warningMessage || "Cannot unarchive group"
                    }
                  >
                    <span>
                      <IconButton
                        onClick={() => openConfirm(group)}
                        disabled={!actionStatusMap[String(group.groupId)]?.canArchive}
                        sx={{
                          border: "1px solid",
                          borderColor: "primary.main",
                          borderRadius: "8px",
                          color: "primary.main",
                          transition: "all 0.2s ease",
                          "&:hover": {
                            backgroundColor: "primary.main",
                            color: "white",
                          },
                        }}
                      >
                        <RestoreOutlinedIcon />
                      </IconButton>
                    </span>
                  </Tooltip>

                  <Tooltip
                    title={
                      actionStatusMap[String(group.groupId)]?.canDelete
                        ? "Delete group permanently"
                        : actionStatusMap[String(group.groupId)]?.warningMessage || "Cannot delete group"
                    }
                  >
                    <span>
                      <IconButton
                        onClick={() => openDeleteConfirm(group)}
                        disabled={!actionStatusMap[String(group.groupId)]?.canDelete}
                        sx={{
                          border: "1px solid",
                          borderColor: "error.main",
                          borderRadius: "8px",
                          color: "error.main",
                          transition: "all 0.2s ease",
                          "&:hover": {
                            backgroundColor: "error.main",
                            color: "white",
                          },
                        }}
                      >
                        <DeleteOutlineIcon />
                      </IconButton>
                    </span>
                  </Tooltip>
                </Box>
              )}
            </MenuItem>
          </div>
        ))}
      </MenuList>

      <Dialog
        open={confirmOpen}
        onClose={closeConfirm}
        fullWidth
        maxWidth="xs"
        PaperProps={{ sx: { borderRadius: "16px", p: 1 } }}
      >
        <DialogTitle sx={{ fontWeight: 800 }}>Unarchive Group</DialogTitle>
        <DialogContent sx={{ mt: 1, color: "#555" }}>
          Restore <span style={{ fontWeight: 800 }}>{target?.groupName}</span> to
          active groups?
        </DialogContent>
        <DialogActions sx={{ pb: 2, pr: 3 }}>
          <Button onClick={closeConfirm}>Cancel</Button>
          <Button
            variant="contained"
            onClick={confirmUnarchive}
            sx={{ borderRadius: "8px", px: 3, fontWeight: 700 }}
          >
            Unarchive
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog
        open={deleteConfirmOpen}
        onClose={closeDeleteConfirm}
        fullWidth
        maxWidth="xs"
        PaperProps={{ sx: { borderRadius: "16px", p: 1 } }}
      >
        <DialogTitle sx={{ fontWeight: 800 }}>Delete Group</DialogTitle>
        <DialogContent sx={{ mt: 1, color: "#555" }}>
          Permanently delete <span style={{ fontWeight: 800 }}>{target?.groupName}</span>?
          This action cannot be undone.
        </DialogContent>
        <DialogActions sx={{ pb: 2, pr: 3 }}>
          <Button onClick={closeDeleteConfirm}>Cancel</Button>
          <Button
            variant="contained"
            color="error"
            onClick={confirmDelete}
            sx={{ borderRadius: "8px", px: 3, fontWeight: 700 }}
          >
            Delete
          </Button>
        </DialogActions>
      </Dialog>

    </Grid>
  );
};

export default ArchivedGroupsPage;