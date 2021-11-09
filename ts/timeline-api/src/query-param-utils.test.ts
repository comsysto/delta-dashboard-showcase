import testEvent from './test-api-gateway-event';
import { extractQueryParams } from './query-param-utils';
import { APIGatewayEvent } from 'aws-lambda';

describe('query-param-utils', () => {
  let event: APIGatewayEvent;

  beforeEach(() => {
    event = { ...testEvent };
  });

  describe('extractQueryParams', () => {
    it('should return needed query params from input event', () => {
      const params = extractQueryParams(event);
      expect(params.date).toBe('2021-05-15');
      expect(params.searchTerms).toEqual(['foo', 'bar']);
    });

    it('should throw error if no query params', () => {
      event.queryStringParameters = null;

      expect(() => extractQueryParams(event)).toThrow(Error);
    });

    it('should throw error if no multi valuequery params', () => {
      event.multiValueQueryStringParameters = null;

      expect(() => extractQueryParams(event)).toThrow(Error);
    });
  });
});
