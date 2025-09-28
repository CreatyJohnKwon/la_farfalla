"use client";

import chillImg from "../../public/images/chill.png";
import ProjectLink from "@/src/components/project/ProjectLink";

// 페이지 레이아웃 전체를 담당하는 컴포넌트
const ProjectLayout = () => {
    return (
        <div className="grid h-screen w-full grid-rows-3">
            <ProjectLink
                href="/project-1"
                title="25 Spring/Summer"
                imageUrl={chillImg}
                altText="25 Spring/Summer background"
            />
            <ProjectLink
                href="/project-2"
                title="25 Autumn/Winter"
                imageUrl={chillImg} // TODO: 다른 이미지로 교체하세요
                altText="25 Autumn/Winter background"
            />
            <ProjectLink
                href="/project-3"
                title="Archive"
                imageUrl={chillImg} // TODO: 다른 이미지로 교체하세요
                altText="Archive background"
            />
        </div>
    );
};

export default ProjectLayout;