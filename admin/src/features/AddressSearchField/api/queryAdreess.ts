import { API } from "@shared/api/instance";
import { useQuery } from "@tanstack/react-query";

interface AddressSuggestion {
  value: string;
  data: {
    postal_code?: string;
    city?: string;
    street?: string;
    house?: string;
    flat?: string;
  };
}

// Тип для ответа API
type AddressSuggestionsResponse = AddressSuggestion[];

const fetchAddressSuggestions = async (query: string): Promise<AddressSuggestionsResponse> => {
  if (query.length < 3) return [];
  
  const response = await API.get<AddressSuggestionsResponse>(`/dadata/suggest?query=${query}`);
  
  if (!response.data) throw new Error('Ошибка при поиске адреса');

  return response.data;
};

export const useAddressSuggestions = (query: string) => {
  const responseQuery = useQuery<AddressSuggestionsResponse, Error>({
    queryKey: ['addressSuggestions', query],
    queryFn: () => fetchAddressSuggestions(query),
    enabled: query.length >= 3,
    staleTime: 1000 * 60 * 5,
  });
  
  return {
    ...responseQuery,
    suggestions: responseQuery.data || []
  };
};

export type UseAddressesReturnType = ReturnType<typeof useAddressSuggestions>;