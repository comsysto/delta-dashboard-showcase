import TweetRepository, { Tweet } from './tweet-repository';

const MINUTES_PER_DAY = 1440;
const MINUTES_INTERVAL = 30;

type TweetTimelineData = {
  startTime: string;
  endTime: string;
  counts: TweetCounts;
};

type TweetCounts = Record<string, number>;

export type BucketHistogram = { [bucket: number]: number };

export const tweetHistogram = (tweets: Tweet[]) =>
  tweets
    .map((tweet) => tweet.createdAt)
    .map(bucketForTweet)
    .reduce<BucketHistogram>(
      (histogram, bucketNumber) => ({
        ...histogram,
        [bucketNumber]: (histogram[bucketNumber] || 0) + 1,
      }),
      {},
    );

export const bucketForTweet = (createdAt: string): number => {
  const millisFromMidnight = new Date(createdAt).getTime() - new Date(createdAt).setUTCHours(0, 0, 0, 0);
  return Math.floor(millisFromMidnight / 1000 / 60 / 30) * 30;
};

export const getMinuteIntervalsForFullDay = (): number[] => {
  const intervalsPerDay = Math.ceil(MINUTES_PER_DAY / MINUTES_INTERVAL);
  return Array.from(new Array(intervalsPerDay)).map((_, index) => {
    return index * MINUTES_INTERVAL;
  });
};

const getDateForMinutes = (date: string, minutes: number) =>
  new Date(new Date(`${date}T00:00:00Z`).getTime() + minutes * 60 * 1000);

const getTimePartOfIsoDateTime = (isoString: string): string => isoString.slice(isoString.indexOf('T') + 1).slice(0, 5);

export const timeLineDataForTweetHistograms = (date: string, searchTerms: string[], results: BucketHistogram[]) => {
  const tweetsPerSearchTerm = searchTerms.reduce<Record<string, BucketHistogram>>((accumulator, searchTerm, index) => {
    accumulator[searchTerm] = results[index];
    return accumulator;
  }, {});

  const intervalsForFullDay = getMinuteIntervalsForFullDay();

  return intervalsForFullDay.map<TweetTimelineData>((interval) => {
    const startDate = getDateForMinutes(date, interval);
    const endDate = getDateForMinutes(date, Math.min(interval + MINUTES_INTERVAL, MINUTES_PER_DAY));

    return {
      startTime: getTimePartOfIsoDateTime(startDate.toISOString()),
      endTime: getTimePartOfIsoDateTime(endDate.toISOString()),
      counts: Object.keys(tweetsPerSearchTerm).reduce<TweetCounts>(
        (acc, key) => ({
          ...acc,
          [key]: tweetsPerSearchTerm[key]?.[interval] || 0,
        }),
        {},
      ),
    };
  });
};

export default class TweetTimelineService {
  public constructor(private readonly tweetRepository: TweetRepository) {}

  public getTimelineData = async (date: string, searchTerms: string[]): Promise<TweetTimelineData[]> => {
    const results = await Promise.all(
      searchTerms.map((searchTerm) =>
        this.tweetRepository.getTweetsForDateAndSearchTerm(date, searchTerm).then(tweetHistogram),
      ),
    );

    return timeLineDataForTweetHistograms(date, searchTerms, results);
  };
}
