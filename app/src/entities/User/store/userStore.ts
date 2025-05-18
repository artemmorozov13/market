import { makeAutoObservable } from "mobx";
import { AuthViaTelegramResponse, UserRoleType } from "../types/userTypes";

export class UserStore {
    user: AuthViaTelegramResponse = {} as AuthViaTelegramResponse
    role: UserRoleType = 'notAuthed'

    constructor() {
        makeAutoObservable(this)
    }

    setUserData = (user: AuthViaTelegramResponse) => {
        this.user = user
    }

    setUserRole = (role: UserRoleType) => {
        this.role = role
    }
}

export const userStore = new UserStore()
