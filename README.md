# delta-dashboard-showcase

## Step-by-Step Instructions

1. Fork this repository
2. Add following key-value-pairs to the Systems Manager Parameter Store in your AWS
   Console in the region the stack should be deployed in (https://docs.aws.amazon.com/systems-manager/latest/userguide/systems-manager-parameter-store.html)
   
Use the type String. Even if this makes it possible to view the values as clear text in your AWS console, using the type SecureString would introduce additional complexity as cdk requires you to provide the exact version of the parameter you want to access. 
For the scope of this showcase this is fine. In production code consider using the type SecureString.

| Key                                      | Description                                                                                                                                    |
|------------------------------------------|------------------------------------------------------------------------------------------------------------------------------------------------|
| /dashboard-showcase/git-hub-token        | https://docs.github.com/en/github/authenticating-to-github/creating-a-personal-access-token                                                    |
| /dashboard-showcase/twitter/token        | Token for your Twitter Developer Account (https://developer.twitter.com/en/docs/twitter-api/getting-started/getting-access-to-the-twitter-api) |
| /dashboard-showcase/twitter/token-secret | Token Secret for your Twitter Developer Account                                                                                                |
| /dashboard-showcase/twitter/api-key      | API Key for your Twitter Developer Account                                                                                                     |
| /dashboard-showcase/twitter/api-secret   | API Secret for your Twitter Developer Account                                                                                                  |

3. Adjust the values for the constants `OWNER`, `REPO` and `BRANCH` in the file `/bin/cicd.ts` to match the ones for your forked repo
4. Run command `yarn && yarn cdk deploy --profile {YOUR_AWS_PROFILE_NAME} --region {YOUR_AWS_REGION} InfrastructureStack PipelineTwitterStoringLambdaStack PipelineTwitterPollingLambdaStack TimelineApiLambdaStack TimelineUiStack`
5. Wait for all pipelines in Code-Pipeline to be green and then run `yarn cdk deploy --all --profile {YOUR_PROFILE_NAME} --region {YOUR_AWS_REGION}`

### Cleanup

#### All

`yarn cdk destroy PipelineTwitterStoringLambdaStack --profile {YOUR_PROFILE_NAME} --region {YOUR_AWS_REGION}`  
`yarn cdk destroy PipelineTwitterPollingLambdaStack --profile {YOUR_PROFILE_NAME} --region {YOUR_AWS_REGION}`
`yarn cdk destroy TimelineApiLambdaStack --profile {YOUR_PROFILE_NAME} --region {YOUR_AWS_REGION}`
`yarn cdk destroy TimelineUiStack --profile {YOUR_PROFILE_NAME} --region {YOUR_AWS_REGION}`
`yarn cdk destroy ApiGatewayStack --profile {YOUR_PROFILE_NAME} --region {YOUR_AWS_REGION}`
`yarn cdk destroy InfrastructureStack --profile {YOUR_PROFILE_NAME} --region {YOUR_AWS_REGION}`

yarn cdk destroy InfrastructureStack --profile private --region eu-west-1


#### Without InfrastructureStack

`yarn cdk destroy PipelineTwitterStoringLambdaStack --profile {YOUR_PROFILE_NAME} --region {YOUR_AWS_REGION}`  
`yarn cdk destroy PipelineTwitterPollingLambdaStack --profile {YOUR_PROFILE_NAME} --region {YOUR_AWS_REGION}`  
`yarn cdk destroy TimelineApiLambdaStack --profile {YOUR_PROFILE_NAME} --region {YOUR_AWS_REGION}`  
`yarn cdk destroy TimelineUiStack --profile {YOUR_PROFILE_NAME} --region {YOUR_AWS_REGION}`
`yarn cdk destroy ApiGatewayStack --profile {YOUR_PROFILE_NAME} --region {YOUR_AWS_REGION}`

### Trouble-Shooting
During the execution of the command you might encounter the following message, especially if you have never used cdk (https://aws.amazon.com/de/cdk/) in your account:

The template for the stacks are larger than 50KiB and must be uploaded to S3.
Run the following command in order to setup an S3 bucket in this environment, and then re-deploy:

`yarn cdk bootstrap aws://<YOUR_AWS_ACCOUNT_NUMBER>/<YOUR_AWS_REGION> --profile {YOUR_AWS_PROFILE_NAME}`

So you might have to execute this command first and then run `yarn cdk deploy --all --profile {YOUR_AWS_PROFILE_NAME} --region {YOUR_AWS_REGION}` again.

When the deploy command executes you will be prompted to review the IAM statement changes that cdk is about to execute.

Answer y to actually create the resources in your aws account.
