import { API } from "@/shared/api/API";
import { UserType } from "@core/types/user-type";
import { useMutation, useQueryClient } from "@tanstack/react-query";

export const updateUser = async (updateData: Partial<UserType>) => {
    try {
      const response = await API.patch<UserType>('/users/update', updateData);
      return response.data;
    } catch (error) {
      throw error
    }
}

export const useUpdateUser = () => {
  const queryClient = useQueryClient();
  
  const query = useMutation<UserType, Error, Partial<UserType>>({
    mutationFn: updateUser,
    onSuccess: (updatedUser) => {
      queryClient.setQueryData(['user', updatedUser.id], updatedUser);
    },
  });
  
  return {
    ...query,
    updateUser: query.mutateAsync
  }
};
