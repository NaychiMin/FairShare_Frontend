import React, { useState, type PropsWithChildren } from "react";
import { Box, CssBaseline, useMediaQuery } from "@mui/material";
import { useTheme } from "@mui/material/styles";
import { Outlet } from "react-router-dom";

import TopBar from "./TopBar";
import SideBar from "./SideBar";

type MainLayoutProps = PropsWithChildren;

const DRAWER_WIDTH = 240;
const COLLAPSED_WIDTH = 72;

const MainLayout: React.FC<MainLayoutProps> = ({ children }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));

  const [mobileOpen, setMobileOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);

  return (
    <Box sx={{ display: "flex", minHeight: "100%", }}>
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
          flexGrow: 1, // take remaining space
          width: "100%",
          height: "100vh",
          display: "flex",    // force normal flow, not flex
          textAlign: "left",
          paddingTop: "60px"
          // marginLeft: `${isMobile ? 0 : collapsed ? COLLAPSED_WIDTH : DRAWER_WIDTH}px`,
        }}
      >
        {children ?? <Outlet />}
    </Box>
    </Box>
  );
};

export default MainLayout;
