import React, { FC, useEffect, useState } from 'react'
import 'react-datepicker/dist/react-datepicker.css'
import { ApiFetcher, timeLineUrl } from './api'
import { FilterSettings, SearchTermOption } from './FilterSettings'
import { boxy, headline } from './styles'
import { TweetChart } from './TweetChart'
import { compose } from 'rambda'
import { AppState, reduceDate, reduceSearchTerms, reduceTimelineData } from './state'

const searchTermOptions: SearchTermOption[] = ['aws', 'kubernetes', 'serverless'].map((term: string) => ({
  value: term,
  label: term,
}))

const colorMap: Record<string, string> = {
  aws: '#818CF8',
  kubernetes: '#34D399',
  serverless: '#FBBF24',
}

const initialState: AppState = { date: new Date(), searchTerms: [], data: [] }

const App: FC<{ apiFetcher: ApiFetcher; apiUrl: string }> = ({ apiFetcher, apiUrl }) => {
  const [appState, setAppState] = useState(initialState)
  const selectedTerms = appState.searchTerms
  const selectedDate = appState.date
  const selectedOptions: SearchTermOption[] = searchTermOptions.filter((t) => selectedTerms.indexOf(t.value) >= 0)

  const setTimelineData = compose(setAppState, reduceTimelineData)
  const setSearchTerms = compose(setAppState, reduceSearchTerms)
  const setDate = compose(setAppState, reduceDate)
  const fetchApiData = compose(apiFetcher, timeLineUrl)

  useEffect(() => {
    if (selectedTerms.length > 0) {
      fetchApiData(selectedTerms, selectedDate, apiUrl).then(setTimelineData)
    }
  }, [selectedTerms, selectedDate])

  return (
    <div className={boxy}>
      <h1 className={headline}>Social Media Dashboard</h1>
      <FilterSettings
        selectedDate={appState.date}
        onSetDate={setDate}
        onSetSearchTerms={setSearchTerms}
        selectedOptions={selectedOptions}
        searchTermOptions={searchTermOptions}
      />
      <div style={{ height: '500px' }} className={boxy}>
        <TweetChart selectedTerms={selectedTerms} colorMap={colorMap} data={appState.data} />
      </div>
    </div>
  )
}
export default App
