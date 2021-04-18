import { Checkpoint } from './checkpoint';
import { TwitterClient } from 'twitter-api-client';
import { Tweet } from './tweet';

const SEARCH_BATCH_SIZE = 100;
const NOTIFICATION_BATCH_SIZE = 10;

export interface CheckpointService {
  registerCheckpoint(checkpoint: Checkpoint, date: Date): Promise<Checkpoint>;

  latestCheckpoint(searchTerm: string): Promise<Checkpoint>;
}

export interface NotificationService {
  sendBatch(batch: Tweet[]): Promise<void>;
}

export interface PollingContext {
  checkPointService: CheckpointService;
  twitterClient: TwitterClient;
  notificationService: NotificationService;
  dateProvider: () => Date;
}

export async function doPollTweets(searchTerm: string, context: PollingContext): Promise<void> {
  const { checkPointService, twitterClient, notificationService, dateProvider } = context;
  let lastResultCount = 0;
  let checkpoint = await checkPointService.latestCheckpoint(searchTerm);
  do {
    //attention: this search logic is not properly addressing the case that we can not fully ingest all tweets during one execution
    const searchResult = await twitterClient.tweets.search({
      q: checkpoint.searchTerm,
      since_id: checkpoint.sinceId,
      count: SEARCH_BATCH_SIZE,
      result_type: 'recent',
    });
    lastResultCount = searchResult.statuses.length;

    if (lastResultCount > 0) {
      checkpoint = {
        sinceId: Math.max(...searchResult.statuses.map((e) => e.id)),
        searchTerm: searchTerm,
      };
      const statusMessages = searchResult.statuses;

      while (statusMessages.length > 0) {
        const notificationBatch = statusMessages.splice(0, NOTIFICATION_BATCH_SIZE).map((status) => ({
          createdAt: new Date(status.created_at).toISOString(),
          lang: status.lang,
          searchTerm: searchTerm,
          text: status.text,
          tweetId: status.id,
        }));
        await notificationService.sendBatch(notificationBatch);
      }

      await checkPointService.registerCheckpoint(checkpoint, dateProvider());
    }
  } while (lastResultCount > 0);
}
