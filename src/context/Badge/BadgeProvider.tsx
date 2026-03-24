import { useCallback, useEffect, useState, type ReactNode } from "react";
import type { UserBadgeDto } from "../../types/Badge";
import { WebSocketService } from "../../services/websocket";
import { BadgeContext } from "./BadgeContext";

interface BadgeProviderProps {
  children: ReactNode;
  userId: string;
}

export const BadgeProvider: React.FC<BadgeProviderProps> = ({ children, userId }) => {
    const [currentBadge, setCurrentBadge] = useState<UserBadgeDto | null>(null);
    const [isPopupOpen, setIsPopupOpen] = useState<boolean>(false);

    const showBadgePopup = useCallback((badge: UserBadgeDto) => {
        setCurrentBadge(badge);
        setIsPopupOpen(true);
    }, []);

    const hideBadgePopup = useCallback(() => {
        setIsPopupOpen(false);
        setCurrentBadge(null);
    }, []);

    useEffect(() => {
        // Connect to WebSocket and listen for badge notifications
        const initializeWebSocket = async () => {
            try {
                await WebSocketService.connect(userId);
                
                // Subscribe to badge notifications
                const unsubscribe = WebSocketService.on(
                    `/topic/users/${userId}/badges`,
                    (badge: UserBadgeDto) => {
                        showBadgePopup(badge);
                    }
                );
                
                return unsubscribe;
            } catch (error) {
                console.error('Failed to connect to WebSocket:', error);
            }
        };

        let unsubscribe: (() => void) | undefined;
        
        initializeWebSocket().then((cleanup) => {
            unsubscribe = cleanup;
        });

        return () => {
            if (unsubscribe) {
                unsubscribe();
            }
            WebSocketService.disconnect();
        };
    }, [userId, showBadgePopup]);

    return (
        <BadgeContext.Provider value={{
            currentBadge,
            showBadgePopup,
            hideBadgePopup,
            isPopupOpen
        }}>
            {children}
        </BadgeContext.Provider>
    );
};