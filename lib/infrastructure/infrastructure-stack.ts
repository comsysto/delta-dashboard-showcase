import * as cdk from "@aws-cdk/core";
import * as dynamodb from "@aws-cdk/aws-dynamodb";
import * as sqs from "@aws-cdk/aws-sqs";

export class InfrastructureStack extends cdk.Stack {
    public readonly dynamoDbTableName: string;
    public readonly queueName: string;
    public readonly queueUrl: cdk.CfnOutput;
    public readonly queueArn: cdk.CfnOutput;

    constructor(scope: cdk.Construct, id: string, props?: cdk.StackProps) {
        super(scope, id, props);

        this.dynamoDbTableName = `${id}-DashboardShowcase`;
        this.queueName = `${id}-test-twitter-showcase-tweets`;

        const tweetsQueue = new sqs.Queue(this, "TwitterShowcaseTweetsQueue", {
            queueName: this.queueName,
        });

        this.queueUrl = new cdk.CfnOutput(this, "queueUrl", {
            exportName: `${id}-queueUrl`,
            value: tweetsQueue.queueUrl,
        });

        this.queueArn = new cdk.CfnOutput(this, "queueArn", {
            exportName: `${id}-queueArn`,
            value: tweetsQueue.queueArn,
        });

        new dynamodb.Table(this, "DashboardShowcaseDynamoDBTable", {
            partitionKey: {
                name: "partitionKey",
                type: dynamodb.AttributeType.STRING,
            },
            sortKey: {
                name: "sortKey",
                type: dynamodb.AttributeType.STRING,
            },
            billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,
            encryption: dynamodb.TableEncryption.AWS_MANAGED,
            removalPolicy: cdk.RemovalPolicy.RETAIN,
            tableName: this.dynamoDbTableName,
        });
    }
}
