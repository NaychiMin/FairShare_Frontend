import axios from '../api/axios';
import type { FeedEntry, FeedEntryFilteredRequestDto, FeedPage } from '../types/Feed';

class FeedService {
  async getFeed (page: number, size: number, userId: string): Promise<{ rows: FeedEntry[]; nextPage: number | undefined }> {
    const params: FeedEntryFilteredRequestDto = { userId, page, size, sortBy: 'createdDate', direction: 'DESC' };
    if (userId) params.userId = userId;

    const res = await axios.post<FeedPage>('/feed', params);

    return {
      rows: res.data.content,
      nextPage: page + 1 < res.data.totalPages ? page + 1 : undefined,
    };
  };
}

export default new FeedService();