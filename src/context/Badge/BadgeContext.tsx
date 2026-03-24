import { createContext } from 'react';
import { type BadgeNotificationContextType } from '../../types/Badge';

export const BadgeContext = createContext<BadgeNotificationContextType | undefined>(undefined);