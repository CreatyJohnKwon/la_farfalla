import { useEffect, useState, useCallback } from "react";

interface UseImagePreloaderProps {
    src: string;
    priority?: boolean;
    onLoad?: () => void;
    onError?: () => void;
}

export const useImagePreloader = ({
    src,
    priority = false,
    onLoad,
    onError,
}: UseImagePreloaderProps) => {
    const [isLoaded, setIsLoaded] = useState(false);
    const [hasError, setHasError] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    const preloadImage = useCallback(
        (imageSrc: string) => {
            if (!imageSrc || isLoaded || hasError || isLoading) return;

            setIsLoading(true);
            const img = new window.Image();

            img.onload = () => {
                setIsLoaded(true);
                setIsLoading(false);
                onLoad?.();
            };

            img.onerror = () => {
                setHasError(true);
                setIsLoading(false);
                onError?.();
            };

            // R2 최적화된 URL 사용
            if (imageSrc.includes("r2.dev")) {
                try {
                    const url = new URL(imageSrc);
                    url.searchParams.set("width", "500");
                    url.searchParams.set("quality", "80");
                    url.searchParams.set("format", "webp");
                    url.searchParams.set("fit", "cover");
                    img.src = url.toString();
                } catch {
                    img.src = imageSrc;
                }
            } else {
                img.src = imageSrc;
            }
        },
        [src, isLoaded, hasError, isLoading, onLoad, onError],
    );

    useEffect(() => {
        if (priority) {
            // 우선순위 이미지는 즉시 로드
            preloadImage(src);
        } else {
            // 일반 이미지는 약간 지연 후 로드
            const timer = setTimeout(() => preloadImage(src), 100);
            return () => clearTimeout(timer);
        }
    }, [src, priority, preloadImage]);

    return {
        isLoaded,
        hasError,
        isLoading,
        preload: () => preloadImage(src),
    };
};
