import React from 'react';

import { BadgeProvider } from './BadgeProvider';
import { useAuth } from '../Authentication/useAuth';
import BadgeNotification from '../../components/BadgePopup';

interface BadgeWrapperProps {
    children: React.ReactNode;
}

export const AuthBadgeProvider: React.FC<BadgeWrapperProps> = ({ children }) => {
  const { user } = useAuth();
  if (!user?.userId) {
    return children;
  }
  return (
    <BadgeProvider userId={user?.userId}>
      {children}
      <BadgeNotification />
    </BadgeProvider>
  );
};