import { ReactNode } from "react"

export enum EditStoreTabEnum {
    General = 'General',
    Delivery = 'Delivery',
    Help = 'Help',
    Links = 'Links',
    Partners = 'Partners',
    Integrations = 'Integrations'
}

export interface EditStoreTab {
    label: string
    children: ReactNode
}