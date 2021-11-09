import * as cdk from "@aws-cdk/core";
import * as s3 from "@aws-cdk/aws-s3";
import * as iam from "@aws-cdk/aws-iam";
import * as s3deploy from "@aws-cdk/aws-s3-deployment";

export interface TimelineUiApplicationProps extends cdk.StageProps {
    pathToProjectToBuild: string;
    restApiGatewayId: cdk.CfnOutput;
    restApiRootResourceId: cdk.CfnOutput;
}

export class TimelineUiApplication extends cdk.Stage {
    readonly stack: TimelineUiStack;

    constructor(scope: cdk.Construct, id: string, props: TimelineUiApplicationProps) {
        super(scope, id, props);

        this.stack = new TimelineUiStack(this, `${id}Stack`, props);
    }
}

interface TimelineUiStackProps extends cdk.StackProps {
    pathToProjectToBuild: string;
    restApiGatewayId: cdk.CfnOutput;
    restApiRootResourceId: cdk.CfnOutput;
}

class TimelineUiStack extends cdk.Stack {
    readonly s3AccessRole: iam.Role;

    readonly roleArn: cdk.CfnOutput;

    readonly bucketArn: cdk.CfnOutput;

    constructor(scope: cdk.Construct, id: string, props: TimelineUiStackProps) {
        super(scope, id, props);

        const uiBucket = new s3.Bucket(this, "TimelineUiBucket");

        const apiGatewayServicePrincipal = new iam.ServicePrincipal("apigateway.amazonaws.com");
        this.s3AccessRole = new iam.Role(this, "S3AccessRole", {
            managedPolicies: [iam.ManagedPolicy.fromAwsManagedPolicyName("AmazonS3ReadOnlyAccess")],
            assumedBy: apiGatewayServicePrincipal,
        });
        const s3AccessRole = this.s3AccessRole;

        const policyStatement = new iam.PolicyStatement({
            effect: iam.Effect.ALLOW,
            principals: [apiGatewayServicePrincipal],
            actions: ["s3:Get*", "s3:List*"],
            resources: [uiBucket.arnForObjects("*")],
        });

        uiBucket.addToResourcePolicy(policyStatement);

        new s3deploy.BucketDeployment(this, "DeployWebsite", {
            sources: [s3deploy.Source.asset(`${props.pathToProjectToBuild}/build`)],
            destinationBucket: uiBucket,
        });

        this.roleArn = new cdk.CfnOutput(this, "S3AccessRoleArn", {
            description: "role that is allowed to access the s3 bucket with the ui assets",
            value: s3AccessRole.roleArn,
            exportName: "s3AccessRoleArn",
        });
        this.bucketArn = new cdk.CfnOutput(this, "UiAssetBucketArn", {
            description: "arn of the bucket containing the ui assets",
            value: uiBucket.bucketArn,
            exportName: "bucketArn",
        });
    }
}
