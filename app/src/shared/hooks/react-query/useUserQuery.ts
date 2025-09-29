import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
    fetchUser,
    getUserbyId,
    getUserList,
    updateUser,
    deleteUser,
    restoreUser,
} from "@src/shared/lib/server/user";
import { signOut } from "next-auth/react";
import { useEffect } from "react";
import { UserProfileData } from "@/src/entities/type/common";

const useUserQuery = (enabled = true) => {
    const queryClient = useQueryClient();

    const { data, error, isError, isLoading, refetch } = useQuery({
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

    return { data, error, isError, isLoading, refetch };
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

const useDeleteUserMutation = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: deleteUser,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["user"] }); // 리페치
        },
    });
};

const useRestoreUserMutation = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: restoreUser,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["user"] }); // 리페치
        },
    });
};

const useOneUserQuery = (userId?: string) => {
    return useQuery<UserProfileData, Error>({
        queryKey: ["admin-get-user", userId],
        queryFn: () => getUserbyId(userId!),
        staleTime: 1000 * 60 * 3,
        enabled: Boolean(userId), // userId 없으면 실행 안 함
        retry: false,
    });
};

const useUserListQuery = () => {
    return useQuery<UserProfileData[], Error>({
        queryKey: ["admin-get-user-list"],
        queryFn: () => getUserList(),
        staleTime: 1000 * 60 * 3,
        retry: false,
    });
};

export {
    useUserQuery,
    useUpdateUserMutation,
    useDeleteUserMutation,
    useRestoreUserMutation,
    useOneUserQuery,
    useUserListQuery,
};
