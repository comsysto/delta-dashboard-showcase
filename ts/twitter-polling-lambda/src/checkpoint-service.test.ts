import { launch, stop } from 'dynamodb-local';
import { CheckpointService } from './checkpoint-service';
import { DescribeTableCommandOutput, DynamoDB, DynamoDBClientConfig } from '@aws-sdk/client-dynamodb';
import { marshall, unmarshall } from '@aws-sdk/util-dynamodb';
import * as net from 'net';

const DYNAMODB_PORT = 8000;

jest.setTimeout(20000);

describe('checkpoint service', () => {
  let dynamoDB: DynamoDB;
  let testee: CheckpointService;

  beforeAll(async () => {
    const dynamoDBProcess = await launch(DYNAMODB_PORT, null, ['-inMemory'], true, false);

    dynamoDBProcess.stdout.on('data', (d) => {
      console.log(`${d.toString()}`);
    });

    const checkConnection = (host: string, port: number) => {
      return new Promise(function (resolve, reject) {
        const socket = net.createConnection(port, host, function () {
          resolve(null);
          socket.destroy();
        });
        socket.on('error', function (err) {
          reject(err);
          socket.destroy();
        });
      });
    };

    let success = false;
    do {
      try {
        await checkConnection('localhost', 8000);
        success = true;
      } catch (e) {}
    } while (!success);
  });

  afterAll(async () => await stop(DYNAMODB_PORT));
  afterEach(async () => await dynamoDB.deleteTable({ TableName: 'tweets' }));
  beforeEach(async () => {
    const configuration: DynamoDBClientConfig = {
      region: 'local',
      endpoint: 'http://localhost:8000',

      tls: false,
      credentials: {
        accessKeyId: 'fakeAccessKey',
        secretAccessKey: 'fake',
      },
    };
    dynamoDB = new DynamoDB(configuration);
    await dynamoDB.createTable({
      TableName: 'tweets',
      StreamSpecification: {
        StreamEnabled: true,
        StreamViewType: 'KEYS_ONLY',
      },

      KeySchema: [
        {
          AttributeName: 'partitionKey',
          KeyType: 'HASH',
        },
        {
          AttributeName: 'sortKey',
          KeyType: 'RANGE',
        },
      ],
      AttributeDefinitions: [
        {
          AttributeName: 'partitionKey',
          AttributeType: 'S',
        },
        {
          AttributeName: 'sortKey',
          AttributeType: 'S',
        },
      ],
      BillingMode: 'PROVISIONED',
      ProvisionedThroughput: {
        ReadCapacityUnits: 1,
        WriteCapacityUnits: 1,
      },
    });

    let status: DescribeTableCommandOutput;
    do {
      status = await dynamoDB.describeTable({ TableName: 'tweets' });
    } while (status.Table.TableStatus !== 'ACTIVE');
    testee = new CheckpointService('tweets', dynamoDB);
  });

  it('should register checkpoint', async () => {
    const checkpoint = {
      searchTerm: 'narf',
      sinceId: 1370000576226951200,
    };

    const result = await testee.registerCheckpoint(checkpoint, new Date(Date.parse('2020-12-03T10:15:30.00Z')));

    expect(result).toEqual(checkpoint);

    const { Items: checkpointsInTable } = await dynamoDB.query({
      TableName: 'tweets',
      KeyConditionExpression: 'partitionKey = :pk',
      ExpressionAttributeValues: marshall({
        ':pk': 'Checkpoint:search:narf',
      }),
    });

    expect(
      checkpointsInTable
        .map((it) => unmarshall(it))
        .map((e) => ({
          ...e,
          sinceId: Number(e.sinceId),
        })),
    ).toEqual([
      {
        ...checkpoint,
        partitionKey: 'Checkpoint:search:narf',
        sortKey: 'Checkpoint:date:2020-12-03T10:15:30.000Z',
      },
    ]);
  });

  it('should return the latest checkpoint', async () => {
    const checkPoint1 = {
      partitionKey: 'Checkpoint:search:narf',
      sortKey: 'Checkpoint:date:2020-12-03T10:15:31Z',
      searchTerm: 'narf',
      sinceId: 200,
      maxId: 300,
      exhausted: false,
      nextSinceId: 250,
    };
    const checkPoint2 = {
      partitionKey: 'Checkpoint:search:narf',
      sortKey: 'Checkpoint:date:2020-12-03T10:15:30Z',
      searchTerm: 'narf',
      sinceId: 100,
      maxId: 200,
      exhausted: false,
      nextSinceId: 150,
    };

    await Promise.all(
      [checkPoint1, checkPoint2].map((it) =>
        dynamoDB.putItem({
          TableName: 'tweets',
          Item: marshall(it),
        }),
      ),
    );

    const latestCheckpoint = await testee.latestCheckpoint('narf');

    expect(latestCheckpoint).toEqual(checkPoint1);
  });

  it('should return initial checkpoint for unknown searchTerm', async () => {
    const checkpoint = await testee.latestCheckpoint('foo');

    expect(checkpoint).toEqual({
      searchTerm: 'foo',
      sinceId: 0,
    });
  });
});
