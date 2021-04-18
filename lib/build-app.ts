import * as cdk from "@aws-cdk/core";
import {InfrastructureStack} from "./infrastructure/infrastructure-stack";
import {YarnPipelineStack} from "./lambdas/yarn-pipeline-stack";
import {TwitterPollingLambdaApplication} from "./lambdas/twitter-polling-lambda-stack";
import {TwitterStoringLambdaApplication} from "./lambdas/twitter-storing-lambda-stack";

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
};
