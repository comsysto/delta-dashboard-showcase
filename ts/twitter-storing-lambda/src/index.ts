import { SQSEvent } from "aws-lambda";
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { Tweet } from "./model/tweet";
import TweetRepository from "./tweet-repository";

export const handler = async (event: SQSEvent) => {
    const dynamoDbClient = new DynamoDBClient({ region: process.env.AWS_REGION });
    const tableName = process.env.TABLE_NAME;
    const repository = new TweetRepository(dynamoDbClient, tableName);
    console.log("Received Event:", JSON.stringify(event));

    const tweets: Tweet[] = event.Records.map(record => JSON.parse(record.body));

    console.info(`received ${tweets.length} from SQS, storing...`);

    return await repository.save(tweets);
};
