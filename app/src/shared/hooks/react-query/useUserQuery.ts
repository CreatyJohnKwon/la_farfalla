import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { fetchUser, updateUser } from "@/src/shared/lib/server/user";

export const useUserQuery = () => {
  return useQuery({ queryKey: ["user"], queryFn: fetchUser });
};

export const useUpdateUserMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateUser,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["user"] }); // 리페치
    },
  });
};
