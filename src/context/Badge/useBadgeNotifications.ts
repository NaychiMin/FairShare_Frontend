import { useBadge } from "./useBadge";

export const useBadgeNotifications = () => {
    const { currentBadge, hideBadgePopup, isPopupOpen } = useBadge();
    
    return {
        badge: currentBadge,
        isOpen: isPopupOpen,
        onClose: hideBadgePopup
    };
};