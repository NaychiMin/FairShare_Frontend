import { Button, Divider, Grid, ListItemText, MenuItem, MenuList } from "@mui/material";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import groupService from "../../services/groupService";
import { useAuth } from "../../context/Authentication/useAuth";

const GroupsPage = () => {
  const navigate = useNavigate();
  const { user, jwtToken } = useAuth();
  const [groups, setGroups] = useState<any[]>([]);
  const fetchGroups = async () => {
    // Only fetch if we have the required data
    if (!user?.email || !jwtToken) return;

    try {
      const response = await groupService.getAll(user.email, jwtToken);
      if (response) {
        setGroups(response);
      }
    } catch (err) {
      toast.error((err as any).response?.data?.message || "Failed to fetch groups");
    }
  };
  useEffect(() => {
  fetchGroups(); // Execute it
}, []);
  return (
    <Grid size={12} width={'95%'} ml={2} mt={2}>
      <MenuList>
        {groups.map((group) => (
          <>
          <MenuItem key={group.id} onClick={() => navigate(`/groups/${group.id}`)}>
            <ListItemText>{group.groupName}</ListItemText>
          </MenuItem>
          <Divider />
          </>
        ))}
      </MenuList>
      <Button variant="outlined" onClick={()=>navigate('/newGroup')}>Add New</Button>
    </Grid>
  );
};

export default GroupsPage;