import React from "react";
import { Drawer, Box, Toolbar, MenuItem } from "@mui/material";
import type { SideBarProps } from "./index.types";
import { useNavigate } from "react-router-dom";

const DRAWER_WIDTH = 240;
const COLLAPSED_WIDTH = 72;

const SideBar = ({
  isMobile,
  mobileOpen,
  collapsed,
  onClose
}: SideBarProps) => {
  const navigate = useNavigate()
  const drawerContent = (
    <Box sx={{ p: 2 }}>
      <MenuItem onClick={()=>navigate('/groups')}>Groups</MenuItem>
    </Box>
  );

  if (isMobile) {
    return (
      <Drawer
        variant="temporary"
        open={mobileOpen}
        onClose={onClose}
        ModalProps={{ keepMounted: true }}
        sx={{
          "& .MuiDrawer-paper": { width: DRAWER_WIDTH }
        }}
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
        }
      }}
    >
      <Toolbar />
      {drawerContent}
    </Drawer>
  );
};

export default SideBar;
