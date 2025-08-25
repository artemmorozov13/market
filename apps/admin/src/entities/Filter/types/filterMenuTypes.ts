export type FilterItemType = BooleanSelectTypeItemType | MultiSelectItemType | SingleSelectItemType

export type SelecedFiltersDataType<T = any> = T

export interface FilterSelectOptionType {
  label: string
  value: string
}

interface ParentFilterInterface<T> {
  type: T
  title: string
  name: string
}

export interface BooleanSelectTypeItemType
  extends ParentFilterInterface<FilterVariantsEnum.BooleanSelect> {
  label: string
}

export interface MultiSelectItemType
  extends ParentFilterInterface<FilterVariantsEnum.MultiSelectValue> {
  headerTitle: string
  options: FilterSelectOptionType[]
}

export interface SingleSelectItemType
  extends ParentFilterInterface<FilterVariantsEnum.SingleSelectValue> {
  options: FilterSelectOptionType[]
}

export enum FilterVariantsEnum {
  BooleanSelect = 'booleanSelectFilter',
  SingleSelectValue = 'singleSelectValue',
  MultiSelectValue = 'multiSelectValue',
}

export const FilterVariantsList = {
  BooleanSelect: 'booleanSelectFilter',
  SingleSelectValue: 'singleSelectValue',
  MultiSelectValue: 'multiSelectValue',
}

export type SelectedFilterList = BooleanSelectedType | MultiSelectedType

export type BooleanSelectedType = Record<string, boolean>

export type MultiSelectedType = FilterSelectOptionType[]

export interface AlphabetSortedListType {
  char: string
  items: FilterSelectOptionType[]
}
