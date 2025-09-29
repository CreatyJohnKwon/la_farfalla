import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
    getProjectList,
    getProjectById,
    createProject,
    updateProject,
    deleteProject,
} from "@src/shared/lib/server/project";
import { IProject } from "@/src/entities/type/project";

// 모든 프로젝트 목록을 가져오는 쿼리
const useProjectListQuery = () => {
    return useQuery<IProject[], Error>({
        queryKey: ["projects"],
        queryFn: getProjectList,
        staleTime: 1000 * 60 * 5, // 5분
    });
};

// 특정 프로젝트 하나를 가져오는 쿼리
const useOneProjectQuery = (projectId?: string) => {
    return useQuery<IProject, Error>({
        queryKey: ["project", projectId],
        queryFn: () => getProjectById(projectId!),
        enabled: !!projectId, // projectId가 있을 때만 쿼리 실행
    });
};

// 프로젝트 생성을 위한 뮤테이션
const useCreateProjectMutation = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (formData: FormData) => createProject(formData),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ["projects"] })
    });
};

// 프로젝트 수정을 위한 뮤테이션
const useUpdateProjectMutation = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (variables: { id: string; formData: FormData }) => updateProject(variables),
        onSuccess: (data, variables) => {
            // 성공 시 전체 목록과 해당 프로젝트의 상세 쿼리를 모두 무효화
            queryClient.invalidateQueries({ queryKey: ["projects"] });
            queryClient.invalidateQueries({ queryKey: ["project", variables.id] });
        },
    });
};

// 프로젝트 삭제를 위한 뮤테이션
const useDeleteProjectMutation = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (id: string) => deleteProject(id),
        onSuccess: () => {
            // 성공 시 프로젝트 목록 쿼리를 무효화
            queryClient.invalidateQueries({ queryKey: ["projects"] });
        },
    });
};

export {
    useProjectListQuery,
    useOneProjectQuery,
    useCreateProjectMutation,
    useUpdateProjectMutation,
    useDeleteProjectMutation,
};