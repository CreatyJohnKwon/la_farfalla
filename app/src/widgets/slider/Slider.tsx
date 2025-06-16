"use client";

import Image from "next/image";
import { useState, useRef } from "react";
import DefaultImage from "../../../../public/images/chill.png";
import { motion, useMotionValue, useAnimation } from "framer-motion";

const Slider = ({ images }: { images: string[] }) => {
    const [current, setCurrent] = useState(0);
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

    return (
        <div
            className="w-full overflow-hidden"
            ref={(el) => {
                if (el) widthRef.current = el.offsetWidth;
                containerRef.current = el;
            }}
        >
            <div className="relative">
                <motion.div
                    className="flex"
                    drag="x"
                    style={{ x }}
                    dragConstraints={{ left: 0, right: 0 }}
                    onDragEnd={handleDragEnd}
                    animate={controls}
                >
                    {images.map((img, i) => (
                        <div
                            key={i}
                            className="aspect-[3/4] w-full flex-shrink-0"
                            style={{ width: `${100}%` }}
                        >
                            <Image
                                src={img ? getImageSrc(img) : DefaultImage}
                                alt={`img-${i}`}
                                width={500}
                                height={500}
                                className="h-full w-full object-fill"
                                priority={i === 0}
                            />
                        </div>
                    ))}
                </motion.div>

                {/* 인디케이터: indicator */}
                <div className="absolute bottom-5 left-1/2 flex -translate-x-1/2 gap-2">
                    {images.map((_, idx) => (
                        <button
                            key={idx}
                            onClick={() => slideTo(idx)}
                            className={`h-2 w-2 rounded-full ${
                                current === idx
                                    ? "scale-125 bg-white"
                                    : "bg-gray-400"
                            } transition`}
                        />
                    ))}
                </div>

                {/* 모던한 큰 화살표 버튼 */}
                <button
                    onClick={() =>
                        slideTo(current > 0 ? current - 1 : images.length - 1)
                    }
                    className="group absolute left-0 top-1/2 z-10 -translate-y-1/2 rounded-full p-4 transition-all"
                >
                    <svg
                        className="h-16 w-16 text-black/40 transition-transform group-hover:-translate-x-1"
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
                    className="group absolute right-0 top-1/2 z-10 -translate-y-1/2 rounded-full p-4 transition-all"
                >
                    <svg
                        className="h-16 w-16 text-black/40 transition-transform group-hover:translate-x-1"
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
            </div>
        </div>
    );
};

export default Slider;
