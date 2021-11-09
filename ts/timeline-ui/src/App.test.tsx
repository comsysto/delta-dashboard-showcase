import React from 'react'
import { render, screen } from '@testing-library/react'
import App from './App'

test('renders learn react link', () => {
  render(
    <App
      apiFetcher={(timelineUrl) =>
        Promise.resolve([{ startTime: '00:00:00', endTime: '00:30:00', counts: { a: 23, b: 42 } }])
      }
      apiUrl={'/api'}
    />,
  )
  const linkElement = screen.getByText(/Social media Dashboard/i)
  expect(linkElement).toBeInTheDocument()
})
