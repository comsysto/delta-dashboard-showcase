import * as cdk from "@aws-cdk/core";
import * as iam from "@aws-cdk/aws-iam";
import * as lambda from "@aws-cdk/aws-lambda";
import * as ssm from "@aws-cdk/aws-ssm";
import * as eventsTargets from "@aws-cdk/aws-events-targets";
import * as events from "@aws-cdk/aws-events";

export interface TwitterPollingLambdaApplicationProps extends cdk.StageProps {
    pathToProjectToBuild: string;
    dynamoDBTableName: string;
    queueUrl: cdk.CfnOutput;
}

export class TwitterPollingLambdaApplication extends cdk.Stage {
    constructor(scope: cdk.Construct, id: string, props: TwitterPollingLambdaApplicationProps) {
        super(scope, id, props);

        new TwitterPollingLambdaStack(this, `${id}LambdaStack`, props);
    }
}

interface TwitterPollingLambdaStackProps extends cdk.StackProps {
    pathToProjectToBuild: string;
    dynamoDBTableName: string;
    queueUrl: cdk.CfnOutput;
}

class TwitterPollingLambdaStack extends cdk.Stack {
    constructor(scope: cdk.Construct, id: string, props: TwitterPollingLambdaStackProps) {
        super(scope, id, props);

        const executionRole = new iam.Role(this, `LambdaExecutionRole`, {
            assumedBy: new iam.ServicePrincipal("lambda.amazonaws.com"),
            managedPolicies: [
                iam.ManagedPolicy.fromAwsManagedPolicyName("AmazonDynamoDBFullAccess"),
                iam.ManagedPolicy.fromAwsManagedPolicyName("AmazonSQSFullAccess"),
                iam.ManagedPolicy.fromAwsManagedPolicyName("service-role/AWSLambdaBasicExecutionRole"),
            ],
        });

        const lambdaFunction = new lambda.Function(this, `${id}Lambda`, {
            runtime: lambda.Runtime.NODEJS_12_X,
            code: lambda.Code.fromAsset(`${props.pathToProjectToBuild}/out`),
            handler: "bundle.handler",
            environment: {
                NODE_OPTIONS: "--enable-source-maps",
                TABLE_NAME: props.dynamoDBTableName,
                QUEUE_URL: props.queueUrl.importValue,
                TWITTER_ACCESS_TOKEN: ssm.StringParameter.valueForStringParameter(
                    this,
                    "/dashboard-showcase/twitter/token"
                ),
                TWITTER_ACCESS_TOKEN_SECRET: ssm.StringParameter.valueForStringParameter(
                    this,
                    "/dashboard-showcase/twitter/token-secret"
                ),
                TWITTER_APIKEY: ssm.StringParameter.valueForStringParameter(
                    this,
                    "/dashboard-showcase/twitter/api-key"
                ),
                TWITTER_APISECRET: ssm.StringParameter.valueForStringParameter(
                    this,
                    "/dashboard-showcase/twitter/api-secret"
                ),
            },
            role: executionRole,
            tracing: lambda.Tracing.PASS_THROUGH,
        });

        const eventTargets = ["aws", "serverless", "kubernetes"].map(
            (term) =>
                new eventsTargets.LambdaFunction(lambdaFunction, {
                    event: events.RuleTargetInput.fromObject({ searchTerm: term }),
                })
        );

        new events.Rule(this, "TwitterPollingLambdaScheduledRule", {
            targets: eventTargets,
            enabled: true,
            schedule: events.Schedule.rate(cdk.Duration.minutes(30)),
        });
    }
}
