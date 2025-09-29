import { IProject } from "@/src/entities/type/project";
import { ApiResponse } from "@/src/entities/type/common";
import { baseUrl } from "public/data/common";

// GET: 모든 프로젝트 조회
const getProjectList = async (): Promise<IProject[]> => {
    const res = await fetch(`/api/project`);
    const result: ApiResponse<IProject[]> = await res.json();

    if (!result.success) {
        throw new Error(result.message || 'Failed to fetch project list');
    }
    return result.data || [];
};

// GET: ID로 특정 프로젝트 조회
const getProjectById = async (id: string): Promise<IProject> => {
    const res = await fetch(`${baseUrl}/api/project/${id}`);
    const result: ApiResponse<IProject> = await res.json();

    if (!result.success) {
        throw new Error(result.message || 'Failed to fetch project data');
    }
    if (!result.data) {
        throw new Error('Project data is missing in the response');
    }
    return result.data;
};

// POST: 새 프로젝트 생성
const createProject = async (formData: FormData): Promise<IProject> => {
    const res = await fetch(`/api/project`, {
        method: 'POST',
        body: formData,
    });
    const result: ApiResponse<IProject> = await res.json();

    if (!result.success) {
        throw new Error(result.message || 'Failed to create project');
    }
    if (!result.data) {
        throw new Error('Created project data is missing in the response');
    }
    return result.data;
};

// PUT: ID로 특정 프로젝트 수정
const updateProject = async ({ id, formData }: { id: string; formData: FormData }): Promise<IProject> => {
    const res = await fetch(`/api/project/${id}`, {
        method: 'PUT',
        body: formData,
    });
    const result: ApiResponse<IProject> = await res.json();

    if (!result.success) {
        throw new Error(result.message || 'Failed to update project');
    }
    if (!result.data) {
        throw new Error('Updated project data is missing in the response');
    }
    return result.data;
};

// DELETE: ID로 특정 프로젝트 삭제
const deleteProject = async (id: string): Promise<void> => {
    const res = await fetch(`/api/project/${id}`, {
        method: 'DELETE',
    });
    const result: ApiResponse<null> = await res.json();

    if (!result.success) {
        throw new Error(result.message || 'Failed to delete project');
    }
};

export { 
    getProjectById,
    getProjectList,
    createProject,
    updateProject,
    deleteProject
}