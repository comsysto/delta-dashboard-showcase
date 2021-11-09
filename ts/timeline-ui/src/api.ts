export type TimelineResponse = {
  startTime: string
  endTime: string
  counts: {
    [searchTerm: string]: number
  }
}

export type ApiFetcher = (timelineUrl: string) => Promise<TimelineResponse[]>

export const timeLineUrl = (searchTerms: string[], date: Date, baseUrl: string): string => {
  const searchTermParams = searchTerms.map((t) => `searchTerm=${t}`)
  const dateParam = `date=${date.toISOString().split('T')[0]}`
  const paramString = [dateParam, ...searchTermParams].join('&')

  return encodeURI(`${baseUrl}?${paramString}`)
}

export const fetchTimeLine: ApiFetcher = (timelineUrl: string) =>
  fetch(timelineUrl).then((response) => response.json() as Promise<TimelineResponse[]>)
