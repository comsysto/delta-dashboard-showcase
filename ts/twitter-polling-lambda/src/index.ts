import { CheckpointService } from './checkpoint-service';
import { NotificationService } from './notification-service';
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { SQSClient } from '@aws-sdk/client-sqs';
import { TwitterClient } from 'twitter-api-client';
import { doPollTweets } from './handler';

const tableName = process.env['TABLE_NAME'];
const queueUrl: string = process.env['QUEUE_URL'];

const accessToken = process.env['TWITTER_ACCESS_TOKEN'];
const accessTokenSecret = process.env['TWITTER_ACCESS_TOKEN_SECRET'];
const apiKey = process.env['TWITTER_APIKEY'];
const apiSecret = process.env['TWITTER_APISECRET'];

const dynamoDB = new DynamoDBClient({
  region: process.env.AWS_REGION,
});

const sqsClient: SQSClient = new SQSClient({
  region: process.env.AWS_REGION,
});

const context = {
  checkPointService: new CheckpointService(tableName, dynamoDB),
  notificationService: new NotificationService(sqsClient, queueUrl),
  twitterClient: new TwitterClient({
    accessToken,
    accessTokenSecret,
    apiKey,
    apiSecret,
  }),
  dateProvider: () => new Date(),
};

type InputEvent = {
  searchTerm: string;
};

export const handler = async (event: InputEvent): Promise<void> => {
  try {
    await doPollTweets(event.searchTerm, context);
  } catch (e) {
    console.log(`Error in handler ${JSON.stringify(e)}`);
    throw e;
  }
};
