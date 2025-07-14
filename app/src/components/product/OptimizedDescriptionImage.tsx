"use client";

import { useOptimizedImage } from "@/src/shared/hooks/useOptimizedImage";
import DefaultImage from "../../../../public/images/chill.png";
import { useIntersectionObserver } from "../../shared/hooks/useIntersectionObserver";
import { useEffect } from "react";
import Image from "next/image";
import LoadingSpinner from "@/src/widgets/spinner/LoadingSpinner";

// 개별 Description 이미지 컴포넌트
const OptimizedDescriptionImage = ({
    src,
    alt,
    shouldLoad,
    priority,
    onLoad,
    onVisible,
}: {
    src: string;
    alt: string;
    shouldLoad: boolean;
    priority: boolean;
    onLoad: () => void;
    onVisible: () => void;
}) => {
    const {
        ref,
        src: optimizedSrc,
        isLoaded,
        isLoading,
    } = useOptimizedImage({
        src: src || DefaultImage.src,
        fallbackSrc: DefaultImage.src,
        priority,
        quality: priority ? 90 : 80,
        width: 800,
    });

    // 이미지가 뷰포트에 들어올 때 콜백 실행
    const { ref: intersectionRef, isVisible } = useIntersectionObserver({
        threshold: 0.1,
        rootMargin: "200px",
    });

    useEffect(() => {
        if (isVisible && !shouldLoad) {
            onVisible();
        }
    }, [isVisible, shouldLoad, onVisible]);

    // ref 병합
    const combinedRef = (el: HTMLDivElement | null) => {
        if (ref) (ref as any).current = el;
        if (intersectionRef) (intersectionRef as any).current = el;
    };

    return (
        <div ref={combinedRef} className="w-full">
            {/* 스켈레톤 로딩 */}
            {(!isLoaded || isLoading) && shouldLoad && (
                <LoadingSpinner
                    size="md"
                    fullScreen={false}
                    message="Loading..."
                />
            )}

            {/* 이미지 렌더링 */}
            {shouldLoad && (
                <Image
                    src={optimizedSrc}
                    alt={alt}
                    width={800}
                    height={600}
                    className={`h-auto w-full object-cover transition-opacity duration-500 ${
                        isLoaded ? "opacity-100" : "opacity-0"
                    }`}
                    priority={priority}
                    quality={priority ? 90 : 80}
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 80vw, 40vw"
                    onLoad={onLoad}
                    placeholder="blur"
                    blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAAIAAoDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAhEAACAQMDBQAAAAAAAAAAAAABAgMABAUGIWGRkqGx0f/EABUBAQEAAAAAAAAAAAAAAAAAAAMF/8QAGhEAAgIDAAAAAAAAAAAAAAAAAAECEgMRkf/aAAwDAQACEQMRAD8AltJagyeH0AthI5xdrLcNM91BF5pX2HaH9bcfaSXWGaRmknyJckliyjqTzSlT54b6bk+h0R//2Q=="
                />
            )}
        </div>
    );
};

export default OptimizedDescriptionImage;
