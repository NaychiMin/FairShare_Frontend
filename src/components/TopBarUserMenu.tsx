import { IconButton, Menu, MenuItem, Typography } from "@mui/material";
import PersonOutlineIcon from '@mui/icons-material/PersonOutline';
import { useState } from "react";
import { useAuth } from "../context/Authentication/useAuth";

const TopBarUserMenu = () => {
  const { user } = useAuth();

  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);
  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };
  const handleClose = () => {
    setAnchorEl(null);
  };
  return (
    <div className="flex items-center">
      <Typography><b>{user?.name}</b></Typography>
      <IconButton color="inherit" onClick={handleClick}>
        <PersonOutlineIcon />
      </IconButton>
      <Menu
        id="basic-menu"
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        slotProps={{
          list: {
            'aria-labelledby': 'basic-button',
          },
        }}
      >
        <MenuItem onClick={handleClose}>Profile</MenuItem>
        <MenuItem onClick={handleClose}>Logout</MenuItem>
      </Menu>
    </div>
  )
}

export default TopBarUserMenu;