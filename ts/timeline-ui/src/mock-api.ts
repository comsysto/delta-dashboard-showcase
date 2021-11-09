import { TimelineResponse } from './api'

export const fetchTimeLine = async (timelineUrl: string): Promise<TimelineResponse[]> => {
  return Promise.resolve(createSampleData(['aws', 'kubernetes', 'serverless']))
}

const buckets = Array.from(Array(48).keys())

const createSampleData = (searchTerms: string[]): TimelineResponse[] =>
  buckets.map((n) => ({
    startTime: new Date(1800 * n * 1000).toISOString().split('T')[1].split(':').slice(0, 2).join(':'),
    endTime: new Date(1800 * (n + 1) * 1000).toISOString().split('T')[1].split(':').slice(0, 2).join(':'),
    counts: searchTerms.map((t) => ({ [t]: Math.random() * 300 })).reduce((agg, c) => ({ ...agg, ...c }), {}),
  }))
