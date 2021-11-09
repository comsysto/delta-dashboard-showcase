import React, { FC } from 'react'
import Select, { NamedProps, OptionTypeBase } from 'react-select'
import DatePicker from 'react-datepicker'
import { boxy } from './styles'

const panelHeadLine = 'text-1xl text-indigo-500'
const formLabel = 'bg-gray-100 rounded align-middle'

export type SearchTermOption = {
  value: string
  label: string
}

export const FilterSettings: FC<{
  selectedDate: Date | null
  onSetDate: (date: Date) => void
  onSetSearchTerms: (searchTerms: string[]) => void
  selectedOptions: SearchTermOption[]
  searchTermOptions: SearchTermOption[]
}> = ({ selectedDate, onSetDate, onSetSearchTerms, selectedOptions, searchTermOptions }) => {
  const changeHandler: NamedProps<OptionTypeBase, true>['onChange'] = (value, actionMeta) => {
    switch (actionMeta.action) {
      case 'select-option':
      case 'remove-value':
        onSetSearchTerms(value.map((v) => v.value))
        break
      case 'clear':
        onSetSearchTerms([])
        break
    }
  }

  return (
    <div className={boxy}>
      <h2 className={panelHeadLine}>Filter Settings</h2>
      <div className="grid grid-cols-6 gap-4">
        <span className={formLabel}>calendar day</span>
        <div className="col-span-5">
          <DatePicker selected={selectedDate} onChange={onSetDate} />
        </div>
        <span className={formLabel}>search terms</span>
        <Select
          className="col-span-5"
          options={searchTermOptions}
          isMulti={true}
          onChange={changeHandler}
          value={selectedOptions}
        />
      </div>
    </div>
  )
}
