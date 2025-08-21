import { FC, Fragment, useCallback } from 'react'

import styles from './FilterList.module.scss'
import {
  FilterItemType,
  FilterSelectOptionType,
  FilterVariantsEnum,
} from '../../types/filterMenuTypes'
import {
  Button,
  Checkbox,
  Divider,
  FormControlLabel,
  List,
  ListItemButton,
  ListItemText,
  Switch,
} from '@mui/material'
import { Controller, useFormContext } from 'react-hook-form'
import { filterStore } from '../../store/filterStore'
import { observer } from 'mobx-react-lite'
import clsx from 'clsx'

interface FilterListProps {
  filters: FilterItemType[]
}

export const FilterList: FC<FilterListProps> = observer((props) => {
  const { filters } = props

  const { setSelectedFilterList, setShowContent } = filterStore
  const { control } = useFormContext()

  const handleSomeFullListOpen = (selectedList: FilterItemType) => {
    setShowContent(false)
    setTimeout(() => {
      setSelectedFilterList(selectedList)
      setShowContent(true)
    }, 200)
  }

  const renderFilterByType = useCallback((filter: FilterItemType) => {
    switch (filter.type) {
      case FilterVariantsEnum.BooleanSelect:
        return (
          <div className={styles.booleanSelect}>
            <FormControlLabel
              label={filter.title}
              control={
                <Controller
                  name={filter.name}
                  control={control}
                  render={({ field: { value = false, onChange } }) => (
                    <Switch
                      aria-label={filter.title}
                      value={value}
                      onChange={onChange}
                      color="secondary"
                    />
                  )}
                />
              }
            />
          </div>
        )
      case FilterVariantsEnum.MultiSelectValue:
        return (
          <div className={styles.multiSelect}>
            <span className={clsx(styles.title, styles.listTitle)}>{filter.title}</span>
            <List className={styles.optionList}>
              {filter.options.map((option, index) => (
                <Controller
                  key={index}
                  name={filter.name}
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
                        <ListItemButton onClick={handleSelect}>
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
            <Button
              variant="text"
              color="secondary"
              className={styles.showMoreButton}
              onClick={() => handleSomeFullListOpen(filter)}
            >
              Показать еще
            </Button>
          </div>
        )
      case FilterVariantsEnum.SingleSelectValue:
        return (
          <div className={styles.singleSelect}>
            <span className={clsx(styles.title, styles.listTitle)}>{filter.title}</span>
            <Controller
              name={filter.name}
              control={control}
              render={({ field: { value, onChange } }) => (
                <List className={styles.optionList}>
                  {filter.options.map((option, index) => (
                    <Fragment key={index}>
                      <ListItemButton onClick={() => onChange(option)}>
                        <ListItemText>{option.label}</ListItemText>
                        <Checkbox checked={option.value === value?.value} color="secondary" />
                      </ListItemButton>
                      <Divider />
                    </Fragment>
                  ))}
                </List>
              )}
            />
            <Button
              variant="text"
              color="secondary"
              className={styles.showMoreButton}
              onClick={() => handleSomeFullListOpen(filter)}
            >
              Показать еще
            </Button>
          </div>
        )
    }
  }, [])

  return (
    <div className={styles.filterList}>
      {filters.map((filter, index) => (
        <Fragment key={index}>{renderFilterByType(filter)}</Fragment>
      ))}
    </div>
  )
})
