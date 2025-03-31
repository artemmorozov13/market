import { makeAutoObservable } from "mobx"
import { fetchUser } from "../api/fetchUser"
import { UserType } from "../types/userTypes"

class UserStore {
    user: UserType | null = null
    isInited: boolean = false

    constructor() {
        makeAutoObservable(this)
    }

    fetchUserData = async () => {
        const user = await fetchUser()
        if (!!user) {
            this.setUserData(user)
        }
    }
    
    setUserData = (user: UserType) => {
        this.user = user
        this.isInited = true
    }

    setInited = () => {
        this.isInited = true
    }
}

export const userStore = new UserStore()
