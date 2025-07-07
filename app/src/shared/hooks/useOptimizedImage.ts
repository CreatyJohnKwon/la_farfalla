import { useState, useCallback } from "react";
import { useImagePreloader } from "./useImagePreloader";
import { useIntersectionObserver } from "./useIntersectionObserver";

interface UseOptimizedImageProps {
    src: string;
    fallbackSrc?: string;
    priority?: boolean;
    quality?: number;
    width?: number;
}

export const useOptimizedImage = ({
    src,
    fallbackSrc = "/images/placeholder.jpg",
    priority = false,
    quality = 80,
    width = 500,
}: UseOptimizedImageProps) => {
    const [currentSrc, setCurrentSrc] = useState(src);
    const { ref, isVisible, hasBeenVisible } = useIntersectionObserver({
        threshold: 0.1,
        rootMargin: "100px",
    });

    const optimizeImageUrl = useCallback(
        (url: string) => {
            if (!url) return fallbackSrc;

            try {
                if (url.includes("r2.dev")) {
                    const urlObj = new URL(url);
                    urlObj.searchParams.set("width", width.toString());
                    urlObj.searchParams.set("quality", quality.toString());
                    urlObj.searchParams.set("format", "webp");
                    urlObj.searchParams.set("fit", "cover");
                    return urlObj.toString();
                }
                return url;
            } catch {
                return url;
            }
        },
        [fallbackSrc, width, quality],
    );

    const { isLoaded, hasError, isLoading } = useImagePreloader({
        src: optimizeImageUrl(currentSrc),
        priority: priority || isVisible,
        onError: () => {
            if (currentSrc !== fallbackSrc) {
                setCurrentSrc(fallbackSrc);
            }
        },
    });

    const shouldLoad = priority || isVisible || hasBeenVisible;

    return {
        ref,
        src: shouldLoad ? optimizeImageUrl(currentSrc) : fallbackSrc,
        isLoaded,
        hasError,
        isLoading,
        isVisible,
        shouldLoad,
    };
};
