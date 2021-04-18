import { AttributeValue, DynamoDBClient, PutItemCommand, QueryCommand } from '@aws-sdk/client-dynamodb';
import { marshall, unmarshall } from '@aws-sdk/util-dynamodb';
import { Checkpoint } from './checkpoint';

export class CheckpointService {
  constructor(private tableName: string, private dynamoDB: DynamoDBClient) {}

  async registerCheckpoint(checkpoint: Checkpoint, date: Date): Promise<Checkpoint> {
    await this.dynamoDB.send(
      new PutItemCommand({
        TableName: this.tableName,
        Item: toCheckpointItem(checkpoint, date),
      }),
    );

    return checkpoint;
  }

  async latestCheckpoint(searchTerm: string): Promise<Checkpoint> {
    const { Items: items } = await this.dynamoDB.send(
      new QueryCommand({
        TableName: this.tableName,
        KeyConditionExpression: 'partitionKey = :pk',
        ExpressionAttributeValues: marshall({
          ':pk': partitionKey(searchTerm),
        }),
        ScanIndexForward: false,
        Limit: 1,
      }),
    );

    const [checkpointItem] = items;

    if (checkpointItem) {
      return toCheckpoint(checkpointItem as CheckpointItem);
    }
    return {
      searchTerm: searchTerm,
      sinceId: 0,
    };
  }
}

const toCheckpointItem = (checkpoint: Checkpoint, date: Date): CheckpointItem =>
  marshall({
    partitionKey: partitionKey(checkpoint.searchTerm),
    sortKey: sortKey(date),
    searchTerm: checkpoint.searchTerm,
    sinceId: BigInt(checkpoint.sinceId),
  }) as CheckpointItem;

const toCheckpoint = (item: CheckpointItem): Checkpoint => unmarshall(item) as Checkpoint;
const partitionKey = (searchTerm: string) => `Checkpoint:search:${searchTerm}`;
const sortKey = (date: Date) => `Checkpoint:date:${date.toISOString()}`;

type CheckpointItem = {
  partitionKey: AttributeValue.SMember;
  sortKey: AttributeValue.SMember;
  searchTerm: AttributeValue.SMember;
  sinceId: AttributeValue.NMember;
};
