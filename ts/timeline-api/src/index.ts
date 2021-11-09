import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { APIGatewayEvent, APIGatewayProxyResult } from 'aws-lambda';
import { extractQueryParams } from './query-param-utils';
import TweetRepository from './tweet-repository';
import TweetTimelineService from './tweet-timeline-service';
import { captureAWSv3Client } from 'aws-xray-sdk-core';

export const handler = async (event: APIGatewayEvent): Promise<APIGatewayProxyResult> => {
  try {
    const { searchTerms, date } = extractQueryParams(event);
    const dynamoDbClient = captureAWSv3Client(new DynamoDBClient({ region: process.env.AWS_REGION }));
    const tableName = process.env.TABLE_NAME;
    const tweetRepository = new TweetRepository(dynamoDbClient, tableName);
    const tweetTimelineService = new TweetTimelineService(tweetRepository);

    const timeLineData = await tweetTimelineService.getTimelineData(date, searchTerms);

    return {
      statusCode: 200,
      body: JSON.stringify(timeLineData),
    };
  } catch (e) {
    console.error(`Error in handler ${JSON.stringify(e)}`);
    return {
      statusCode: 500,
      body: JSON.stringify(e.message),
    };
  }
};
