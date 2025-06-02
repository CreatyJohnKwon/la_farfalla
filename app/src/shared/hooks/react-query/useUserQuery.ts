import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { fetchUser, updateUser, getCoupon } from "@src/shared/lib/server/user";

const useUserQuery = () => {
    return useQuery({ queryKey: ["user"], queryFn: fetchUser });
};

const useUpdateUserMutation = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: updateUser,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["user"] }); // 리페치
        },
    });
};

export { useUserQuery, useUpdateUserMutation };
