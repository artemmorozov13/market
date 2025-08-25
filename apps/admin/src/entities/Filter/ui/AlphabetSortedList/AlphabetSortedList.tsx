import { FC, useEffect } from 'react'
import {
  AlphabetSortedListType,
  FilterItemType,
  FilterSelectOptionType,
} from '../../types/filterMenuTypes'
import { filterStore } from '../../store/filterStore'

import styles from './AlphabetSortedList.module.scss'
import { observer } from 'mobx-react-lite'
import { Checkbox, Divider, List, ListItemButton, ListItemText } from '@mui/material'
import { Controller, useFormContext } from 'react-hook-form'

interface AlphabetSortedListProps {
  name: string
  selectedFilter: FilterItemType
}

export const AlphabetSortedList: FC<AlphabetSortedListProps> = observer((props) => {
  const { name } = props

  const { control } = useFormContext()

  const { filtersById, filterSearchText, fetchFilterListById } = filterStore

  const renderFiltersOrderByAlphabet = (filter: AlphabetSortedListType) => {
    return (
      <div key={filter.char}>
        <span className={styles.char}>{filter.char}</span>
        <List className={styles.innerList}>
          {filter.items.map((option, index) => (
            <Controller
              key={index}
              name={name}
              control={control}
              defaultValue={[]}
              render={({ field: { value = [], onChange } }) => {
                const isSelected = value.some(
                  (selectedOption: FilterSelectOptionType) => selectedOption.value === option.value,
                )
                const handleSelect = () => {
                  if (isSelected) {
                    const updatedValue = value.filter(
                      (selectedOption: FilterSelectOptionType) =>
                        selectedOption.value !== option.value,
                    )
                    onChange(updatedValue)
                  } else {
                    onChange([...value, option])
                  }
                }
                return (
                  <>
                    <ListItemButton className={styles.innerList__item} onClick={handleSelect}>
                      <ListItemText>{option.label}</ListItemText>
                      <Checkbox onChange={handleSelect} checked={isSelected} color="secondary" />
                    </ListItemButton>
                    <Divider />
                  </>
                )
              }}
            />
          ))}
        </List>
      </div>
    )
  }

  useEffect(() => {
    fetchFilterListById(1)
  }, [])

  return filtersById?.case({
    fulfilled: (filters) => (
      <div className={styles.root}>
        {filterSearchText ? (
          <List className={styles.innerList}>
            {filters
              .map((filter) => filter.items)
              .flat()
              .filter((filter) =>
                filter.label.toLowerCase().includes(filterSearchText.toLowerCase()),
              )
              .map((option, index) => (
                <Controller
                  key={index}
                  name={name}
                  control={control}
                  defaultValue={[]}
                  render={({ field: { value = [], onChange } }) => {
                    const isSelected = value.some(
                      (selectedOption: FilterSelectOptionType) =>
                        selectedOption.value === option.value,
                    )
                    const handleSelect = () => {
                      if (isSelected) {
                        const updatedValue = value.filter(
                          (selectedOption: FilterSelectOptionType) =>
                            selectedOption.value !== option.value,
                        )
                        onChange(updatedValue)
                      } else {
                        onChange([...value, option])
                      }
                    }
                    return (
                      <>
                        <ListItemButton className={styles.innerList__item} onClick={handleSelect}>
                          <ListItemText>{option.label}</ListItemText>
                          <Checkbox
                            onChange={handleSelect}
                            checked={isSelected}
                            color="secondary"
                          />
                        </ListItemButton>
                        <Divider />
                      </>
                    )
                  }}
                />
              ))}
          </List>
        ) : (
          filters.map(renderFiltersOrderByAlphabet)
        )}
      </div>
    ),
  })
})
