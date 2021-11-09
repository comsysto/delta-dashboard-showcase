import { AppState, reduceDate, reduceSearchTerms, reduceTimelineData } from './state'

const state: AppState = {
  date: new Date(Date.UTC(2020, 3, 2, 4, 6, 23, 1)),
  searchTerms: [],
  data: [],
}

describe('state functions', () => {
  test('reduceSearchTerms', () => {
    const result = reduceSearchTerms(['a', 'b'])(state)
    expect(result).toMatchInlineSnapshot(`
      Object {
        "data": Array [],
        "date": 2020-04-02T04:06:23.001Z,
        "searchTerms": Array [
          "a",
          "b",
        ],
      }
    `)
  })

  test('reduceTimelineData', () => {
    const result = reduceTimelineData([
      {
        startTime: '00:00:00',
        endTime: '00:00:01',
        counts: { a: 42, b: 13 },
      },
    ])(state)
    expect(result).toMatchInlineSnapshot(`
      Object {
        "data": Array [
          Object {
            "a": 42,
            "b": 13,
            "range": "00:00:00 - 00:00:01",
          },
        ],
        "date": 2020-04-02T04:06:23.001Z,
        "searchTerms": Array [],
      }
    `)
  })

  test('reduceDate', () => {
    const result = reduceDate(new Date(Date.UTC(2021, 6, 3, 4, 6, 23, 1)))(state)
    expect(result).toMatchInlineSnapshot(`
      Object {
        "data": Array [],
        "date": 2021-07-03T04:06:23.001Z,
        "searchTerms": Array [],
      }
    `)
  })
})
