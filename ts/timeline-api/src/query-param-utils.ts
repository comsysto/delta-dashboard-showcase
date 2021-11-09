import { APIGatewayEvent } from 'aws-lambda';

export const extractQueryParams = (event: APIGatewayEvent): { searchTerms: string[]; date: string } => {
  const parameters = { date: '', searchTerms: [''] };

  if (event.queryStringParameters?.date) {
    parameters.date = event.queryStringParameters?.date;
  } else {
    throw new Error('Required parameter date is missing');
  }

  if (
    event.multiValueQueryStringParameters?.searchTerm &&
    event.multiValueQueryStringParameters?.searchTerm.length > 0
  ) {
    parameters.searchTerms = event.multiValueQueryStringParameters?.searchTerm;
  } else {
    throw new Error('Required parameter searchTerm is missing');
  }

  return parameters;
};
