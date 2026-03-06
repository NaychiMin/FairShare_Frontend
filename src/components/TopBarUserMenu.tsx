// import { IconButton, Menu, MenuItem, Typography, Divider } from "@mui/material";
// import PersonOutlineIcon from '@mui/icons-material/PersonOutline';
// import { useState } from "react";
// import { useAuth } from "../context/Authentication/useAuth";
// import { useNavigate } from "react-router-dom";

// const TopBarUserMenu = () => {
//   const { user, logout } = useAuth();
//   const navigate = useNavigate();

//   const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
//   const open = Boolean(anchorEl);
//   const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
//     setAnchorEl(event.currentTarget);
//   };
//   const handleClose = () => {
//     setAnchorEl(null);
//   };
//   const routeToProfile = () => {
//     setAnchorEl(null);
//     navigate('/profile');
//   }
//   const routeToPendingInvites = () => {
//     setAnchorEl(null);
//     navigate('/pending-invites');
//   }
//   const handleLogout = () => {
//     setAnchorEl(null);
//     logout();
//   };
//   return (
//     <div className="flex items-center gap-2">
//       <Typography><b>{user?.name}</b></Typography>
//       <IconButton color="inherit" onClick={handleClick}>
//         <PersonOutlineIcon />
//       </IconButton>
//       <Menu
//         id="basic-menu"
//         anchorEl={anchorEl}
//         open={open}
//         onClose={handleClose}
//         slotProps={{
//           list: {
//             'aria-labelledby': 'basic-button',
//           },
//         }}
//       >
//         <MenuItem onClick={routeToProfile}>Profile</MenuItem>
//         <MenuItem onClick={routeToPendingInvites}>Pending Invites</MenuItem>
//         <Divider />
//         <MenuItem onClick={handleLogout}>Logout</MenuItem>
//       </Menu>
//     </div>
//   )
// }

// export default TopBarUserMenu;
import { IconButton, Menu, MenuItem, Typography, Divider } from "@mui/material";
import PersonOutlineIcon from '@mui/icons-material/PersonOutline';
import { useState } from "react";
import { useAuth } from "../context/Authentication/useAuth";
import { useNavigate } from "react-router-dom";

const TopBarUserMenu = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);

  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const routeToProfile = () => {
    setAnchorEl(null);
    navigate('/profile');
  };

  const routeToPendingInvites = () => {
    setAnchorEl(null);
    navigate('/pending-invites');
  };

  const routeToSentInvites = () => {
    setAnchorEl(null);
    navigate('/sent-invites');
  };

  const handleLogout = () => {
    setAnchorEl(null);
    logout();
  };

  return (
    <div className="flex items-center gap-2">
      <Typography><b>{user?.name}</b></Typography>
      <IconButton color="inherit" onClick={handleClick}>
        <PersonOutlineIcon />
      </IconButton>
      <Menu
        id="basic-menu"
        anchorEl={anchorEl}
        open={open}
        onClose={() => setAnchorEl(null)}
        slotProps={{
          list: {
            'aria-labelledby': 'basic-button',
          },
        }}
      >
        <MenuItem onClick={routeToProfile}>Profile</MenuItem>
        <MenuItem onClick={routeToPendingInvites}>Pending Invites</MenuItem>
        <MenuItem onClick={routeToSentInvites}>Sent Invites</MenuItem>
        <Divider />
        <MenuItem onClick={handleLogout}>Logout</MenuItem>
      </Menu>
    </div>
  );
};

export default TopBarUserMenu;