"use client";

import Image from "next/image";
import { useState, useRef } from "react";
import DefaultImage from "../../../../public/images/chill.png";
import { motion, useMotionValue, useAnimation } from "framer-motion";

const Slider = ({ images }: { images: string[] }) => {
    const [current, setCurrent] = useState(0);
    const [loadedImages, setLoadedImages] = useState<Set<number>>(new Set());
    const x = useMotionValue(0);
    const controls = useAnimation();

    const containerRef = useRef<HTMLDivElement>(null);
    const widthRef = useRef<number>(0);

    const slideTo = (index: number) => {
        setCurrent(index);
        controls.start({
            x: -index * widthRef.current,
            transition: { type: "spring", stiffness: 300, damping: 30 },
        });
    };

    const handleDragEnd = (_: any, info: { offset: { x: number } }) => {
        const threshold = widthRef.current / 4;
        if (info.offset.x > threshold && current > 0) {
            slideTo(current - 1);
        } else if (info.offset.x < -threshold && current < images.length - 1) {
            slideTo(current + 1);
        } else {
            slideTo(current); // Snap back
        }
    };

    const getImageSrc = (image: string | File): string => {
        if (typeof image === "string") return image;
        return URL.createObjectURL(image);
    };

    const handleImageLoad = (index: number) => {
        setLoadedImages((prev) => new Set(prev).add(index));
    };

    const handleImageError = (index: number) => {
        setLoadedImages((prev) => new Set(prev).add(index));
    };

    return (
        <div className="w-full md:w-1/2 md:px-3">
            <div
                className="overflow-hidden"
                ref={(el) => {
                    if (el) widthRef.current = el.offsetWidth;
                    containerRef.current = el;
                }}
            >
                <div className="relative group">
                    <motion.div
                        className="flex"
                        drag="x"
                        style={{ x }}
                        dragConstraints={{ left: 0, right: 0 }}
                        onDragEnd={handleDragEnd}
                        animate={controls}
                    >
                        {images.map((img, i) => {
                            const isLoaded = loadedImages.has(i);

                            return (
                                <div
                                    key={i}
                                    className="relative aspect-[3/4] min-w-full flex-shrink-0"
                                >
                                    {/* 스켈레톤 로딩 */}
                                    {!isLoaded && (
                                        <div className="absolute inset-0 z-10 animate-fade-in"></div>
                                    )}

                                    <Image
                                        src={
                                            img
                                                ? getImageSrc(img)
                                                : DefaultImage
                                        }
                                        alt={`img-${i}`}
                                        fill
                                        className={`object-cover transition-opacity duration-300 ${
                                            isLoaded
                                                ? "opacity-100"
                                                : "opacity-0"
                                        }`}
                                        priority={i === 0}
                                        onLoad={() => handleImageLoad(i)}
                                        onError={() => handleImageError(i)}
                                    />
                                </div>
                            );
                        })}
                    </motion.div>
                    
                    {/* 모던한 큰 화살표 버튼 */}
                    <button
                        onClick={() =>
                            slideTo(
                                current > 0 ? current - 1 : images.length - 1,
                            )
                        }
                        className="group absolute -left-4 top-1/2 z-10 -translate-y-1/2 ps-5 opacity-0 group-hover:opacity-100 transition-all duration-300 sm:block hidden"
                    >
                        <svg
                            className="h-[5vh] w-[5vh] text-black/40 transition-transform group-hover:-translate-x-1"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2.5}
                                d="M15 19l-7-7 7-7"
                            />
                        </svg>
                    </button>
                    <button
                        onClick={() => slideTo((current + 1) % images.length)}
                        className="group absolute -right-4 top-1/2 z-10 -translate-y-1/2 pe-5 opacity-0 group-hover:opacity-100 transition-all duration-300 sm:block hidden"
                    >
                        <svg
                            className="h-[5vh] w-[5vh] text-black/40 transition-transform group-hover:translate-x-1"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2.5}
                                d="M9 5l7 7-7 7"
                            />
                        </svg>
                    </button>

                    {/* 인디케이터: indicator */}
                    <div className="absolute bottom-5 left-1/2 flex -translate-x-1/2 gap-2">
                        {images.map((_, idx) => (
                            <button
                                key={idx}
                                onClick={() => slideTo(idx)}
                                className={`h-[0.8vh] w-[0.8vh] rounded-full ${
                                    current === idx
                                        ? "scale-125 bg-white"
                                        : "bg-gray-400"
                                } transition`}
                            />
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Slider;
