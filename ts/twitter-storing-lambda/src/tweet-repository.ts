import { BatchWriteItemCommand, BatchWriteItemOutput, DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { Tweet } from "./model/tweet";
import chunk from "./util/chunk";
import { getDatePartOfIsoDateTime, getTimePartOfIsoDateTime } from "./util/iso-date";
import { marshall } from "@aws-sdk/util-dynamodb";

const CHUNK_SIZE = 20;

export default class TweetRepository {
    private static readonly MatchAtDayAndSearch = "Tweet:Match:DayAndSearch";
    private static readonly MatchAtTimeAndId = "Tweet:Match:Time";

    constructor(private readonly client: DynamoDBClient, private readonly tableName: string) {}

    public save = (tweets: Tweet[]): Promise<(BatchWriteItemOutput | undefined)[]> => {
        const writeBatchPromises = chunk(tweets, CHUNK_SIZE).map(this.writeBatch);

        console.info(`waiting for  ${writeBatchPromises.length} batches of size ${CHUNK_SIZE} each to be stored...`);

        return Promise.all(writeBatchPromises);
    };

    private writeBatch = async (chunk: Tweet[]): Promise<BatchWriteItemOutput | undefined> => {
        const requestItems = chunk.map((tweet) => {
            const item = marshall({
                partitionKey: TweetRepository.createPartitionKey(tweet.createdAt, tweet.searchTerm),
                sortKey: TweetRepository.createSortKey(tweet.createdAt, tweet.tweetId),
                tweetId: BigInt(tweet.tweetId),
                searchTerm: tweet.searchTerm,
                text: tweet.text,
                createdAt: tweet.createdAt
            });

            console.info(`mapped dynamo item to be stored:\n${JSON.stringify(item)}`);

            return {
                PutRequest: {
                    Item: item
                }
            };
        });

        const params = {
            RequestItems: {
                [this.tableName]: requestItems
            }
        };

        const batchWriteItemCommand = new BatchWriteItemCommand(params);

        return await this.client.send(batchWriteItemCommand);
    };

    private static createPartitionKey(isoString: string, searchTerm: string) {
        return `${TweetRepository.MatchAtDayAndSearch}:${getDatePartOfIsoDateTime(isoString)}:${searchTerm}`;
    }

    private static createSortKey(isoString: string, tweetId: number) {
        return `${TweetRepository.MatchAtTimeAndId}:${getTimePartOfIsoDateTime(isoString)}:${tweetId}"`;
    }
}
