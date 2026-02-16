import React, { useState, type PropsWithChildren } from "react";
import { Box, CssBaseline, useMediaQuery } from "@mui/material";
import { useTheme } from "@mui/material/styles";
import { Outlet } from "react-router-dom";

import TopBar from "./TopBar";
import SideBar from "./SideBar";

type MainLayoutProps = PropsWithChildren;

const MainLayout: React.FC<MainLayoutProps> = ({ children }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));

  const [mobileOpen, setMobileOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);

  return (
    <Box sx={{ display: "flex" }}>
      <CssBaseline />

      {/* TopBar */}
      <TopBar
        isMobile={isMobile}
        onMenuClick={() => setMobileOpen(prev => !prev)}
        onCollapseToggle={() => setCollapsed(prev => !prev)}
      />

      {/* SideBar */}
      <SideBar
        isMobile={isMobile}
        mobileOpen={mobileOpen}
        collapsed={collapsed}
        onClose={() => setMobileOpen(false)}
      />

      {/* Main content */}
      <Box
        component="main"
        sx={{
          display: "block"
        }}
      >
        {children ?? <Outlet />}
      </Box>
    </Box>
  );
};

export default MainLayout;
