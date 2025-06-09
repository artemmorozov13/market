export interface ProductType {
    id: number
    name: string
    description: string
    price: string
    discount: string
    image: string
    unitValue: string
    is_expired: boolean
    createdAt: Date
    updatedAt: Date
    unitOfMeasurement: "гр" | "кг" | "шт"
}
