import * as cdk from "@aws-cdk/core";
import * as iam from "@aws-cdk/aws-iam";
import * as lambda from "@aws-cdk/aws-lambda";
import * as sqs from "@aws-cdk/aws-sqs";
import * as lambdaEventSources from "@aws-cdk/aws-lambda-event-sources";

export interface TwitterStoringLambdaApplicationProps extends cdk.StageProps {
    pathToProjectToBuild: string;
    dynamoDBTableName: string;
    queueArn: cdk.CfnOutput;
}

export class TwitterStoringLambdaApplication extends cdk.Stage {
    constructor(scope: cdk.Construct, id: string, props: TwitterStoringLambdaApplicationProps) {
        super(scope, id, props);

        new TwitterStoringLambdaStack(this, `${id}LambdaStack`, props);
    }
}

interface TwitterStoringLambdaStackProps extends cdk.StackProps {
    pathToProjectToBuild: string;
    dynamoDBTableName: string;
    queueArn: cdk.CfnOutput;
}

class TwitterStoringLambdaStack extends cdk.Stack {
    constructor(scope: cdk.Construct, id: string, props: TwitterStoringLambdaStackProps) {
        super(scope, id, props);

        const executionRole = new iam.Role(this, `LambdaExecutionRole`, {
            assumedBy: new iam.ServicePrincipal("lambda.amazonaws.com"),
            managedPolicies: [
                iam.ManagedPolicy.fromAwsManagedPolicyName("AmazonDynamoDBFullAccess"),
                iam.ManagedPolicy.fromAwsManagedPolicyName("service-role/AWSLambdaBasicExecutionRole"),
            ],
        });

        const tweetsQueue = sqs.Queue.fromQueueArn(
            this,
            "TwitterShowcaseTriggerQueue",
            props.queueArn.importValue
        );

        const tweetsQueueEventSource = new lambdaEventSources.SqsEventSource(tweetsQueue);

        new lambda.Function(this, `${id}Lambda`, {
            runtime: lambda.Runtime.NODEJS_12_X,
            code: lambda.Code.fromAsset(`${props.pathToProjectToBuild}/out`),
            handler: "bundle.handler",
            environment: {
                NODE_OPTIONS: "--enable-source-maps",
                TABLE_NAME: props.dynamoDBTableName,
            },
            role: executionRole,
            events: [tweetsQueueEventSource],
            tracing: lambda.Tracing.PASS_THROUGH,
        });
    }
}
