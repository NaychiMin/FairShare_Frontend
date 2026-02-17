export interface TopBarProps {
  isMobile: boolean;
  onMenuClick: () => void;
  onCollapseToggle: () => void;
}

export interface SideBarProps {
  isMobile: boolean;
  mobileOpen: boolean;
  collapsed: boolean;
  onClose: () => void;
}
