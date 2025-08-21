import { makeAutoObservable } from 'mobx'
import { MenuType } from '..'
import { fetchMenuListData } from '../api/fetchMenuListData'

class MenuStore {
  menuList: MenuType[] = []

  constructor() {
    makeAutoObservable(this)
  }

  fetchMenuList = () => {
    this.menuList = fetchMenuListData()
  }
}

export const menuStore = new MenuStore()
