import React, { useRef, useEffect } from 'react';
import { useInfiniteQuery } from '@tanstack/react-query';
import { useAuth } from '../../context/Authentication/useAuth';
import feedService from '../../services/feedService';
import FeedEntryCard from '../../components/FeedEntryCard';
import { CircularProgress, Container } from '@mui/material';

const PAGE_SIZE = 2;

const useFeed = (userId: string) => {
  return useInfiniteQuery({
    queryKey: ['feed', userId],
    queryFn: ({ pageParam = 0 }) =>
      feedService.getFeed(pageParam, PAGE_SIZE, userId),
    getNextPageParam: (lastPage) => {
      if (lastPage.last) return undefined;
      return lastPage.number + 1;
    },
    initialPageParam: 0,
    enabled: !!userId,
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

  const feedEntries = data?.pages.flatMap(page => page.content) ?? [];

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
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