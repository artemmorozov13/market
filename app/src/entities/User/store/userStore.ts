import { makeAutoObservable } from "mobx";
import { AuthViaTelegramResponse } from "../types/userTypes";

class UserStore {
    user: AuthViaTelegramResponse = {} as AuthViaTelegramResponse

    constructor() {
        makeAutoObservable(this)
    }

    setUserData = (user: AuthViaTelegramResponse) => {
        this.user = user
    }
}

export const userStore = new UserStore()
