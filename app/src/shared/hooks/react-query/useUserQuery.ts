import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { fetchUser, updateUser } from "@src/shared/lib/server/user";
import { signOut } from "next-auth/react";
import { useEffect } from "react";

const useUserQuery = (enabled = true) => {
    const queryClient = useQueryClient();

    const { data, error, isError, isLoading } = useQuery({
        queryKey: ["user"],
        queryFn: fetchUser,
        enabled,
        retry: false,
    });

    useEffect(() => {
        if (error) {
            queryClient.clear(); // 캐시 초기화
            signOut({ callbackUrl: "/" });
        }
    }, [error]);

    return { data, error, isError, isLoading };
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
