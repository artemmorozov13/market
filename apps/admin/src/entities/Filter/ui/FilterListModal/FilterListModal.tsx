import { FC, useEffect } from 'react'
import { Button, Grow, IconButton, Modal } from '@mui/material'
import { FilterItemType } from '../../types/filterMenuTypes'
import styles from './FilterListModal.module.scss'
import { FormProvider, useForm } from 'react-hook-form'
import { resetDefaultFilters } from '../../lib/resetDefaultFilters'
import CloseIcon from '@mui/icons-material/Close'
import { AlphabetSortedList } from '../AlphabetSortedList/AlphabetSortedList'
import { FilterList } from '../FilterList/FilterList'
import { observer } from 'mobx-react-lite'
import { filterStore } from '../../store/filterStore'
import { HeaderWithSearch } from '../HeaderWithSearch/HeaderWithSearch'

interface FilterListModalProps {
  isOpen: boolean
  onClose: () => void
  filters: FilterItemType[]
  onFilterChange: (filters: FilterItemType[]) => void
}

export const FilterListModal: FC<FilterListModalProps> = observer((props) => {
  const { isOpen, filters, onClose, onFilterChange } = props

  const {
    selectedFilterList,
    showContent,
    setShowContent,
    setSelectedFilterList,
    setIsSearchOpen,
  } = filterStore

  const methods = useForm({
    mode: 'onChange',
    defaultValues: resetDefaultFilters(filters),
  })

  const { handleSubmit, reset } = methods

  const handleResetFilters = () => {
    reset(resetDefaultFilters(filters))
  }

  const handleCloseWithAnimation = () => {
    setShowContent(false)
    setTimeout(onClose, 200)
  }

  const onSubmit = (data: any) => {
    onFilterChange(data)
    handleCloseWithAnimation()
  }

  useEffect(() => {
    if (isOpen) {
      setShowContent(true)
    }
  }, [isOpen])

  return (
    <Modal className={styles.filterModal} open={isOpen} onClose={handleCloseWithAnimation}>
      <div className={styles.paper}>
        <div className={styles.filtersHeader}>
          {selectedFilterList ? (
            <HeaderWithSearch />
          ) : (
            <div className={styles.filtersHeader_left}>
              <IconButton onClick={handleCloseWithAnimation}>
                <CloseIcon />
              </IconButton>
              <span className={styles.mainTitle}>Фильтры</span>
            </div>
          )}
        </div>
        <Grow in={showContent} timeout={200}>
          <div className={styles.wrapper}>
            <FormProvider {...methods}>
              <form className={styles.form} onSubmit={handleSubmit(onSubmit)}>
                <div className={styles.filters}>
                  {selectedFilterList ? (
                    <AlphabetSortedList
                      name={selectedFilterList.name}
                      selectedFilter={selectedFilterList}
                    />
                  ) : (
                    <FilterList filters={filters} />
                  )}
                </div>
                <div className={styles.actions}>
                  <Button
                    variant="contained"
                    color="secondary"
                    className={styles.actionButton}
                    type="submit"
                  >
                    Применить фильтры
                  </Button>
                  <Button
                    variant="outlined"
                    color="secondary"
                    className={styles.actionButton}
                    onClick={handleResetFilters}
                  >
                    Сбросить фильтры
                  </Button>
                </div>
              </form>
            </FormProvider>
          </div>
        </Grow>
      </div>
    </Modal>
  )
})
