"use client";

import chillImg from "../../public/images/chill.png"; // 첫 번째 이미지 경로
import ProjectLink from "@/src/components/project/ProjectLink";

const page = () => {
    return (
        <div className="h-screen w-screen flex">
            <ProjectLink
                href="/project/spring"
                title="25 Spring/Summer"
                imageUrl={chillImg}
                altText="25 Spring/Summer background"
            />
            <ProjectLink
                href="/project/autumn"
                title="25 Autumn/Winter"
                imageUrl={chillImg}
                altText="25 Autumn/Winter background"
            />
        </div>
    );
};

export default page;