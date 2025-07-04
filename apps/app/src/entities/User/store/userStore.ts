import { makeAutoObservable } from "mobx";
import { AuthViaTelegramResponse } from "../types/userTypes";
import { Roles } from "@core/enums/role-enum"
import { StoreBaseType } from "@core/types/store-type";

export class UserStore {
    user: AuthViaTelegramResponse = {} as AuthViaTelegramResponse
    role: Roles = Roles.NotAuthed
    selectedStore: StoreBaseType | null = null

    constructor() {
        makeAutoObservable(this)
    }

    setUserData = (user: AuthViaTelegramResponse) => {
        this.user = user
    }

    setSelectedStore = (selectedStore: StoreBaseType) => {
        this.selectedStore = selectedStore
    }

    setUserRole = (role: Roles) => {
        this.role = role
    }
}

export const userStore = new UserStore()
