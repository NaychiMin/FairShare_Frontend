import axios from '../api/axios';
import type { FeedEntryFilteredRequestDto, FeedEntryType, FeedPage } from '../types/Feed';

class FeedService {
  async getFeed (page: number, size: number, userId: string, types?: FeedEntryType[]): Promise<FeedPage> {
    const params: FeedEntryFilteredRequestDto = { userId, page, size, sortBy: 'createdDate', direction: 'DESC', types: types && types?.length > 0 ? types : null  };
    if (userId) params.userId = userId;

    const res = await axios.post<FeedPage>('/feed', params);

    return res.data;
  };
}

export default new FeedService();