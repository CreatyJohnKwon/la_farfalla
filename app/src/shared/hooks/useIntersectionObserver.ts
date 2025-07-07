import { useEffect, useState, useRef } from "react";

interface UseIntersectionObserverProps {
    threshold?: number;
    rootMargin?: string;
    freezeOnceVisible?: boolean;
}

export const useIntersectionObserver = ({
    threshold = 0.1,
    rootMargin = "50px",
    freezeOnceVisible = true,
}: UseIntersectionObserverProps = {}) => {
    const [isVisible, setIsVisible] = useState(false);
    const [hasBeenVisible, setHasBeenVisible] = useState(false);
    const ref = useRef<HTMLElement | null>(null);

    useEffect(() => {
        const element = ref.current;
        if (!element) return;

        // 이미 한 번 보였고 freeze 옵션이 켜져있으면 더 이상 관찰하지 않음
        if (hasBeenVisible && freezeOnceVisible) return;

        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    const isElementVisible = entry.isIntersecting;
                    setIsVisible(isElementVisible);

                    if (isElementVisible && !hasBeenVisible) {
                        setHasBeenVisible(true);
                    }
                });
            },
            { threshold, rootMargin },
        );

        observer.observe(element);

        return () => observer.disconnect();
    }, [threshold, rootMargin, hasBeenVisible, freezeOnceVisible]);

    return { ref, isVisible, hasBeenVisible };
};
