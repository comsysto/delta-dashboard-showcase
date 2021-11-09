import {
  bucketForTweet,
  BucketHistogram,
  getMinuteIntervalsForFullDay,
  timeLineDataForTweetHistograms,
  tweetHistogram,
} from './tweet-timeline-service';

describe('TweetTimelineService', () => {
  it('tweetHistogram', () => {
    expect(
      tweetHistogram([
        {
          tweetId: { value: '32' },
          createdAt: '2021-06-06T00:21:18.000Z',
          lang: 'en',
          searchTerm: 'serverless',
          text: 'foo',
        },
      ]),
    ).toMatchInlineSnapshot(`
      Object {
        "0": 1,
      }
    `);
  });

  it('timeLineDataForTweetHistograms', () => {
    const searchTerms = ['narf', 'foo'];
    const narfBuckets: BucketHistogram = {
      0: 23,
      120: 42,
    };

    const fooBuckets: BucketHistogram = {
      240: 23,
      0: 14,
    };

    const bucketHistograms = [narfBuckets, fooBuckets];
    expect(timeLineDataForTweetHistograms('2021-05-31', searchTerms, bucketHistograms)).toEqual([
      {
        counts: {
          foo: 14,
          narf: 23,
        },
        endTime: '00:30',
        startTime: '00:00',
      },
      {
        counts: {
          foo: 0,
          narf: 0,
        },
        endTime: '01:00',
        startTime: '00:30',
      },
      {
        counts: {
          foo: 0,
          narf: 0,
        },
        endTime: '01:30',
        startTime: '01:00',
      },
      {
        counts: {
          foo: 0,
          narf: 0,
        },
        endTime: '02:00',
        startTime: '01:30',
      },
      {
        counts: {
          foo: 0,
          narf: 42,
        },
        endTime: '02:30',
        startTime: '02:00',
      },
      {
        counts: {
          foo: 0,
          narf: 0,
        },
        endTime: '03:00',
        startTime: '02:30',
      },
      {
        counts: {
          foo: 0,
          narf: 0,
        },
        endTime: '03:30',
        startTime: '03:00',
      },
      {
        counts: {
          foo: 0,
          narf: 0,
        },
        endTime: '04:00',
        startTime: '03:30',
      },
      {
        counts: {
          foo: 23,
          narf: 0,
        },
        endTime: '04:30',
        startTime: '04:00',
      },
      {
        counts: {
          foo: 0,
          narf: 0,
        },
        endTime: '05:00',
        startTime: '04:30',
      },
      {
        counts: {
          foo: 0,
          narf: 0,
        },
        endTime: '05:30',
        startTime: '05:00',
      },
      {
        counts: {
          foo: 0,
          narf: 0,
        },
        endTime: '06:00',
        startTime: '05:30',
      },
      {
        counts: {
          foo: 0,
          narf: 0,
        },
        endTime: '06:30',
        startTime: '06:00',
      },
      {
        counts: {
          foo: 0,
          narf: 0,
        },
        endTime: '07:00',
        startTime: '06:30',
      },
      {
        counts: {
          foo: 0,
          narf: 0,
        },
        endTime: '07:30',
        startTime: '07:00',
      },
      {
        counts: {
          foo: 0,
          narf: 0,
        },
        endTime: '08:00',
        startTime: '07:30',
      },
      {
        counts: {
          foo: 0,
          narf: 0,
        },
        endTime: '08:30',
        startTime: '08:00',
      },
      {
        counts: {
          foo: 0,
          narf: 0,
        },
        endTime: '09:00',
        startTime: '08:30',
      },
      {
        counts: {
          foo: 0,
          narf: 0,
        },
        endTime: '09:30',
        startTime: '09:00',
      },
      {
        counts: {
          foo: 0,
          narf: 0,
        },
        endTime: '10:00',
        startTime: '09:30',
      },
      {
        counts: {
          foo: 0,
          narf: 0,
        },
        endTime: '10:30',
        startTime: '10:00',
      },
      {
        counts: {
          foo: 0,
          narf: 0,
        },
        endTime: '11:00',
        startTime: '10:30',
      },
      {
        counts: {
          foo: 0,
          narf: 0,
        },
        endTime: '11:30',
        startTime: '11:00',
      },
      {
        counts: {
          foo: 0,
          narf: 0,
        },
        endTime: '12:00',
        startTime: '11:30',
      },
      {
        counts: {
          foo: 0,
          narf: 0,
        },
        endTime: '12:30',
        startTime: '12:00',
      },
      {
        counts: {
          foo: 0,
          narf: 0,
        },
        endTime: '13:00',
        startTime: '12:30',
      },
      {
        counts: {
          foo: 0,
          narf: 0,
        },
        endTime: '13:30',
        startTime: '13:00',
      },
      {
        counts: {
          foo: 0,
          narf: 0,
        },
        endTime: '14:00',
        startTime: '13:30',
      },
      {
        counts: {
          foo: 0,
          narf: 0,
        },
        endTime: '14:30',
        startTime: '14:00',
      },
      {
        counts: {
          foo: 0,
          narf: 0,
        },
        endTime: '15:00',
        startTime: '14:30',
      },
      {
        counts: {
          foo: 0,
          narf: 0,
        },
        endTime: '15:30',
        startTime: '15:00',
      },
      {
        counts: {
          foo: 0,
          narf: 0,
        },
        endTime: '16:00',
        startTime: '15:30',
      },
      {
        counts: {
          foo: 0,
          narf: 0,
        },
        endTime: '16:30',
        startTime: '16:00',
      },
      {
        counts: {
          foo: 0,
          narf: 0,
        },
        endTime: '17:00',
        startTime: '16:30',
      },
      {
        counts: {
          foo: 0,
          narf: 0,
        },
        endTime: '17:30',
        startTime: '17:00',
      },
      {
        counts: {
          foo: 0,
          narf: 0,
        },
        endTime: '18:00',
        startTime: '17:30',
      },
      {
        counts: {
          foo: 0,
          narf: 0,
        },
        endTime: '18:30',
        startTime: '18:00',
      },
      {
        counts: {
          foo: 0,
          narf: 0,
        },
        endTime: '19:00',
        startTime: '18:30',
      },
      {
        counts: {
          foo: 0,
          narf: 0,
        },
        endTime: '19:30',
        startTime: '19:00',
      },
      {
        counts: {
          foo: 0,
          narf: 0,
        },
        endTime: '20:00',
        startTime: '19:30',
      },
      {
        counts: {
          foo: 0,
          narf: 0,
        },
        endTime: '20:30',
        startTime: '20:00',
      },
      {
        counts: {
          foo: 0,
          narf: 0,
        },
        endTime: '21:00',
        startTime: '20:30',
      },
      {
        counts: {
          foo: 0,
          narf: 0,
        },
        endTime: '21:30',
        startTime: '21:00',
      },
      {
        counts: {
          foo: 0,
          narf: 0,
        },
        endTime: '22:00',
        startTime: '21:30',
      },
      {
        counts: {
          foo: 0,
          narf: 0,
        },
        endTime: '22:30',
        startTime: '22:00',
      },
      {
        counts: {
          foo: 0,
          narf: 0,
        },
        endTime: '23:00',
        startTime: '22:30',
      },
      {
        counts: {
          foo: 0,
          narf: 0,
        },
        endTime: '23:30',
        startTime: '23:00',
      },
      {
        counts: {
          foo: 0,
          narf: 0,
        },
        endTime: '00:00',
        startTime: '23:30',
      },
    ]);
  });

  it('bucketForTweet', () => {
    expect(bucketForTweet('2021-05-31T00:05:06Z')).toMatchInlineSnapshot(`0`);
    expect(bucketForTweet('2021-05-31T00:30:00Z')).toMatchInlineSnapshot(`30`);
    expect(bucketForTweet('2021-05-31T23:30:00Z')).toMatchInlineSnapshot(`1410`);
    expect(bucketForTweet('2021-06-06T00:31:18.000Z')).toMatchInlineSnapshot(`30`);
  });

  it('getMinuteIntervalsForFullDay', () => {
    expect(getMinuteIntervalsForFullDay()).toMatchInlineSnapshot(`
      Array [
        0,
        30,
        60,
        90,
        120,
        150,
        180,
        210,
        240,
        270,
        300,
        330,
        360,
        390,
        420,
        450,
        480,
        510,
        540,
        570,
        600,
        630,
        660,
        690,
        720,
        750,
        780,
        810,
        840,
        870,
        900,
        930,
        960,
        990,
        1020,
        1050,
        1080,
        1110,
        1140,
        1170,
        1200,
        1230,
        1260,
        1290,
        1320,
        1350,
        1380,
        1410,
      ]
    `);
  });
});
