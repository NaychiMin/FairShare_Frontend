import React from 'react';
import { Snackbar, Alert, Box, Typography } from '@mui/material';
import { useBadgeNotifications } from '../context/Badge/useBadgeNotifications';

interface BadgeNotificationProps {
    autoHideDuration?: number;
    position?: {
        vertical: 'top' | 'bottom';
        horizontal: 'left' | 'center' | 'right';
    };
}

const BadgeNotification: React.FC<BadgeNotificationProps> = ({
    autoHideDuration = 6000,
    position = { vertical: 'top', horizontal: 'right' }
}) => {
    const { badge, isOpen, onClose } = useBadgeNotifications();

    if (!badge) return null;

    return (
        <Snackbar
            open={isOpen}
            autoHideDuration={autoHideDuration}
            onClose={onClose}
            anchorOrigin={position}
        >
            <Alert
                onClose={onClose}
                severity="success"
                sx={{
                    width: '100%',
                    backgroundColor: '#f0f9ff',
                    borderLeft: '4px solid #4caf50',
                    '& .MuiAlert-icon': {
                        alignItems: 'center'
                    }
                }}
                // icon={
                //     <Avatar 
                //         src={badge.badgeIcon} 
                //         sx={{ 
                //             width: 48, 
                //             height: 48,
                //             backgroundColor: '#fff',
                //             boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                //         }}
                //     >
                //         {!badge.badgeIcon && '🏆'}
                //     </Avatar>
                // }
            >
                <Box>
                    <Typography variant="caption" color="primary" fontWeight="bold">
                        NEW ACHIEVEMENT UNLOCKED!
                    </Typography>
                    <Typography variant="h6" fontWeight="bold" color="primary" sx={{ mt: 0.5 }}>
                        {badge.badge.name}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                        {badge.badge.description}
                    </Typography>
                    {badge.group?.groupName && (
                        <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                            Earned in: {badge.group?.groupName}
                        </Typography>
                    )}
                </Box>
            </Alert>
        </Snackbar>
    );
};

export default BadgeNotification;