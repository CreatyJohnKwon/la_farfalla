import { connectDB } from '@/src/entities/models/db/mongoose';
import Project from '@/src/entities/models/Project';
import { IDescriptionItem } from '@/src/entities/type/products';
import Image from 'next/image';

export const revalidate = 3600;

export async function generateStaticParams() {
    await connectDB();
    const projects = await Project.find({}, '_id').lean();
    return projects.map((project) => ({
        id: `${project._id}`,
    }));
}

async function getProjectData(id: string): Promise<any> {
    await connectDB();
    const project = await Project.findById(id).lean();
    return project;
}

const ProjectDetailPage = async (props: { params: Promise<{ id: string }> }) => {
    const params = await props.params;
    const project = await getProjectData(params.id);

    if (!project) {
        return (
            <div className="min-h-screen w-full flex-col flex gap-3 justify-center items-center">
                <span className="text-sm sm:text-2xl font-amstel">There's no Project</span>
                <span className="text-sm sm:text-base font-amstel">Please put Project data</span>
            </div>
        )
    }

    return (
        <main className="mt-28 min-h-screen min-w-screen h-auto w-full">
            {/* description 배열을 순회하며 콘텐츠 렌더링 */}
            {project.description.map((item: IDescriptionItem, index: number) => {
                if (item.itemType === 'image') {
                return (
                    <div key={index} className="relative">
                    <Image
                        src={item.src!} // item.src가 있다고 확신할 수 있을 때 ! 사용
                        alt={`${project.title} image ${index + 1}`}
                        width={1920} // 원본 이미지의 너비 (품질 결정에 사용됨)
                        height={1080} // 원본 이미지의 높이
                        sizes="100vw" // 화면 너비에 따라 최적화된 이미지를 제공
                        className="w-full h-auto" // 요청하신 스타일: 너비 100%, 높이 자동
                        priority={index < 2} // 첫 두 이미지는 우선 로딩
                    />
                    </div>
                );
                } else if (item.itemType === 'break') {
                    return <div key={index}><br/></div>; // 줄바꿈
                }
                return null;
            })}
        </main>
    );
}

export default ProjectDetailPage;