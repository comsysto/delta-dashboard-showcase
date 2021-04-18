# Twitter Polling Lambda

## Commands

### Test
`npm run test`

### Build
`npm run build`

## Deploy
Run npm install && npm run build.
The generated build-Folder has to be packaged together with the node_modules-Folder into a Zip-File and uploaded to AWS Lambda.
zip -r lambda.zip build node_modules
The Lambda has to use build/index.handler as the trigger and Node Version 12 as its runtime.
