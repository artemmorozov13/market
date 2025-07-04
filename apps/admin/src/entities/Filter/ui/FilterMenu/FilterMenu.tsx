import {  FC, useState } from 'react'
import FilterAltIcon from '@mui/icons-material/FilterAlt'
import { Button, IconButton } from '@mui/material'
import { FilterItemType, FilterSelectOptionType, SelecedFiltersDataType } from '../../types/filterMenuTypes'
import { FilterListModal } from '../FilterListModal/FilterListModal'

import styles from './FilterMenu.module.scss'

interface NewsFilterMenuProps {
  filters: FilterItemType[]
  onSubmitFilter: (selectedFilterList: SelecedFiltersDataType) => void 
}

export const FilterMenu: FC<NewsFilterMenuProps> = (props) => {
  const { filters, onSubmitFilter } = props

  const [selectedFilters, setSelectedFilters] = useState<FilterSelectOptionType[]>([])
  const [isOpenSortMenu, setIsOpenSortMenu] = useState<boolean>(false)

  const togleSortMenu = () => {
    setIsOpenSortMenu((prev) => !prev)
  }

  const handleChangeFilter = (filters: SelecedFiltersDataType) => {
    const filterValuesArray = Object.values(filters)
      .filter(filterValue => {
        if (Array.isArray(filterValue)) {
          return true
        }
        return false
      })
      .flat()
    setSelectedFilters(filterValuesArray as any)
    onSubmitFilter(filters)
  }

  return (
      <>
         <FilterListModal
          isOpen={isOpenSortMenu}
          onClose={togleSortMenu}
          onFilterChange={handleChangeFilter}
          filters={filters}
        />
        <div className={styles.root}>
          <div className={styles.filters}>
            <div className={styles.filtersList}>
              {selectedFilters.map((item, index) => (
                <Button
                  key={index}
                  className={styles.filterItem}
                  variant="outlined"
                  color="info"
                >
                  {item.label}
                </Button>
              ))}
            </div>
            <IconButton
              color="inherit"
              className={styles.filterButton}
              onClick={togleSortMenu}
            >
              <FilterAltIcon />
            </IconButton>
          </div>
        </div>
      </>
  )
}
