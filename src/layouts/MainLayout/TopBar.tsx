import React from "react";
import {
  AppBar,
  Toolbar,
  IconButton,
} from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import type { TopBarProps } from "./index.types";

const TopBar = ({
  isMobile,
  onMenuClick,
  onCollapseToggle
}: TopBarProps ) => {
  return (
    <AppBar position="fixed">
      <Toolbar sx={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        {/* for desktop */}
        {!isMobile && (
          <IconButton
            color="inherit"
            onClick={onCollapseToggle}
          >
            <MenuIcon />
          </IconButton>
        )}

        {/* for mobile */}
        {isMobile && (
          <IconButton color="inherit" onClick={onMenuClick}>
            <MenuIcon />
          </IconButton>
        )}
      </Toolbar>
    </AppBar>
  );
};

export default TopBar;
