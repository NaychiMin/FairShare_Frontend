import { Button, Grid } from "@mui/material";
import { useNavigate } from "react-router-dom";

const GroupsPage = () => {
  const navigate = useNavigate();
  return (
    <Grid ml={2} mt={2}>
      <Button variant="outlined" onClick={()=>navigate('/newGroup')}>Add New</Button>
    </Grid>
  );
};

export default GroupsPage;