import { APIGatewayEvent } from 'aws-lambda';

export default {
  resource: '/timeline',
  path: '/timeline',
  httpMethod: 'GET',
  headers: {
    Accept: '*/*',
    'content-type': 'application/json',
  },
  multiValueHeaders: {},
  queryStringParameters: {
    date: '2021-05-15',
    searchTerm: 'bar',
  },
  multiValueQueryStringParameters: {
    date: ['2021-05-15'],
    searchTerm: ['foo', 'bar'],
  },
  pathParameters: null,
  stageVariables: null,
  body: '{}',
  isBase64Encoded: false,
  requestContext: {
    resourcePath: '/',
    httpMethod: 'GET',
    path: '/Prod/',
    accountId: '',
    apiId: '',
    authorizer: null,
    requestId: '',
    protocol: 'https',
    stage: '',
    resourceId: '',
    requestTimeEpoch: 1234567,
    identity: null,
  },
} as APIGatewayEvent;
