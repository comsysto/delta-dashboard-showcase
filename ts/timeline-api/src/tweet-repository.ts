import { AttributeValue, DynamoDBClient, QueryCommand, QueryCommandInput } from '@aws-sdk/client-dynamodb';
import { marshall, unmarshall } from '@aws-sdk/util-dynamodb';

type TweetId = {
  value: string;
};

export type Tweet = {
  searchTerm: string;
  tweetId: TweetId;
  text: string;
  lang: string;
  createdAt: string;
};

export default class TweetRepository {
  private static readonly MatchAtDayAndSearch = 'Tweet:Match:DayAndSearch';

  constructor(private readonly client: DynamoDBClient, private readonly tableName: string) {}

  public getTweetsForDateAndSearchTerm = async (date: string, searchTerm: string): Promise<Tweet[]> => {
    const params: QueryCommandInput = {
      KeyConditionExpression: 'partitionKey = :partitionKey',
      ExpressionAttributeValues: marshall({
        ':partitionKey': TweetRepository.createPartitionKey(date, searchTerm),
      }),
      ProjectionExpression: 'sortKey, createdAt',
      TableName: this.tableName,
    };

    const items = await this.getAllByCommandInput(params);
    return items.map((item) => unmarshall(item, { wrapNumbers: true }) as Tweet);
  };

  private getAllByCommandInput = async (
    commandInput: QueryCommandInput,
  ): Promise<{ [key: string]: AttributeValue }[]> => {
    const queryCommandOutput = await this.client.send(new QueryCommand(commandInput));

    return [
      ...queryCommandOutput.Items,
      ...(queryCommandOutput.LastEvaluatedKey
        ? await this.getAllByCommandInput({
            ...commandInput,
            ExclusiveStartKey: queryCommandOutput.LastEvaluatedKey,
          })
        : []),
    ];
  };

  private static createPartitionKey(date: string, searchTerm: string) {
    return `${TweetRepository.MatchAtDayAndSearch}:${date}:${searchTerm}`;
  }
}
