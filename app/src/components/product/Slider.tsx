"use client";

import Image from "next/image";
import { useState, useRef, useEffect } from "react";
import DefaultImage from "../../../../public/images/chill.png";
import { motion, PanInfo, useAnimation, Transition } from "framer-motion";

const slideAnimation: Transition = {
    type: "spring",
    stiffness: 300,
    damping: 40,
    mass: 0.5,
};

const Slider = ({ images }: { images: string[] }) => {
    const [current, setCurrent] = useState(0);
    const [loadedImages, setLoadedImages] = useState<Set<number>>(new Set());
    
    const containerRef = useRef<HTMLDivElement>(null);
    const [width, setWidth] = useState(0);

    const controls = useAnimation();

    useEffect(() => {
        const element = containerRef.current;
        if (!element) return;

        const resizeObserver = new ResizeObserver(() => {
            setWidth(element.offsetWidth);
        });

        setWidth(element.offsetWidth);
        resizeObserver.observe(element);

        return () => resizeObserver.disconnect();
    }, []);
    
    useEffect(() => {
        controls.start({
            x: -current * width,
            transition: slideAnimation,
        });
    }, [current, width, controls]);
    
    const slideWithLoop = (direction: 'next' | 'prev') => {
        if (direction === 'next') {
            setCurrent((prev) => (prev + 1) % images.length);
        } else {
            setCurrent((prev) => (prev - 1 + images.length) % images.length);
        }
    };

    const handleDragEnd = (_: any, info: PanInfo) => {
        const { offset, velocity } = info;
        const threshold = width / 3;

        if (offset.x > threshold || velocity.x > 500) {
            setCurrent((prev) => Math.max(prev - 1, 0));
        } else if (offset.x < -threshold || velocity.x < -500) {
            setCurrent((prev) => Math.min(prev + 1, images.length - 1));
        } else {
            controls.start({
                x: -current * width,
                transition: slideAnimation,
            });
        }
    };
    
    const getImageSrc = (image: string | File): string => {
        if (typeof image === "string") return image;
        return URL.createObjectURL(image);
    };

    const handleImageLoad = (index: number) => {
        setLoadedImages((prev) => new Set(prev).add(index));
    };

    return (
        <div className="w-full md:w-1/2 md:px-3">
            <div ref={containerRef} className="overflow-hidden relative group">
                <motion.div
                    className="flex"
                    drag="x"
                    dragConstraints={{
                        right: 0,
                        left: -width * (images.length - 1),
                    }}
                    dragElastic={0.2}
                    dragMomentum={false}
                    animate={controls}
                    onDragEnd={handleDragEnd}
                    // ✅ "튕김 현상" 방지를 위해 이 스타일을 추가합니다.
                    style={{ touchAction: 'pan-y' }}
                >
                    {images.map((img, i) => {
                        const isLoaded = loadedImages.has(i);
                        return (
                            <div key={i} className="relative aspect-[3/4] min-w-full flex-shrink-0">
                                {!isLoaded && (
                                    <div className="absolute inset-0 z-10 animate-pulse bg-gray-200"></div>
                                )}
                                <Image
                                    src={img ? getImageSrc(img) : DefaultImage}
                                    alt={`img-${i}`}
                                    fill
                                    className={`object-cover transition-opacity duration-300 ${
                                        isLoaded ? "opacity-100" : "opacity-0"
                                    }`}
                                    priority={i === 0}
                                    onLoad={() => handleImageLoad(i)}
                                    onError={() => handleImageLoad(i)}
                                    sizes="(max-width: 768px) 100vw, 50vw"
                                />
                            </div>
                        );
                    })}
                </motion.div>

                {/* Buttons and Dots */}
                <button
                    onClick={() => slideWithLoop('prev')}
                    className="group absolute -left-4 top-1/2 z-10 -translate-y-1/2 ps-5 opacity-0 group-hover:opacity-100 transition-all duration-300 sm:block hidden"
                >
                    <svg className="h-[5vh] w-[5vh] text-black/40 transition-transform group-hover:-translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" /></svg>
                </button>
                <button
                    onClick={() => slideWithLoop('next')}
                    className="group absolute -right-4 top-1/2 z-10 -translate-y-1/2 pe-5 opacity-0 group-hover:opacity-100 transition-all duration-300 sm:block hidden"
                >
                    <svg className="h-[5vh] w-[5vh] text-black/40 transition-transform group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" /></svg>
                </button>
                <div className="absolute bottom-5 left-1/2 flex -translate-x-1/2 gap-2">
                    {images.map((_, idx) => (
                        <button
                            key={idx}
                            onClick={() => setCurrent(idx)}
                            className={`h-[0.8vh] w-[0.8vh] rounded-full ${
                                current === idx ? "scale-125 bg-white" : "bg-gray-400"
                            } transition-transform duration-300`}
                        />
                    ))}
                </div>
            </div>
        </div>
    );
};

export default Slider;