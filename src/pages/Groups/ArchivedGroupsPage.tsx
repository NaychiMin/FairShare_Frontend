import {
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
} from "@mui/material";
import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { useAuth } from "../../context/Authentication/useAuth";
import groupService from "../../services/groupService";
import RestoreOutlinedIcon from "@mui/icons-material/RestoreOutlined";

interface Group {
  id?: string | number;
  groupId?: string | number;
  groupName?: string;
  category?: string;
  isAdmin?: boolean;
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

  const fetchArchived = async () => {
    if (!user?.email || !jwtToken) return;

    try {
      const data = (await groupService.getArchived(user.email, jwtToken)) as
        | Group[]
        | undefined;

      setGroups(data || []);
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
      await groupService.unarchiveGroup(target.groupId, jwtToken, user.email);
      toast.success("Group unarchived");
      closeConfirm();
      fetchArchived();
    } catch (err: unknown) {
      toast.error(getErrorMessage(err, "Failed to unarchive group"));
    }
  };

  return (
    <Grid size={12} width={"95%"} ml={2} mt={2}>
      <MenuList>
        {groups.map((group) => (
          <div key={String(group.groupId ?? group.id ?? group.groupName)}>
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
                <IconButton
                  onClick={() => openConfirm(group)}
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
    </Grid>
  );
};

export default ArchivedGroupsPage;