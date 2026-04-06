import axios from '../api/axios';
import type { FeedEntryFilteredRequestDto, FeedPage } from '../types/Feed';

class FeedService {
  async getFeed (page: number, size: number, userId: string): Promise<FeedPage> {
    const params: FeedEntryFilteredRequestDto = { userId, page, size, sortBy: 'createdDate', direction: 'DESC' };
    if (userId) params.userId = userId;

    const res = await axios.post<FeedPage>('/feed', params);

    return res.data;
  };
}

export default new FeedService();