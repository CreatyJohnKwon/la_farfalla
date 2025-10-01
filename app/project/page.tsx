"use client"

import ProjectLink from '@/src/components/project/ProjectLink';
import { IProject } from '@/src/entities/type/project';
import { useProjectListQuery } from '@/src/shared/hooks/react-query/useProjectQuery';

const ProjectsPage = () => {
    const { data: projects, isPending: isListSetting, error } = useProjectListQuery();
    
    if (isListSetting || !projects) {
        return (
            <div className="min-h-screen w-full flex-col flex gap-3 justify-center items-center">
                <span className="text-sm sm:text-2xl font-amstel">Loading...</span>
            </div>
        )
    }
    
    // 에러 처리 추가 (권장)
    if (error) {
         return (
            <div className="min-h-screen w-full flex-col flex gap-3 justify-center items-center text-red-600">
                <span className="text-sm sm:text-2xl font-amstel">Error loading projects.</span>
                <span className="text-sm sm:text-base font-amstel">{error.message}</span>
            </div>
        )
    }

    return (
        <div className="min-h-screen w-full flex flex-col justify-start items-center">
            {projects.length > 0 ? (
                <div className="grid h-auto w-[93vw] place-self-center grid-cols-2 md:grid-cols-3 pt-20 md:pt-32 gap-3">
                    {
                        projects.map((project: IProject) => (
                            <ProjectLink
                                key={`${project._id}`} 
                                id={`${project._id}`}
                                title={project.title}
                                imageUrl={project.image}
                                altText={project.title}
                            />
                        ))
                    }
                </div>
            ) : (
                <div className="min-h-screen w-full flex-col flex gap-3 justify-center items-center">
                    <span className="text-sm sm:text-2xl font-amstel">There's no Project</span>
                    <span className="text-sm sm:text-base font-amstel">Please put Project data</span>
                </div>
            )}
        </div>
    );
}

export default ProjectsPage;