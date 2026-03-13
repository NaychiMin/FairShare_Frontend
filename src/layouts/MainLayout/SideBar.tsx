// import React from "react";
// import {
//   Drawer,
//   Box,
//   Toolbar,
//   MenuItem,
//   ListItemIcon,
//   ListItemText,
//   Tooltip,
// } from "@mui/material";
// import type { SideBarProps } from "./index.types";
// import { useNavigate, useLocation } from "react-router-dom";
// import GroupsOutlinedIcon from "@mui/icons-material/GroupsOutlined";
// import ArchiveOutlinedIcon from "@mui/icons-material/ArchiveOutlined";

// const DRAWER_WIDTH = 240;
// const COLLAPSED_WIDTH = 72;

// const SideBar = ({
//   isMobile,
//   mobileOpen,
//   collapsed,
//   onClose,
// }: SideBarProps) => {
//   const navigate = useNavigate();
//   const location = useLocation();

//   const isGroupsActive = location.pathname.startsWith("/groups");
//   const isArchivedActive = location.pathname.startsWith("/archived-groups");

//   const groupsItem = (
//     <MenuItem
//       onClick={() => navigate("/groups")}
//       selected={isGroupsActive}
//       sx={{
//         borderRadius: "12px",
//         px: collapsed ? 1.5 : 2,
//         py: 1.2,
//         mt: 1,
//         display: "flex",
//         alignItems: "center",
//         gap: 1.5,
//         fontWeight: 800,
//         transition: "all 0.2s ease",
//         "&.Mui-selected": {
//           backgroundColor: "primary.main",
//           color: "white",
//         },
//         "&.Mui-selected:hover": {
//           backgroundColor: "primary.dark",
//         },
//         "&:hover": {
//           backgroundColor: isGroupsActive
//             ? "primary.dark"
//             : "rgba(25,118,210,0.08)",
//         },
//       }}
//     >
//       <ListItemIcon
//         sx={{
//           minWidth: 0,
//           mr: collapsed ? 0 : 1.5,
//           color: "inherit",
//           display: "flex",
//           alignItems: "center",
//           justifyContent: "center",
//         }}
//       >
//         <GroupsOutlinedIcon />
//       </ListItemIcon>

//       {!collapsed && (
//         <ListItemText
//           primary="Groups"
//           primaryTypographyProps={{
//             fontWeight: 800,
//             fontSize: "14px",
//           }}
//         />
//       )}
//     </MenuItem>
//   );

//   const archivedItem = (
//     <MenuItem
//       onClick={() => navigate("/archived-groups")}
//       selected={isArchivedActive}
//       sx={{
//         borderRadius: "12px",
//         px: collapsed ? 1.5 : 2,
//         py: 1.2,
//         mt: 1,
//         display: "flex",
//         alignItems: "center",
//         gap: 1.5,
//         fontWeight: 800,
//         transition: "all 0.2s ease",
//         "&.Mui-selected": { backgroundColor: "primary.main", color: "white" },
//         "&.Mui-selected:hover": { backgroundColor: "primary.dark" },
//         "&:hover": {
//           backgroundColor: isArchivedActive
//             ? "primary.dark"
//             : "rgba(25,118,210,0.08)",
//         },
//       }}
//     >
//       <ListItemIcon
//         sx={{ minWidth: 0, mr: collapsed ? 0 : 1.5, color: "inherit" }}
//       >
//         <ArchiveOutlinedIcon />
//       </ListItemIcon>
//       {!collapsed && (
//         <ListItemText
//           primary="Archived Groups"
//           primaryTypographyProps={{ fontWeight: 800, fontSize: "14px" }}
//         />
//       )}
//     </MenuItem>
//   );

//   const drawerContent = (
//     <Box sx={{ p: 2 }}>
//       {collapsed ? (
//         <Tooltip title="Groups" placement="right">
//           <Box>{groupsItem}</Box>
//         </Tooltip>
        
//       ) : (
//         groupsItem
     
//       )}
//     </Box>
//   );

//   if (isMobile) {
//     return (
//       <Drawer
//         variant="temporary"
//         open={mobileOpen}
//         onClose={onClose}
//         ModalProps={{ keepMounted: true }}
//         sx={{
//           "& .MuiDrawer-paper": { width: DRAWER_WIDTH },
//         }}
//       >
//         {drawerContent}
//       </Drawer>
//     );
//   }

//   return (
//     <Drawer
//       variant="permanent"
//       sx={{
//         width: collapsed ? COLLAPSED_WIDTH : DRAWER_WIDTH,
//         flexShrink: 0,
//         "& .MuiDrawer-paper": {
//           width: collapsed ? COLLAPSED_WIDTH : DRAWER_WIDTH,
//           overflowX: "hidden",
//           transition: "width 0.3s",
//           zIndex: 1000,
//         },
//       }}
//     >
//       <Toolbar />
//       {drawerContent}
//     </Drawer>
//   );
// };

// export default SideBar;

import React from "react";
import {
  Drawer,
  Box,
  Toolbar,
  MenuItem,
  ListItemIcon,
  ListItemText,
  Tooltip,
} from "@mui/material";
import type { SideBarProps } from "./index.types";
import { useNavigate, useLocation } from "react-router-dom";
import GroupsOutlinedIcon from "@mui/icons-material/GroupsOutlined";
import ArchiveOutlinedIcon from "@mui/icons-material/ArchiveOutlined";

const DRAWER_WIDTH = 240;
const COLLAPSED_WIDTH = 72;

const SideBar = ({ isMobile, mobileOpen, collapsed, onClose }: SideBarProps) => {
  const navigate = useNavigate();
  const location = useLocation();

  const navItemSx = (active: boolean) => ({
    borderRadius: "12px",
    px: collapsed ? 1.5 : 2,
    py: 1.2,
    mt: 1,
    display: "flex",
    alignItems: "center",
    gap: 1.5,
    fontWeight: 800,
    transition: "all 0.2s ease",
    ...(active
      ? { backgroundColor: "primary.main", color: "white" }
      : { backgroundColor: "transparent" }),
    "&:hover": {
      backgroundColor: active ? "primary.dark" : "rgba(25,118,210,0.08)",
    },
  });

  const groupsActive = location.pathname.startsWith("/groups");
  const archivedActive = location.pathname.startsWith("/archived-groups");

  const groupsItem = (
    <MenuItem onClick={() => navigate("/groups")} sx={navItemSx(groupsActive)}>
      <ListItemIcon sx={{ minWidth: 0, mr: collapsed ? 0 : 1.5, color: "inherit" }}>
        <GroupsOutlinedIcon />
      </ListItemIcon>
      {!collapsed && (
        <ListItemText
          primary="Groups"
          primaryTypographyProps={{ fontWeight: 800, fontSize: "14px" }}
        />
      )}
    </MenuItem>
  );

  const archivedItem = (
    <MenuItem
      onClick={() => navigate("/archived-groups")}
      sx={navItemSx(archivedActive)}
    >
      <ListItemIcon sx={{ minWidth: 0, mr: collapsed ? 0 : 1.5, color: "inherit" }}>
        <ArchiveOutlinedIcon />
      </ListItemIcon>
      {!collapsed && (
        <ListItemText
          primary="Archived Groups"
          primaryTypographyProps={{ fontWeight: 800, fontSize: "14px" }}
        />
      )}
    </MenuItem>
  );

  const drawerContent = (
    <Box sx={{ p: 2 }}>
      {collapsed ? (
        <>
          <Tooltip title="Groups" placement="right">
            <Box>{groupsItem}</Box>
          </Tooltip>
          <Tooltip title="Archived Groups" placement="right">
            <Box>{archivedItem}</Box>
          </Tooltip>
        </>
      ) : (
        <>
          {groupsItem}
          {archivedItem}
        </>
      )}
    </Box>
  );

  if (isMobile) {
    return (
      <Drawer
        variant="temporary"
        open={mobileOpen}
        onClose={onClose}
        ModalProps={{ keepMounted: true }}
        sx={{ "& .MuiDrawer-paper": { width: DRAWER_WIDTH } }}
      >
        {drawerContent}
      </Drawer>
    );
  }

  return (
    <Drawer
      variant="permanent"
      sx={{
        width: collapsed ? COLLAPSED_WIDTH : DRAWER_WIDTH,
        flexShrink: 0,
        "& .MuiDrawer-paper": {
          width: collapsed ? COLLAPSED_WIDTH : DRAWER_WIDTH,
          overflowX: "hidden",
          transition: "width 0.3s",
          zIndex: 1000,
        },
      }}
    >
      <Toolbar />
      {drawerContent}
    </Drawer>
  );
};

export default SideBar;
