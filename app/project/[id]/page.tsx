"use client"

import { IDescriptionItem } from '@/src/entities/type/products';
import { useOneProjectQuery } from '@/src/shared/hooks/react-query/useProjectQuery';
import Image from 'next/image';
import { useParams } from 'next/navigation';
import { useEffect, useState } from 'react';

const ProjectDetailPage = () => {
    const params = useParams();
    const id = params.id as string;
    const [showScrollTopButton, setShowScrollTopButton] = useState<boolean>(false);
    const { data: project, isLoading, isError, error } = useOneProjectQuery(id);

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

    if (isError || error) {
        return (
            <div className="min-h-screen w-full flex-col flex gap-3 justify-center items-center">
                <span className="text-sm sm:text-2xl font-amstel">There's no Project</span>
                <span className="text-sm sm:text-base font-amstel">Please put Project data</span>
                {isError && <span className="text-sm sm:text-base font-amstel">{isError}</span>}
                {error && <span className="text-sm sm:text-base font-amstel">{error.message}</span>}
            </div>
        )
    }

    if (isLoading) {
        return (
            <div className="min-h-screen w-full flex-col flex gap-3 justify-center items-center">
                <span className="text-sm sm:text-base font-amstel">Loading...</span>
            </div>
        )
    }

    return project && (
        <main className="mt-12 sm:mt-20 min-h-screen max-w-screen h-auto w-full">
            {project.description.map((item: IDescriptionItem, index: number) => {
                if (item.itemType === 'image') {
                    return (
                        <div key={index} className="relative h-auto">
                            <Image
                                src={item.src!}
                                alt={`${project.title} image ${index + 1}`}
                                width={1920}
                                height={1080}
                                sizes="100vw"
                                className="w-full h-auto"
                                priority
                            />
                        </div>
                    );
                } else if (item.itemType === 'break') {
                    return <div key={index}><br/></div>;
                }
                return null;
            })}
            
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
        </main>
    );
}

export default ProjectDetailPage;