export interface ProductType {
    id: number
    name: string
    description: string
    price: string
    is_expired: boolean
    discount: string
    image: string
    unitValue: string
    createdAt: Date
    updatedAt: Date
    unitOfMeasurement: "гр" | "кг" | "шт",
}