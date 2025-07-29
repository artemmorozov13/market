import { makeAutoObservable } from "mobx";
import { AuthViaTelegramResponse } from "../types/userTypes";
import { Roles } from "@core/enums/role-enum"
import { StoreBaseType } from "@core/types/store-type";
import { TelegramAuthData } from "@telegram-auth/react";

export class UserStore {
    user: AuthViaTelegramResponse = {} as AuthViaTelegramResponse
    telegramUser: TelegramAuthData | null = null
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

    setTelegramUser = (telegramUser: TelegramAuthData) => {
        this.telegramUser = telegramUser
    }

    setUserRole = (role: Roles) => {
        this.role = role
    }
}

export const userStore = new UserStore()
