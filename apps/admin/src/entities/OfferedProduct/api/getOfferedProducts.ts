import { API } from "@shared/api/instance"
import { useQuery } from "@tanstack/react-query"

const getOfferedProducts = async () => {
    const response = await API.get('/offered-products');
    return response.data
}

export const useOfferedProducts = () => {
    const query = useQuery({
        queryKey: ['offered-products'],
        queryFn: getOfferedProducts
    })
    
    return {
        ...query,
        offeredProducts: query.data?.items || [],
        pagination: query.data?.pagination || {
            total: 0,
            limit: 10,
            skip: 0,
            hasMore: false
        }
    }
}