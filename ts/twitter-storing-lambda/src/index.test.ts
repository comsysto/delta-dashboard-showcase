import { handler } from "./index";
import { SQSEvent } from "aws-lambda";
import { Tweet } from "./model/tweet";

const mockSave = jest.fn().mockReturnValue(Promise.resolve([1, 2, 3]));
jest.mock("./tweet-repository", () => {
    return jest.fn().mockImplementation(() => {
        return { save: mockSave };
    });
});

describe("index test", () => {
    beforeAll(() => {
        process.env.AWS_REGION = "eu-central-1";
    });

    beforeEach(() => {
        mockSave.mockClear();
    });

    xit("save method of repository should be called with the tweets from the message body", async () => {
        const tweets = createBody("", 10);
        const event = createEventWithBody(tweets);
        await handler(event);

        expect(mockSave).toHaveBeenCalledTimes(1);
        expect(mockSave).toHaveBeenCalledWith(tweets);
    });

    it("handler should return the resolved promise result from save method", async () => {
        const tweets = createBody("comsysto", 10);
        const event = createEventWithBody(tweets);
        const result = await handler(event);

        expect(result.sort()).toEqual([1, 2, 3]);
    });

    const createEventWithBody = (body: Tweet[]): SQSEvent => ({
        Records: [
            {
                messageId: "19dd0b57-b21e-4ac1-bd88-01bbb068cb78",
                receiptHandle: "MessageReceiptHandle",
                body: JSON.stringify(body),
                attributes: {
                    ApproximateReceiveCount: "1",
                    SentTimestamp: "1523232000000",
                    SenderId: "123456789012",
                    ApproximateFirstReceiveTimestamp: "1523232000001"
                },
                messageAttributes: {},
                md5OfBody: "{{{md5_of_body}}}",
                eventSource: "aws:sqs",
                eventSourceARN: "arn:aws:sqs:eu-central-1:123456789012:MyQueue",
                awsRegion: "eu-central-1"
            }
        ]
    });

    const createBody = (searchTerm: string, count: number): Tweet[] => {
        return Array.from(Array(count)).map(randomTweetCreator(searchTerm));
    };

    const randomTweetCreator = (searchTerm: string) => (): Tweet => {
        const startDate = new Date(2020, 0, 1);
        const endDate = new Date(2021, 0, 31);
        const randomDate = new Date(startDate.getTime() + Math.random() * (endDate.getTime() - startDate.getTime()));
        const randomId = Math.floor(Math.random() * 10000);

        return {
            createdAt: randomDate.toISOString(),
            lang: "en",
            searchTerm,
            text: `${searchTerm} is so cool!`,
            tweetId: randomId
        };
    };
});
