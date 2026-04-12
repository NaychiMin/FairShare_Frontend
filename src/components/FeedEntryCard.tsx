import { Card, CardContent, Typography, Stack, Chip, Divider } from '@mui/material';
import type { FeedEntry } from '../types/Feed';

type Props = {
  entry: FeedEntry;
};

const FeedEntryCard = ({ entry }: Props) => {
  const { feedEntryType, expenseAdded, userBadgeEarned, group } = entry;

  const renderContent = () => {
    switch (feedEntryType) {
      case "EXPENSE_ADDED":
        return (
          <>
            <Typography variant="h6" fontWeight="bold">
              💸 Expense Added: {expenseAdded?.description}
            </Typography>

            <Typography variant="caption" color="text.secondary">
              Amount: ${expenseAdded?.amount}
            </Typography>
          </>
        );

      case "BADGE_EARNED":
        return (
          <>
            <Typography variant="h6" fontWeight="bold">
              🏅 Badge Earned!
            </Typography>

            <Typography variant="body1" fontWeight="bold">
              {userBadgeEarned?.badge?.name}
            </Typography>

            <Typography variant="caption" color="text.secondary">
              {userBadgeEarned?.badge?.description?.replaceAll('You', userBadgeEarned.user.name).replaceAll('you', userBadgeEarned.user.name).replaceAll('have', 'has')}
            </Typography>

            {/* <Typography variant="caption" color="text.secondary">
              {new Date(userBadgeEarned?.createdAt).toLocaleString()}
            </Typography> */}
          </>
        );

      case "GROUP_ALL_SETTLED":
        return (
          <>
            <Typography variant="h6" color='success' fontWeight="bold">
              ✅ {entry.group?.groupName} All Settled
            </Typography>

            <Typography variant="body1">
              The balance in {entry.group?.groupName} is 0!
            </Typography>

            <Typography variant="caption" color="text.secondary">
              Great job!
            </Typography>

            {/* <Typography variant="caption" color="text.secondary">
              {new Date(userBadgeEarned?.createdAt).toLocaleString()}
            </Typography> */}
          </>
        );

      default:
        return (
          <Typography variant="body2">
            Unknown activity
          </Typography>
        );
    }
  };

  return (
    <Card sx={{ mb: 2, borderRadius: 3, boxShadow: 2 }}>
      <CardContent>
        <Stack spacing={1}>
          {/* Group */}
          {group && (
            <Stack direction="row" spacing={1} alignItems="center">
              <Chip label={group.groupName} size="small" color="primary"/>
            </Stack>
          )}

          <Divider />

          {/* Main Content */}
          {renderContent()}
        </Stack>
      </CardContent>
    </Card>
  );
};

export default FeedEntryCard;