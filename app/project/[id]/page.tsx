"use client"

import { IDescriptionItem } from '@/src/entities/type/products';
import { useOneProjectQuery } from '@/src/shared/hooks/react-query/useProjectQuery';
import Image from 'next/image';
import { useParams } from 'next/navigation';

export const revalidate = 3600;

const ProjectDetailPage = () => {
    const params = useParams();
    const id = params.id as string;

    const { data: project, isLoading, isError, error } = useOneProjectQuery(id);

    if (!project || isError || error) {
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

    return (
        <main className="mt-28 min-h-screen min-w-screen h-auto w-full">
            {project.description.map((item: IDescriptionItem, index: number) => {
                if (item.itemType === 'image') {
                return (
                    <div key={index} className="relative">
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
        </main>
    );
}

export default ProjectDetailPage;