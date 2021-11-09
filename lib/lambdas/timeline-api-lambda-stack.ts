import * as cdk from "@aws-cdk/core";
import * as iam from "@aws-cdk/aws-iam";
import * as lambda from "@aws-cdk/aws-lambda";
import * as apigateway from "@aws-cdk/aws-apigateway";

export interface TimelineApiLambdaApplicationProps extends cdk.StageProps {
    pathToProjectToBuild: string;
    dynamoDBTableName: string;
    restApiGatewayId: cdk.CfnOutput;
    restApiRootResourceId: cdk.CfnOutput;
}

export class TimelineApiLambdaApplication extends cdk.Stage {
    readonly stack: TimelineApiLambdaStack;

    constructor(scope: cdk.Construct, id: string, props: TimelineApiLambdaApplicationProps) {
        super(scope, id, props);

        this.stack = new TimelineApiLambdaStack(this, `${id}LambdaStack`, props);
    }
}

interface TimelineApiLambdaStackStackProps extends cdk.StackProps {
    pathToProjectToBuild: string;
    dynamoDBTableName: string;
    restApiGatewayId: cdk.CfnOutput;
    restApiRootResourceId: cdk.CfnOutput;
}

class TimelineApiLambdaStack extends cdk.Stack {
    readonly methods: apigateway.Method[];

    readonly functionArn: cdk.CfnOutput;

    constructor(scope: cdk.Construct, id: string, props: TimelineApiLambdaStackStackProps) {
        super(scope, id, props);

        const executionRole = new iam.Role(this, `LambdaExecutionRole`, {
            assumedBy: new iam.ServicePrincipal("lambda.amazonaws.com"),
            managedPolicies: [
                iam.ManagedPolicy.fromAwsManagedPolicyName("AmazonDynamoDBReadOnlyAccess"),
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
            },
            role: executionRole,
            memorySize: 512,
            tracing: lambda.Tracing.PASS_THROUGH,
        });

        this.functionArn = new cdk.CfnOutput(this, "lambdaArn", {
            value: lambdaFunction.functionArn,
            exportName: "lambdaArn",
        });
    }
}
