import * as cdk from "@aws-cdk/core";
import * as ssm from "@aws-cdk/aws-ssm";
import * as codepipeline from "@aws-cdk/aws-codepipeline";
import * as pipelines from "@aws-cdk/pipelines";
import * as codepipeline_actions from "@aws-cdk/aws-codepipeline-actions";
import * as codepipelineActions from "@aws-cdk/aws-codepipeline-actions";

interface YarnPipelineStackProps extends cdk.StackProps {
    /**
     * name of the parameter in aws ssm that holds the access token for accessing github
     */
    gitHubAccessParameter: string;

    /**
     * branch to use when doing the checkout of the github repo
     */
    branch: string;

    owner: string;

    repo: string;

    pathToProjectToBuild: string;
}

export class YarnPipelineStack extends cdk.Stack {
    public readonly pipeline: pipelines.CdkPipeline;

    constructor(scope: cdk.Construct, id: string, props: YarnPipelineStackProps) {
        super(scope, id, props);

        const sourceArtifact = new codepipeline.Artifact();
        const cloudAssemblyArtifact = new codepipeline.Artifact();

        const yarnArgs = `--cwd ${props.pathToProjectToBuild}`;
        const yarnCmd = `yarn ${yarnArgs}`;
        this.pipeline = new pipelines.CdkPipeline(this, `${id}Pipeline`, {
            pipelineName: `${id}Pipeline`,
            cloudAssemblyArtifact,

            sourceAction: new codepipeline_actions.GitHubSourceAction({
                actionName: "GitHub",
                output: sourceArtifact,
                oauthToken: new cdk.SecretValue(
                    ssm.StringParameter.valueForStringParameter(this, props.gitHubAccessParameter)
                ),
                owner: props.owner,
                repo: props.repo,
                branch: props.branch,
                trigger: codepipelineActions.GitHubTrigger.WEBHOOK,
            }),

            synthAction: pipelines.SimpleSynthAction.standardYarnSynth({
                sourceArtifact,
                cloudAssemblyArtifact,

                synthCommand: `yarn cdk synth ${id}`,
                buildCommand: `(CI=true cd ${props.pathToProjectToBuild} && ${yarnCmd} && ${yarnCmd} build && ${yarnCmd} test && ${yarnCmd} bundle)`,
            }),
        });
    }
}
