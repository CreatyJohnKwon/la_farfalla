"use client"

import ProjectLink from '@/src/components/project/ProjectLink';
import { IProject } from '@/src/entities/type/project';
import { useProjectListQuery } from '@/src/shared/hooks/react-query/useProjectQuery';
import { useState, useEffect } from 'react';

const ProjectsPage = () => {
    const [showScrollTopButton, setShowScrollTopButton] = useState<boolean>(false);
    const { data: projects, isPending: isListSetting, error } = useProjectListQuery();

    useEffect(() => {
        const handleScroll = () => {
            const { scrollHeight, clientHeight } = document.documentElement;

            const isHeightSufficient = scrollHeight >= clientHeight * 2;

            const scrollThreshold = (scrollHeight - clientHeight) * 0.5;
            const isScrolledEnough = window.scrollY > scrollThreshold;

            if (isHeightSufficient && isScrolledEnough) {
                setShowScrollTopButton(true);
            } else {
                setShowScrollTopButton(false);
            }
        };

        window.addEventListener("scroll", handleScroll);

        return () => {
            window.removeEventListener("scroll", handleScroll);
        };
    }, []);

    const scrollToTop = () => {
        window.scrollTo({
            top: 0,
            behavior: "smooth",
        });
    };
    
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
            
            <button
                onClick={scrollToTop}
                aria-label="맨 위로 스크롤"
                className={`fixed bottom-20 focus:bottom-24 md:hover:bottom-24 right-7 z-50 md:p-3 md:mb-4 text-gray-500 hover:text-gray-600 transition-all duration-300 ${
                    showScrollTopButton ? "opacity-100 visible" : "opacity-0 invisible"
                }`}
            >
                <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={2}
                    stroke="currentColor"
                    className="w-6 h-6"
                >
                    <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M4.5 15.75l7.5-7.5 7.5 7.5"
                    />
                </svg>
            </button>
        </div>
    );
}

export default ProjectsPage;