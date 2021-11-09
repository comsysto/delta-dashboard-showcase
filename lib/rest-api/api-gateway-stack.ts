import * as cdk from "@aws-cdk/core";
import * as apigateway from "@aws-cdk/aws-apigateway";
import * as s3 from "@aws-cdk/aws-s3";
import * as iam from "@aws-cdk/aws-iam";
import * as lambda from "@aws-cdk/aws-lambda";
import * as logs from "@aws-cdk/aws-logs";

interface ApiGatewayProps extends cdk.StackProps {
    readonly stageName: string;
    readonly restApiId: cdk.CfnOutput;
    readonly rootResourceId: cdk.CfnOutput;
    readonly bucketArn: cdk.CfnOutput;
    readonly roleArn: cdk.CfnOutput;
    readonly lambdaArn: cdk.CfnOutput;
}

export class ApiGatewayStack extends cdk.Stack {
    constructor(scope: cdk.Construct, props: ApiGatewayProps) {
        super(scope, "ApiGatewayStack", props);

        const restApi = apigateway.RestApi.fromRestApiAttributes(this, "TimelineRestApiGateway'", {
            restApiId: props.restApiId.importValue,
            rootResourceId: props.rootResourceId.importValue,
        });

        const uiBucket = s3.Bucket.fromBucketArn(this, "uiBucket", props.bucketArn.importValue);
        const uiRole = iam.Role.fromRoleArn(this, "uiRole", props.roleArn.importValue);

        const s3Integration = new apigateway.AwsIntegration({
            service: "s3",
            integrationHttpMethod: "GET",
            path: `${uiBucket.bucketName}/{item}`,
            options: {
                integrationResponses: [
                    {
                        statusCode: "200",
                        responseParameters: {
                            "method.response.header.Content-Disposition":
                                "integration.response.header.Content-Disposition",
                            "method.response.header.Content-Type":
                                "integration.response.header.Content-Type",
                        },
                    },
                ],
                requestParameters: {
                    "integration.request.path.item": "method.request.path.item",
                    "integration.request.header.Content-Disposition":
                        "method.request.header.Content-Disposition",
                    "integration.request.header.Content-Type": "method.request.header.Content-Type",
                },
                credentialsRole: uiRole,
            },
        });

        const apiLambda = lambda.Function.fromFunctionArn(
            this,
            "timelineApiFunction",
            props.lambdaArn.importValue
        );
        const lambdaIntegration = new apigateway.LambdaIntegration(apiLambda);

        const methods = [
            restApi.root.addResource("{item}").addMethod("GET", s3Integration, {
                requestParameters: {
                    "method.request.path.item": true,
                    "method.request.header.Content-Disposition": false,
                    "method.request.header.Content-Type": false,
                },
                methodResponses: [
                    {
                        statusCode: "200",
                        responseParameters: {
                            "method.response.header.Content-Disposition": false,
                            "method.response.header.Content-Type": false,
                        },
                        responseModels: {
                            "application/json": apigateway.Model.EMPTY_MODEL,
                        },
                    },
                ],
            }),
            restApi.root
                .addResource("api")
                .addResource("timeline")
                .addMethod("GET", lambdaIntegration),
        ];

        new ApiGatewayDeploymentStack(this, {
            stageName: "prod",
            restApiId: props.restApiId,
            methods,
            logicalId: new Date().toISOString(),
            env: {
                region: props.env?.region
            }
        });
    }
}

interface ApiGatewayDeploymentStackProps extends cdk.StackProps {
    readonly stageName: string;
    readonly logicalId: string;
    readonly restApiId: cdk.CfnOutput;
    readonly methods?: apigateway.Method[];
}

class ApiGatewayDeploymentStack extends cdk.Stack {
    constructor(scope: cdk.Construct, props: ApiGatewayDeploymentStackProps) {
        super(scope, "ApiGatewayDeploymentStack", props);

        const logGroup = new logs.LogGroup(this, "dashboard-api-gateway");
        const deployment = new apigateway.Deployment(this, "Deployment", {
            api: apigateway.RestApi.fromRestApiId(this, "RestApi", props.restApiId.importValue),
            retainDeployments: true,
        });
        deployment.addToLogicalId(props.logicalId);
        (props.methods ?? []).forEach((method) => deployment.node.addDependency(method));
        new apigateway.Stage(this, "Stage", {
            deployment,
            stageName: props.stageName,
            accessLogDestination: new apigateway.LogGroupLogDestination(logGroup),
            accessLogFormat: apigateway.AccessLogFormat.jsonWithStandardFields(),
            tracingEnabled: true,
        });
    }
}
