import { makeAutoObservable } from "mobx"
import { fetchUser } from "../api/fetchUser"

class UserStore {
    user: any | null = null
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
    
    setUserData = (user: any) => {
        this.user = user
        this.isInited = true
    }

    setInited = () => {
        this.isInited = true
    }
}

export const userStore = new UserStore()
