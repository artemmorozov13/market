import { makeAutoObservable } from "mobx";
import { IPromiseBasedObservable, fromPromise } from "mobx-utils";
import { AlphabetSortedListType, FilterItemType } from "../types/filterMenuTypes";
import { fetchFilterListDataById } from "../api/fetchFilterListDataById";

class FilterStore {
    filtersById?: IPromiseBasedObservable<AlphabetSortedListType[]>
    selectedFilterList: FilterItemType | null = null
    filterSearchText: string = ""
    showContent: boolean = false
    isSearchOpen: boolean = false

    constructor () {
        makeAutoObservable(this)
    }

    fetchFilterListById = (id: number) => {
        this.filtersById = fromPromise(fetchFilterListDataById(id))
    }

    setSelectedFilterList = (value: FilterItemType | null) => {
        this.selectedFilterList = value
    }

    setFilterSearchText = (value: string) => {
        this.filterSearchText = value
    }

    setShowContent = (value: boolean) => {
        this.showContent = value
    }

    setIsSearchOpen = (value: boolean) => {
        this.isSearchOpen = value
    }
}

export const filterStore = new FilterStore()
