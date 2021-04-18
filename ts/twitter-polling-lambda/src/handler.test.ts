import { PollingContext, NotificationService, doPollTweets } from './handler';
import { Search, SearchParams, TwitterClient } from 'twitter-api-client';
import { Checkpoint } from './checkpoint';
import { Searchmetadata, Status } from 'twitter-api-client/dist/interfaces/types/SearchTypes';
import { Tweet } from './tweet';

describe('doPollTweets', () => {
  it('should poll correctly', async () => {
    const searchTerm = '#aws';
    const registerCheckpoint: jest.Mock<Promise<Checkpoint>, [Checkpoint, Date]> = jest.fn();
    const latestCheckpoint: jest.Mock<Promise<Checkpoint>, []> = jest.fn();
    const search: jest.Mock<Promise<Search>, [SearchParams]> = jest.fn();
    const sendBatch: jest.Mock<Promise<void>, [Tweet[]]> = jest.fn();

    const currentDate = new Date('2021-02-02T14:00:00Z');
    const context: PollingContext = {
      checkPointService: {
        registerCheckpoint: registerCheckpoint,
        latestCheckpoint: latestCheckpoint,
      },

      twitterClient: ({
        tweets: {
          search: search,
        },
      } as unknown) as TwitterClient,

      notificationService: ({
        sendBatch: sendBatch,
      } as unknown) as NotificationService,

      dateProvider: () => currentDate,
    };

    latestCheckpoint
      .mockResolvedValueOnce({
        searchTerm,
        sinceId: 42,
      })
      .mockResolvedValueOnce({
        searchTerm,
        sinceId: 422,
      });

    search
      .mockResolvedValueOnce({
        search_metadata: {} as Searchmetadata,
        statuses: [
          {
            id: 422,
            text: 'text 1',
            lang: 'en',
            created_at: '2021-01-01T01:00:00.000Z',
          },
        ] as Status[],
      })
      .mockResolvedValueOnce({
        search_metadata: {} as Searchmetadata,
        statuses: [] as Status[],
      });

    await doPollTweets(searchTerm, context);

    const firstCallArgs = [
      [
        {
          searchTerm,
          tweetId: 422,
          text: 'text 1',
          lang: 'en',
          createdAt: '2021-01-01T01:00:00.000Z',
        },
      ],
    ];

    expect(sendBatch.mock.calls).toEqual([firstCallArgs]);

    const expectedRegisterArgs: [Checkpoint, Date] = [{ searchTerm, sinceId: 422 }, currentDate];
    expect(registerCheckpoint.mock.calls).toEqual([expectedRegisterArgs]);
  });
});
