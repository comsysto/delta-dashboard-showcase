import * as cdk from "@aws-cdk/core";
import {InfrastructureStack} from "./infrastructure/infrastructure-stack";
import {YarnPipelineStack} from "./lambdas/yarn-pipeline-stack";
import {ApiGatewayStack} from "./rest-api/api-gateway-stack";
import {TwitterPollingLambdaApplication} from "./lambdas/twitter-polling-lambda-stack";
import {TimelineUiApplication} from "./ui/timeline-ui-stack";
import {TwitterStoringLambdaApplication} from "./lambdas/twitter-storing-lambda-stack";
import {TimelineApiLambdaApplication} from "./lambdas/timeline-api-lambda-stack";

export const buildApp = (app: cdk.App, repo: string, branch: string, owner: string) => {
    const region = app.region ?? "eu-west-1";

    const infrastructureStack = new InfrastructureStack(app, `InfrastructureStack`, {
        env: {
            region
        }
    });

    const repoProps = {
        repo,
        owner,
        gitHubAccessParameter: "/dashboard-showcase/git-hub-token",
        branch,
    };

    const pollingLambdaStack = new YarnPipelineStack(app, `PipelineTwitterPollingLambdaStack`, {
        env: {
            region,
        },
        ...repoProps,
        pathToProjectToBuild: "ts/twitter-polling-lambda",
    });

    pollingLambdaStack.pipeline.addApplicationStage(
        new TwitterPollingLambdaApplication(pollingLambdaStack, `TwitterPollingLambdaApplication`, {
            dynamoDBTableName: infrastructureStack.dynamoDbTableName,
            queueUrl: infrastructureStack.queueUrl,
            pathToProjectToBuild: "ts/twitter-polling-lambda",
        })
    );

    const storingLambdaPipelineStack = new YarnPipelineStack(
        app,
        `PipelineTwitterStoringLambdaStack`,
        {
            env: {
                region,
            },
            pathToProjectToBuild: "ts/twitter-storing-lambda",
            ...repoProps,
        }
    );

    const timelineUiPipelineStack = new YarnPipelineStack(app, `TimelineUiPipelineStack`, {
        env: {
            region,
        },
        pathToProjectToBuild: "ts/timeline-ui",
        ...repoProps,
    });

    const uiApplication = new TimelineUiApplication(
        timelineUiPipelineStack,
        "TimelineUiApplication",
        {
            pathToProjectToBuild: "ts/timeline-ui",
            restApiGatewayId: infrastructureStack.restApiId,
            restApiRootResourceId: infrastructureStack.restApiRootResourceId,
        }
    );
    timelineUiPipelineStack.pipeline.addApplicationStage(uiApplication);

    storingLambdaPipelineStack.pipeline.addApplicationStage(
        new TwitterStoringLambdaApplication(
            storingLambdaPipelineStack,
            `TwitterStoringLambdaApplication`,
            {
                dynamoDBTableName: infrastructureStack.dynamoDbTableName,
                pathToProjectToBuild: "ts/twitter-storing-lambda",
                queueArn: infrastructureStack.queueArn,
            }
        )
    );

    const timelineApiLambdaPipelineStack = new YarnPipelineStack(
        app,
        `TimelineApiLambdaPipelineStack`,
        {
            env: {
                region,
            },
            pathToProjectToBuild: "ts/timeline-api",
            ...repoProps,
        }
    );

    const timelineApi = new TimelineApiLambdaApplication(
        timelineApiLambdaPipelineStack,
        `TimelineApiLambdaApplication`,
        {
            dynamoDBTableName: infrastructureStack.dynamoDbTableName,
            pathToProjectToBuild: "ts/timeline-api",
            restApiGatewayId: infrastructureStack.restApiId,
            restApiRootResourceId: infrastructureStack.restApiRootResourceId,
        }
    );

    timelineApiLambdaPipelineStack.pipeline.addApplicationStage(timelineApi);

    new ApiGatewayStack(app, {
        lambdaArn: timelineApi.stack.functionArn,
        bucketArn: uiApplication.stack.bucketArn,
        roleArn: uiApplication.stack.roleArn,
        restApiId: infrastructureStack.restApiId,
        rootResourceId: infrastructureStack.restApiRootResourceId,
        stageName: "prod",
        env: {
            region,
        }
    });
};
