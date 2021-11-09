import { DataPoint } from './TweetChart'
import { TimelineResponse } from './api'

export type AppState = {
  date: Date
  searchTerms: string[]
  data: DataPoint[]
}

export const reduceSearchTerms = (searchTerms: string[]) => (appState: AppState): AppState => ({
  ...appState,
  searchTerms,
})

export const reduceTimelineData = (responses: TimelineResponse[]) => (appState: AppState): AppState => ({
  ...appState,
  data: responses.map(transformToDataPoint),
})

export const reduceDate = (date: Date) => (appState: AppState) => ({ ...appState, date })

const transformToDataPoint = (response: TimelineResponse): DataPoint => ({
  range: `${response.startTime} - ${response.endTime}`,
  ...response.counts,
})
