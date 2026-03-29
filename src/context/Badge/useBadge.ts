import { useContext } from "react";
import type { BadgeNotificationContextType } from "../../types/Badge";
import { BadgeContext } from "./BadgeContext";

export const useBadge = (): BadgeNotificationContextType => {
    const context = useContext(BadgeContext);
    if (context === undefined) {
        throw new Error('useBadge must be used within a BadgeProvider');
    }
    return context;
};