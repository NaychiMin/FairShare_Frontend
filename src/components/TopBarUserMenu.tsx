import {
  Badge,
  Box,
  CircularProgress,
  Divider,
  IconButton,
  Menu,
  MenuItem,
  Typography,
} from "@mui/material";
import PersonOutlineIcon from "@mui/icons-material/PersonOutline";
import NotificationsNoneOutlinedIcon from "@mui/icons-material/NotificationsNoneOutlined";
import { useEffect, useState } from "react";
import { useAuth } from "../context/Authentication/useAuth";
import { useNavigate } from "react-router-dom";
import notificationService from "../services/notificationService";

interface NotificationItem {
  notificationId: string;
  type: string;
  message: string;
  isRead: boolean;
  createdAt: string;
  groupId?: string | null;
  actorName?: string | null;
}

const TopBarUserMenu = () => {
  const { user, logout, jwtToken } = useAuth();
  const navigate = useNavigate();

  const [userMenuAnchorEl, setUserMenuAnchorEl] = useState<null | HTMLElement>(null);
  const [notificationAnchorEl, setNotificationAnchorEl] = useState<null | HTMLElement>(null);

  const userMenuOpen = Boolean(userMenuAnchorEl);
  const notificationMenuOpen = Boolean(notificationAnchorEl);

  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loadingNotifications, setLoadingNotifications] = useState(false);
  

  const loadNotifications = async () => {
    if (!jwtToken || !user?.email) return;

    try {
      setLoadingNotifications(true);

      const [items, countResponse] = await Promise.all([
        notificationService.getMyNotifications(jwtToken, user.email),
        notificationService.getUnreadCount(jwtToken, user.email),
      ]);

      setNotifications(items ?? []);
      setUnreadCount(countResponse?.unreadCount ?? 0);
    } catch (err) {
      console.error("Failed to load notifications", err);
    } finally {
      setLoadingNotifications(false);
    }
  };

  useEffect(() => {
    if (!jwtToken || !user?.email) return;

    loadNotifications();

    const interval = setInterval(() => {
      loadNotifications();
    }, 30000);

    return () => clearInterval(interval);
  }, [jwtToken, user?.email]);


  const handleUserMenuClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setUserMenuAnchorEl(event.currentTarget);
  };

  const handleNotificationClick = async (
    event: React.MouseEvent<HTMLButtonElement>
  ) => {
    setNotificationAnchorEl(event.currentTarget);
    await loadNotifications();
  };


  const closeUserMenu = () => {
    setUserMenuAnchorEl(null);
  };

  const closeNotificationMenu = () => {
    setNotificationAnchorEl(null);
  };


  const handleNotificationItemClick = async (notification: NotificationItem) => {
    try {
      if (!notification.isRead && jwtToken && user?.email) {
        await notificationService.markAsRead(
          notification.notificationId,
          jwtToken,
          user.email
        );
      }

      closeNotificationMenu();
      await loadNotifications();

      switch (notification.type) {
        case "INVITE_PENDING":
          navigate("/pending-invites");
          return;

        case "INVITE_ACCEPTED":
          navigate("/sent-invites");
          return;

        case "GROUP_DELETED":
        case "GROUP_ARCHIVED":
        case "GROUP_UPDATED":
        case "MEMBER_JOINED":
        case "PAYMENT_RECEIVED":
        case "MEMBER_LEFT":
        case "ADMIN_ASSIGNED":
        case "MEMBER_REMOVED":
          if (notification.groupId) {
            navigate(`/groups/${notification.groupId}`);
            return;
          }
          break;
        case "REMOVED_FROM_GROUP":
          if (notification.groupId) {
            navigate(`/groups`);
            return;
          }
          break;
        case "AMOUNT_OWED":
          if (notification.groupId) {
            navigate(`/groups/${notification.groupId}`);
            return;
          }
          break;

        default:
          if (notification.groupId) {
            navigate(`/groups/${notification.groupId}`);
            return;
          }
      }
    } catch (err) {
      console.error("Failed to open notification", err);
    }
  };

  const handleMarkAllAsRead = async () => {
    if (!jwtToken || !user?.email) return;

    try {
      await notificationService.markAllAsRead(jwtToken, user.email);
      await loadNotifications();
    } catch (err) {
      console.error("Failed to mark all notifications as read", err);
    }
  };

  const routeToProfile = () => {
    closeUserMenu();
    navigate("/profile");
  };

  const routeToPendingInvites = () => {
    closeUserMenu();
    navigate("/pending-invites");
  };

  const routeToSentInvites = () => {
    closeUserMenu();
    navigate("/sent-invites");
  };

  const handleLogout = () => {
    closeUserMenu();
    logout();
  };

  const formatNotificationTime = (createdAt: string) => {
    const date = new Date(createdAt);
    if (Number.isNaN(date.getTime())) return "";

    return date.toLocaleString(undefined, {
      day: "2-digit",
      month: "short",
      hour: "numeric",
      minute: "2-digit",
    });
  };

  return (
    <div className="flex items-center gap-2">
      <Typography>
        <b>{user?.name}</b>
      </Typography>

      <IconButton color="inherit" onClick={handleNotificationClick}>
        <Badge badgeContent={unreadCount} color="error">
          <NotificationsNoneOutlinedIcon />
        </Badge>
      </IconButton>

      <Menu
        anchorEl={notificationAnchorEl}
        open={notificationMenuOpen}
        onClose={closeNotificationMenu}
        PaperProps={{
          sx: {
            width: 360,
            maxHeight: 480,
            borderRadius: "12px",
          },
        }}
      >
        <Box
          sx={{
            px: 2,
            py: 1.5,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <Typography fontWeight={700}>Notifications</Typography>
          {unreadCount > 0 && (
            <Typography
              variant="body2"
              sx={{
                cursor: "pointer",
                color: "primary.main",
                fontWeight: 600,
              }}
              onClick={handleMarkAllAsRead}
            >
              Mark all as read
            </Typography>
          )}
        </Box>

        <Divider />

        {loadingNotifications ? (
          <Box
            sx={{
              py: 3,
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <CircularProgress size={24} />
          </Box>
        ) : notifications.length === 0 ? (
          <Box sx={{ px: 2, py: 3 }}>
            <Typography variant="body2" color="text.secondary">
              No notifications yet.
            </Typography>
          </Box>
        ) : (
          notifications.map((notification) => (
            <MenuItem
              key={notification.notificationId}
              onClick={() => handleNotificationItemClick(notification)}
              sx={{
                whiteSpace: "normal",
                alignItems: "flex-start",
                py: 1.5,
                px: 2,
                backgroundColor: notification.isRead ? "transparent" : "action.hover",
              }}
            >
              <Box>
                <Typography
                  variant="body2"
                  sx={{ fontWeight: notification.isRead ? 400 : 700 }}
                >
                  {notification.message}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {formatNotificationTime(notification.createdAt)}
                </Typography>
              </Box>
            </MenuItem>
          ))
        )}
      </Menu>

      <IconButton color="inherit" onClick={handleUserMenuClick}>
        <PersonOutlineIcon />
      </IconButton>

      <Menu
        id="basic-menu"
        anchorEl={userMenuAnchorEl}
        open={userMenuOpen}
        onClose={closeUserMenu}
        slotProps={{
          list: {
            "aria-labelledby": "basic-button",
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