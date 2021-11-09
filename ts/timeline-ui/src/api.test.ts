import { fetchTimeLine, timeLineUrl } from './api'
import fetchMock, { enableFetchMocks } from 'jest-fetch-mock'

enableFetchMocks()

beforeEach(() => fetchMock.resetMocks())

describe('api functions', () => {
  test('timelineUrl', () => {
    const result = timeLineUrl(['a', 'b'], new Date(Date.UTC(2020, 3, 2, 8, 12, 20, 22)), 'https://narf/api')

    expect(result).toMatchInlineSnapshot(`"https://narf/api?date=2020-04-02&searchTerm=a&searchTerm=b"`)
  })

  test('fetchTimeLine', async () => {
    const expectedResult = [{ startTime: '00:00:00', endTime: '00:30:00', counts: { a: 23, b: 42 } }]
    global.fetch.mockResponseOnce(JSON.stringify(expectedResult))
    const result = await fetchTimeLine('narf')
    expect(result).toEqual(expectedResult)
  })
})
