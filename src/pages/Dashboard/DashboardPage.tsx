import React, { useRef, useEffect } from 'react';
import { useInfiniteQuery } from '@tanstack/react-query';
import { useAuth } from '../../context/Authentication/useAuth';
import feedService from '../../services/feedService';
import FeedEntryCard from '../../components/FeedEntryCard';
import { Container } from '@mui/material';

const PAGE_SIZE = 2;

const useFeed = (userId: string) => {
  return useInfiniteQuery({
    queryKey: ['feed', userId],
    queryFn: ({ pageParam = 0 }) =>
      feedService.getFeed(pageParam, PAGE_SIZE, userId),

    getNextPageParam: (lastPage) => lastPage.nextPage,
    initialPageParam: 0,
  });
};

const DashboardPage = () => {
  const { user } = useAuth()
  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useFeed(user?.userId || '');

  const loadMoreRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!hasNextPage) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          fetchNextPage();
        }
      },
      { threshold: 1 }
    );

    if (loadMoreRef.current) {
      observer.observe(loadMoreRef.current);
    }

    return () => observer.disconnect();
  }, [hasNextPage, fetchNextPage]);


  const feedEntries = data?.pages.flatMap(page => page.rows) ?? [];

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {feedEntries.map((entry) => (
        <FeedEntryCard key={entry.feedEntryId} entry={entry} />
      ))}

      {/* Loader trigger */}
      <div ref={loadMoreRef} />

      {isFetchingNextPage && <p>Loading more...</p>}
    </Container>
  );
};

export default DashboardPage;