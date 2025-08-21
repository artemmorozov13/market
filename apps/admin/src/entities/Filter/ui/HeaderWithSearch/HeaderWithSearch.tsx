import { ChangeEvent, FC, useState } from 'react'
import { filterStore } from '../../store/filterStore'

import styles from './HeaderWithSearch.module.scss'
import CloseIcon from '@mui/icons-material/Close'
import SearchIcon from '@mui/icons-material/Search'
import ArrowBackIcon from '@mui/icons-material/ArrowBack'
import { IconButton, InputBase } from '@mui/material'
import { observer } from 'mobx-react-lite'
import clsx from 'clsx'

interface HeaderWithSearchProps {}

export const HeaderWithSearch: FC<HeaderWithSearchProps> = observer(() => {
  const {
    selectedFilterList,
    isSearchOpen,
    filterSearchText,
    setIsSearchOpen,
    setShowContent,
    setSelectedFilterList,
    setFilterSearchText,
  } = filterStore

  const [isFocused, setIsFocused] = useState<boolean>(false)

  const handleReturnBackToFilters = () => {
    setShowContent(false)
    setTimeout(() => {
      setSelectedFilterList(null)
      setShowContent(true)
    }, 200)
  }

  const handleReturnBackToFullList = () => {
    setIsSearchOpen(false)
  }

  const handleOpenSearch = () => {
    setIsSearchOpen(true)
  }

  const handleResetSearch = () => {
    setFilterSearchText('')
  }

  const handleChangeSearch = (e: ChangeEvent<HTMLInputElement>) => {
    setFilterSearchText(e.target.value)
  }

  if (isSearchOpen) {
    return (
      <div className={clsx(styles.headerWithSearch)}>
        <IconButton onClick={handleReturnBackToFullList}>
          <ArrowBackIcon />
        </IconButton>
        <div className={clsx(styles.search, { [styles.search__focused]: isFocused })}>
          <InputBase
            value={filterSearchText}
            onChange={handleChangeSearch}
            placeholder="Искать бренд/категорию"
            color="secondary"
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            fullWidth
          />
          <IconButton type="button" onClick={handleResetSearch}>
            <CloseIcon />
          </IconButton>
        </div>
      </div>
    )
  }
  return (
    <div className={styles.filtersHeader}>
      <div className={styles.filtersHeader_left}>
        <IconButton onClick={handleReturnBackToFilters}>
          <ArrowBackIcon />
        </IconButton>
        <span className={styles.mainTitle}>{selectedFilterList?.title}</span>
      </div>
      <IconButton onClick={handleOpenSearch}>
        <SearchIcon />
      </IconButton>
    </div>
  )
})
