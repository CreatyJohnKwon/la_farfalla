"use client";

import { useState, useMemo } from "react";
import Image from "next/image";
import { useProjectListQuery, useDeleteProjectMutation } from "@/src/shared/hooks/react-query/useProjectQuery";
import { IProject } from "@/src/entities/type/project";
import ProjectFormModal from "@/src/widgets/modal/project/ProjectFormModal";

// 검색 함수 (프로젝트 제목 기준)
const searchProjects = (projects: IProject[], query: string): IProject[] => {
    if (!query) {
        return projects;
    }
    const lowercasedQuery = query.toLowerCase();
    return projects.filter(project => 
        project.title.toLowerCase().includes(lowercasedQuery)
    );
};

const AdminProjectsPage = () => {
    // 1. 데이터 가져오기 및 뮤테이션 설정 (React Query)
    const { data: projects, isLoading, isError, refetch } = useProjectListQuery();
    const { mutate: deleteProject } = useDeleteProjectMutation();

    // 2. UI 상태 관리 (useState)
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedProject, setSelectedProject] = useState<IProject | null>(null);
    const [searchQuery, setSearchQuery] = useState("");

    // 3. 이벤트 핸들러
    const handleOpenCreateModal = () => {
        setSelectedProject(null);
        setIsModalOpen(true);
    };

    const handleOpenUpdateModal = (project: IProject) => {
        setSelectedProject(project);
        setIsModalOpen(true);
    };

    const handleDeleteProject = (projectId: string) => {
        if (window.confirm("정말로 이 프로젝트를 삭제하시겠습니까?")) {
            deleteProject(projectId, {
                onSuccess: () => {
                    alert("삭제되었습니다.");
                    refetch(); // 목록을 다시 불러옵니다.
                },
                onError: (error) => alert(`오류: ${error.message}`),
            });
        }
    };

    const clearSearch = () => setSearchQuery("");

    // 4. 검색 및 정렬된 데이터 (useMemo)
    const filteredAndSortedProjects = useMemo(() => {
        if (!projects) return [];
        const searched = searchProjects(projects, searchQuery);
        return searched;
    }, [projects, searchQuery]);

    if (isLoading) return <div>Loading...</div>;
    if (isError) return <div>An error occurred.</div>;

    return (
        <div className="w-full max-w-full p-4 sm:p-6 lg:p-10 whitespace-nowrap">
            {/* 헤더 */}
            <header className="mb-6 mt-[7vh]">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex items-center gap-3">
                        <h1 className="text-xl font-semibold text-gray-800 sm:text-2xl">프로젝트 관리</h1>
                        <button
                            onClick={() => refetch()}
                            className="whitespace-nowrap rounded-md bg-gray-800 px-2 py-2 text-sm text-white hover:bg-gray-700"
                            title="새로고침"
                        >
                            <svg
                                className="h-4 w-4 sm:h-5 sm:w-5"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                                />
                            </svg>
                        </button>
                        <button onClick={() => handleOpenCreateModal()} className="whitespace-nowrap bg-gray-800 text-white px-4 py-2 rounded-md hover:bg-gray-700 text-sm">
                            새 프로젝트 추가
                        </button>
                    </div>

                    <div className="flex flex-col items-start gap-3 sm:flex-row sm:items-center">
                        {/* 검색 입력 */}
                        <div className="relative">
                            <input type="text" placeholder="프로젝트 제목 검색" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="h-full w-auto rounded-sm border border-gray-300 bg-white px-3 py-2 text-sm focus:border-gray-500 focus:outline-none" />
                            {searchQuery && <button onClick={clearSearch} className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-gray-600">×</button>}
                        </div>
                    </div>
                </div>
            </header>

            {/* 테이블 */}
            <div className="overflow-hidden bg-white min-h-screen h-auto rounded-md">
                <div className="overflow-x-auto">
                    <table className="w-full min-w-[600px] text-sm">
                        <thead className="bg-gray-50">
                            <tr className="border-b text-gray-600">
                                <th className="w-[15%] px-4 py-3 text-left font-medium">대표 이미지</th>
                                <th className="w-[45%] px-4 py-3 text-left font-medium">프로젝트 제목</th>
                                <th className="w-[20%] px-4 py-3 text-left font-medium">생성일</th>
                                <th className="w-[20%] px-4 py-3 text-center font-medium">관리</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredAndSortedProjects.map((project: IProject) => (
                                <tr key={`${project._id}`} className="border-b">
                                    <td className="p-3">
                                        <Image src={project.image} alt={project.title} width={100} height={100} className="w-20 h-20 object-cover rounded-md" />
                                    </td>
                                    <td className="px-4 py-3 font-medium text-gray-900">{project.title}</td>
                                    <td className="px-4 py-3 text-gray-500">{new Date(project.createdAt).toLocaleDateString("ko-KR")}</td>
                                    <td className="px-4 py-3">
                                        <div className="flex items-center justify-center gap-1">
                                            {/* 수정 버튼 */}
                                            <button 
                                                onClick={() => handleOpenUpdateModal(project)}
                                                className="flex min-h-[44px] min-w-[44px] items-center justify-center rounded-sm text-gray-400 transition-colors hover:bg-blue-50 hover:text-blue-600"
                                                title="수정"    
                                            >
                                                <svg
                                                    className="h-4 w-4"
                                                    fill="none"
                                                    stroke="currentColor"
                                                    viewBox="0 0 24 24"
                                                >
                                                    <path
                                                        strokeLinecap="round"
                                                        strokeLinejoin="round"
                                                        strokeWidth={2}
                                                        d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                                                    />
                                                </svg>
                                            </button>

                                            {/* 삭제 버튼 */}
                                            <button
                                                onClick={() => handleDeleteProject(`${project._id}`)} 
                                                className="flex min-h-[44px] min-w-[44px] items-center justify-center rounded-sm text-gray-400 transition-colors hover:bg-red-50 hover:text-red-600"
                                                title="삭제"
                                            >
                                                <svg
                                                    className="h-4 w-4"
                                                    fill="none"
                                                    stroke="currentColor"
                                                    viewBox="0 0 24 24"
                                                >
                                                    <path
                                                        strokeLinecap="round"
                                                        strokeLinejoin="round"
                                                        strokeWidth={2}
                                                        d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                                                    />
                                                </svg>
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                {filteredAndSortedProjects.length === 0 && (
                    <div className="py-12 text-center text-gray-500">
                        {searchQuery ?  
                            (
                                <>
                                    <span className="text-sm sm:text-base font-pretendard">검색 결과가 없습니다</span>
                                </>
                            ) : (
                                <>
                                    <p className="text-sm sm:text-base font-amstel">There's no Project</p>
                                    <p className="text-sm sm:text-xs font-amstel">Please put Project data</p>
                                </>
                            )
                        }
                        
                    </div>
                )}
            </div>
            
            {/* 모달 */}
            {isModalOpen && (
                <ProjectFormModal
                    project={selectedProject || undefined}
                    onClose={() => setIsModalOpen(false)}
                />
            )}
        </div>
    );
};

export default AdminProjectsPage;