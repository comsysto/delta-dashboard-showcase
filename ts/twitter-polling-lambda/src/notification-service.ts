import { SendMessageBatchCommand, SendMessageBatchRequestEntry, SQSClient } from '@aws-sdk/client-sqs';
import { Tweet } from './tweet';

export class NotificationService {
  constructor(private client: SQSClient, private url: string) {}

  async sendBatch(batch: Tweet[]) {
    const result = await this.client.send(
      new SendMessageBatchCommand({
        QueueUrl: this.url,
        Entries: batch.map(toMessage),
      }),
    );

    if (result.Failed) {
      throw new Error(`batch write has failed with messages ${result.Failed.map((value) => value.Message).join(',')}`);
    }
  }
}

const toMessage = (tweet: Tweet): SendMessageBatchRequestEntry => ({
  Id: `${tweet.tweetId}`,
  MessageBody: JSON.stringify(tweet),
});
