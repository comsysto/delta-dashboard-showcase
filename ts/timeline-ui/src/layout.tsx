import React, { FC } from 'react'
import { boxy, headline } from './styles'

export const Panel: FC = ({ children }) => <div className={boxy}>{children}</div>
export const Headline: FC = ({ children }) => <h1 className={headline}>{children}</h1>
