import { CreateAnnounceData, IAnnounceDTO } from "@/src/entities/type/announce";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
    createAnnounce,
    deleteAnnounce,
    fetchAnnounces,
    updateAnnounceById, // 타입 안전한 함수 사용
} from "../../lib/server/announce";

// 공지 목록 조회
export const useAnnouncesQuery = () => {
    return useQuery<IAnnounceDTO[], Error>({
        queryKey: ["announces"],
        queryFn: fetchAnnounces,
        retry: 1,
        staleTime: 5 * 60 * 1000,
    });
};

// 공지 생성
export const useCreateAnnounceMutation = () => {
    const queryClient = useQueryClient();

    return useMutation<IAnnounceDTO, Error, CreateAnnounceData>({
        mutationFn: createAnnounce,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["announces"] });
            alert("공지가 성공적으로 생성되었습니다.");
        },
        onError: (error: any) => {
            console.error("❌ 공지 생성 실패:", error);
            alert(`공지 생성에 실패했습니다: ${error.message}`);
        },
    });
};

// 공지 수정 - 타입 안전성 개선
interface UpdateAnnounceParams {
    id: string;
    data: Partial<Omit<IAnnounceDTO, "_id">>;
}

// onMutate에서 반환하는 context 타입 정의
interface MutationContext {
    previousAnnounces: IAnnounceDTO[] | undefined;
}

export const useUpdateAnnounceMutation = () => {
    const queryClient = useQueryClient();

    return useMutation<
        IAnnounceDTO,
        Error,
        UpdateAnnounceParams,
        MutationContext
    >({
        mutationFn: async ({ id, data }: UpdateAnnounceParams) => {
            // 타입 안전한 함수 사용
            return updateAnnounceById(id, data);
        },
        onMutate: async ({ id, data }): Promise<MutationContext> => {
            await queryClient.cancelQueries({ queryKey: ["announces"] });

            const previousAnnounces = queryClient.getQueryData<IAnnounceDTO[]>([
                "announces",
            ]);

            // Optimistic update
            queryClient.setQueryData<IAnnounceDTO[]>(
                ["announces"],
                (oldData) => {
                    if (!oldData) return oldData;
                    return oldData.map((announce) =>
                        announce._id.toString() === id
                            ? { ...announce, ...data }
                            : announce,
                    );
                },
            );

            return { previousAnnounces };
        },
        onSuccess: (updatedAnnounce, variables) => {
            if (variables.data.visible !== undefined) {
                const message = variables.data.visible
                    ? "공지가 표시됩니다."
                    : "공지가 숨겨집니다.";
                alert(message);
            } else {
                alert("공지가 성공적으로 수정되었습니다.");
            }
        },
        onError: (error: any, variables, context) => {
            // 실패 시 롤백
            if (context?.previousAnnounces) {
                queryClient.setQueryData(
                    ["announces"],
                    context.previousAnnounces,
                );
            }
            console.error("❌ 공지 업데이트 실패:", error);
            alert(`공지 수정에 실패했습니다: ${error.message}`);
        },
        onSettled: () => {
            queryClient.invalidateQueries({ queryKey: ["announces"] });
        },
    });
};

// 간편한 visible 토글 전용 훅
export const useToggleVisibleMutation = () => {
    const { mutate: updateAnnounce, ...rest } = useUpdateAnnounceMutation();

    return {
        mutate: (announce: IAnnounceDTO) => {
            updateAnnounce({
                id: announce._id.toString(),
                data: { visible: !announce.visible },
            });
        },
        ...rest,
    };
};

// 공지 삭제
export const useDeleteAnnounceMutation = () => {
    const queryClient = useQueryClient();

    return useMutation<void, Error, string, MutationContext>({
        mutationFn: (id: string) => deleteAnnounce(id),
        onMutate: async (id: string): Promise<MutationContext> => {
            await queryClient.cancelQueries({ queryKey: ["announces"] });

            const previousAnnounces = queryClient.getQueryData<IAnnounceDTO[]>([
                "announces",
            ]);

            // Optimistic update
            queryClient.setQueryData<IAnnounceDTO[]>(
                ["announces"],
                (oldData) => {
                    if (!oldData) return oldData;
                    return oldData.filter(
                        (announce) => announce._id.toString() !== id,
                    );
                },
            );

            return { previousAnnounces };
        },
        onSuccess: () => {
            alert("공지가 성공적으로 삭제되었습니다.");
        },
        onError: (error: any, id: string, context) => {
            // 실패 시 롤백
            if (context?.previousAnnounces) {
                queryClient.setQueryData(
                    ["announces"],
                    context.previousAnnounces,
                );
            }
            console.error("❌ 공지 삭제 실패:", error);
            alert(`공지 삭제에 실패했습니다: ${error.message}`);
        },
        onSettled: () => {
            queryClient.invalidateQueries({ queryKey: ["announces"] });
        },
    });
};
