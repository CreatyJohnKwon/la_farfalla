import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
    getSeason,
    postSeason,
    putSeason,
    deleteSeason,
} from "../../lib/server/season";
import { Season } from "@/src/entities/type/interfaces";

const useSeasonQuery = () => {
    return useQuery<Season[], Error>({
        queryKey: ["get-season"],
        queryFn: () => getSeason(),
        staleTime: 1000 * 60 * 60, // 1시간 캐시
        retry: true,
    });
};

const useCreateSeasonMutation = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (data: { title: string; year: string }) => postSeason(data),
        onSuccess: () => {
            // 시즌 목록 쿼리 무효화하여 새로 고침
            queryClient.invalidateQueries({ queryKey: ["get-season"] });
        },
        onError: (error) => {
            console.error("시즌 생성 실패:", error);
        },
    });
};

const useUpdateSeasonMutation = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (data: { _id: string; title: string; year: string }) =>
            putSeason(data),
        onSuccess: () => {
            // 시즌 목록 쿼리 무효화하여 새로 고침
            queryClient.invalidateQueries({ queryKey: ["get-season"] });
        },
        onError: (error) => {
            console.error("시즌 수정 실패:", error);
        },
    });
};

const useDeleteSeasonMutation = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (id: string) => deleteSeason(id),
        onSuccess: () => {
            // 시즌 목록 쿼리 무효화하여 새로 고침
            queryClient.invalidateQueries({ queryKey: ["get-season"] });
        },
        onError: (error) => {
            console.error("시즌 삭제 실패:", error);
        },
    });
};

export {
    useSeasonQuery,
    useCreateSeasonMutation,
    useUpdateSeasonMutation,
    useDeleteSeasonMutation,
};
