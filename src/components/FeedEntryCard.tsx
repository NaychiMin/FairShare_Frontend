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
            <Typography variant="h6">
              💸 Expense Added
            </Typography>

            <Typography variant="body1">
              {expenseAdded?.description}
            </Typography>

            <Typography variant="body2" color="text.secondary">
              Amount: ${expenseAdded?.amount}
            </Typography>
          </>
        );

      case "BADGE_EARNED":
        return (
          <>
            <Typography variant="h6">
              🏅 Badge Earned
            </Typography>

            <Typography variant="body1">
              {userBadgeEarned?.badge?.name}
            </Typography>

            <Typography variant="body2" color="text.secondary">
              {userBadgeEarned?.badge?.description}
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
              <Chip label={group.groupName} size="small" />
              <Chip label={group.category} size="small" variant="outlined" />
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