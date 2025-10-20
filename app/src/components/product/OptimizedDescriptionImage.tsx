"use client";

import { useIntersectionObserver } from "@/src/shared/hooks/useIntersectionObserver";
import DefaultImage from "../../../../public/images/white_background.png";
import Image from "next/image";
import { useOptimizedImage } from "@/src/shared/hooks/useOptimizedImage";

// 개별 Description 이미지 컴포넌트
const OptimizedDescriptionImage = ({
    src,
    alt,
    shouldLoad,
    priority,
    onLoad,
}: {
    src?: string;
    alt: string;
    shouldLoad?: boolean;
    priority?: boolean;
    onLoad?: () => void; // onLoad를 선택적(Optional)으로 변경
}) => {
    // 훅에서 최적화된 src와 로드 상태를 가져옴
    const {
        ref,
        src: optimizedSrc,
        isLoaded,
    } = useOptimizedImage({
        src: src || DefaultImage.src,
        fallbackSrc: DefaultImage.src,
        priority, 
        // 🚨 품질 1%는 이미지 훼손. 훅에 품질 설정을 맡기기 위해 quality 인수를 제거합니다.
        // width: 800, // width는 Next/Image에 의해 처리되므로 훅에서 제거를 고려하거나, Next/Image의 width/height와 일치시켜야 합니다.
    });

    // 이미지가 뷰포트에 들어올 때 콜백 실행
    // rootMargin: "200px" 설정은 이미지가 뷰포트 상하 200px 안에 들어올 때 미리 로드(Pre-load)하도록 합니다.
    const { ref: intersectionRef, isVisible } = useIntersectionObserver({
        threshold: 0.1,
        rootMargin: "200px",
    });

    // ✅ LCP(priority=true)인 경우 무조건 로드
    // ✅ 그 외는 뷰포트 안에 진입했을 때만 로드 (isVisible)
    // shouldLoad는 외부 강제 로드 플래그로 유지합니다.
    const actualLoad = priority || isVisible || shouldLoad;

    // ref 병합
    const combinedRef = (el: HTMLDivElement | null) => {
        if (ref) (ref as any).current = el;
        if (intersectionRef) (intersectionRef as any).current = el;
    };

    return (
        // ✅ Intersection Observer를 관찰할 ref를 div에 연결
        <div ref={combinedRef} className="w-full">
            {actualLoad && ( 
                <Image
                    src={optimizedSrc}
                    alt={alt}
                    width={800}
                    height={600}
                    className={`h-auto w-full object-cover transition-opacity duration-500 ease-in ${
                        isLoaded ? "opacity-100" : "opacity-0"
                    }`}
                    
                    priority={priority} 
                    
                    // ✅ quality를 제거하여 훅 또는 Next.js의 기본값(75)을 사용
                    // quality={75}를 명시하거나, 훅의 설정을 믿고 제거합니다. 여기서는 훅의 설정을 따릅니다.
                    
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 80vw, 40vw"
                    onLoad={onLoad} 
                />
            )}
            {/* 🚨 지연 로딩 중 빈 공간 채우기: 
                 actualLoad가 false일 때 렌더링될 대체 요소를 제공해야 레이아웃이 밀리지 않습니다. 
            */}
            {!actualLoad && (
                <div style={{ width: '800px', height: '600px' }} 
                     className="w-full bg-gray-100 animate-pulse"
                />
            )}
        </div>
    );
};

export default OptimizedDescriptionImage;