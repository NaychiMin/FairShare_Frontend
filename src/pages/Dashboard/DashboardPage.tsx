import { useRef, useEffect, useState } from 'react';
import { useInfiniteQuery } from '@tanstack/react-query';
import { useAuth } from '../../context/Authentication/useAuth';
import feedService from '../../services/feedService';
import FeedEntryCard from '../../components/FeedEntryCard';
import { Box, Checkbox, Chip, CircularProgress, Container, FormControl, InputLabel, ListItemText, MenuItem, OutlinedInput, Select } from '@mui/material';
import { FEED_ENTRY_TYPES, type FeedEntryType } from '../../types/Feed';

const PAGE_SIZE = 2;

const useFeed = (userId: string, selectedTypes?: FeedEntryType[]) => {
  return useInfiniteQuery({
    queryKey: ['feed', userId, selectedTypes],
    queryFn: ({ pageParam = 0 }) =>
      feedService.getFeed(pageParam, PAGE_SIZE, userId, selectedTypes),
    getNextPageParam: (lastPage) => {
      if (lastPage.last) return undefined;
      return lastPage.number + 1;
    },
    initialPageParam: 0,
    enabled: !!userId,
  });
};

const DashboardPage = () => {
  const [selectedTypes, setSelectedTypes] = useState<FeedEntryType[]>(FEED_ENTRY_TYPES);
  const { user } = useAuth()
  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useFeed(user?.userId || '', selectedTypes);

  const loadMoreRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!loadMoreRef.current) return;
    if (!hasNextPage) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          fetchNextPage();
        }
      },
      {
        root: null, // use viewport scroll
        rootMargin: '200px', // trigger before reaching bottom
        threshold: 0.1, // 10% visible
      }
    );

    observer.observe(loadMoreRef.current);

    return () => {
      if (loadMoreRef.current) observer.unobserve(loadMoreRef.current);
      observer.disconnect();
    };
  }, [fetchNextPage, hasNextPage, isFetchingNextPage, data]);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [selectedTypes]);

  const feedEntries = data?.pages.flatMap(page => page.content) ?? [];

  const formatFeedType = (type: string): string => {
    return type
      .toLowerCase()
      .split('_')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <FormControl sx={{ mb: 3, minWidth: 250 }}>
        <InputLabel id="feed-type-label">Filter Feed</InputLabel>
        <Select
          labelId="feed-type-label"
          multiple
          value={selectedTypes}
          onChange={(e) => setSelectedTypes(e.target.value as FeedEntryType[])}
          input={<OutlinedInput label="Feed Types" />}
          renderValue={(selected) => (
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
              {(selected as FeedEntryType[]).map((value) => (
                <Chip key={value} label={formatFeedType(value)} />
              ))}
            </Box>
          )}
        >
          {FEED_ENTRY_TYPES.map((type) => (
            <MenuItem key={type} value={type}>
              <Checkbox checked={selectedTypes.includes(type)} />
              <ListItemText primary={formatFeedType(type)} />
            </MenuItem>
          ))}
        </Select>
      </FormControl>
      
      {feedEntries.map((entry) => (
        <FeedEntryCard key={entry.feedEntryId} entry={entry} />
      ))}

      {/* Loader trigger */}
      <div ref={loadMoreRef} style={{ height: 40 }} />

      {isFetchingNextPage && <div style={{ display: "flex", justifyContent: "center", marginBottom: "1rem" }}><CircularProgress size="3rem" /></div>}
      
    </Container>
  );
};

export default DashboardPage;