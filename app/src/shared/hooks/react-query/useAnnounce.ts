import {
    CreateAnnounceData,
    IAnnounceDTO,
    MutationContext,
    UpdateAnnounceParams,
} from "@/src/entities/type/announce";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
    createAnnounce,
    deleteAnnounce,
    getAnnouncesSSR,
    updateAnnounceById, // 타입 안전한 함수 사용
} from "../../lib/server/announce";

// 공지 목록 조회
export const useAnnouncesQuery = () => {
    return useQuery<IAnnounceDTO[], Error>({
        queryKey: ["announces"],
        queryFn: getAnnouncesSSR,
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

// 개선된 버전 - 컴포넌트에서 알림 제어 가능
export const useUpdateAnnounceMutation = (options?: {
    showSuccessAlert?: boolean;
    showErrorAlert?: boolean;
    onSuccess?: (data: IAnnounceDTO, variables: UpdateAnnounceParams) => void;
    onError?: (error: Error, variables: UpdateAnnounceParams) => void;
}) => {
    const queryClient = useQueryClient();
    const {
        showSuccessAlert = true,
        showErrorAlert = true,
        onSuccess: customOnSuccess,
        onError: customOnError,
    } = options || {};

    return useMutation<
        IAnnounceDTO,
        Error,
        UpdateAnnounceParams,
        MutationContext
    >({
        mutationFn: async ({ id, data }: UpdateAnnounceParams) => {
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
            customOnSuccess?.(updatedAnnounce, variables);

            if (showSuccessAlert) {
                const { visible, ...restData } = variables.data;

                if (Object.keys(restData).length > 0) {
                    alert("공지가 성공적으로 수정되었습니다.");
                }
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

            // 커스텀 에러 콜백 먼저 실행
            customOnError?.(error, variables);

            // 기본 알림 표시 (옵션에 따라)
            if (showErrorAlert) {
                alert(`공지 수정에 실패했습니다: ${error.message}`);
            }
        },
        onSettled: () => {
            queryClient.invalidateQueries({ queryKey: ["announces"] });
        },
    });
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
