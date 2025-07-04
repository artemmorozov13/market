import { FC, useState } from 'react'
import { IconButton, Portal } from '@mui/material'
import SortIcon from '@mui/icons-material/Sort';
import { DirectionValueType, SortType } from '../types/sortTypes'

import styles from './SortSelect.module.scss'
import clsx from 'clsx'

interface SortSelectProps {
  sortsList: SortType[]
  option: SortType
  onChange: (value: SortType) => void
  directionValue: DirectionValueType
  onChangeDirectionValue: (value: DirectionValueType) => void
  className?: string
}

const ANIMATION_DURATION = 200

export const SortSelect: FC<SortSelectProps> = (props) => {
  const { option, sortsList, className, onChange, directionValue, onChangeDirectionValue } = props

  const [isOpen, setIsOpen] = useState<boolean>(false)

  const handleSortOpen = () => {
    setTimeout(() => {
      setIsOpen(true)
    }, ANIMATION_DURATION)
  }

  const handleSortClose = () => {
    setTimeout(() => {
      setIsOpen(false)
    }, ANIMATION_DURATION)
  }

  const handleChangeSort = (newValue: SortType) => {
    onChange(newValue)
    setIsOpen(false)
  }

  const handleChangeSortDirection = () => {
    if (directionValue === "desk") {
      onChangeDirectionValue("asc")
    } else {
      onChangeDirectionValue("desk")
    }
  }

  return (
    <div className={clsx(styles.root, className)}>
      <div className={styles.header}>
        <IconButton
          children={<SortIcon className={clsx(styles.icon, { [styles.rotated]: directionValue === "asc" })} />}
          onClick={handleChangeSortDirection}
        />
        <button className={styles.button} onClick={handleSortOpen}>
          {option.label}
        </button>
      </div>
      <Portal>
        <div className={clsx(styles.wrapper, { [styles.modalOpen]: isOpen })} onClick={handleSortClose}>
          <div className={clsx(styles.modal, { [styles.modalOpen]: isOpen })}>
            <div className={styles.items}>
              {sortsList.map((sortItem) => (
                <button
                  key={sortItem.value}
                  className={clsx(styles.item, { [styles.itemActive]: option.value === option.value })}
                  onClick={() => handleChangeSort(sortItem)}
                >
                  {sortItem.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </Portal>
    </div>
  )
}
