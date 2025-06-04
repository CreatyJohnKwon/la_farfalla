"use client";

import Image from "next/image";
import { useState, useRef } from "react";
import DefaultImage from "../../../../public/images/chill.png";
import { motion, useMotionValue, useAnimation } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react"; // lucide 아이콘 추천

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
                            className="w-full flex-shrink-0"
                            style={{ width: `${100}%` }}
                        >
                            <Image
                                src={
                                    img
                                        ? `https://pub-29feff62c6da44ea8503e0dc13db4217.r2.dev/${img}`
                                        : DefaultImage
                                }
                                alt={`img-${i}`}
                                width={500}
                                height={500}
                                className="h-full w-full object-contain"
                                priority={i === 0}
                            />
                        </div>
                    ))}
                </motion.div>

                {/* 인디케이터 */}
                <div className="absolute bottom-5 left-1/2 flex -translate-x-1/2 gap-2">
                    {images.map((_, idx) => (
                        <button
                            key={idx}
                            onClick={() => slideTo(idx)}
                            className={`h-3 w-3 rounded-full ${
                                current === idx
                                    ? "scale-125 bg-white"
                                    : "bg-gray-400"
                            } transition`}
                        />
                    ))}
                </div>

                {/* 버튼 */}
                <button
                    onClick={() =>
                        slideTo(current > 0 ? current - 1 : images.length - 1)
                    }
                    className="group absolute left-4 top-1/2 z-10 -translate-y-1/2 rounded-full bg-white/20 p-3 transition-all hover:bg-white/50"
                >
                    <ChevronLeft className="h-5 w-5 text-zinc-600 transition group-hover:scale-110" />
                </button>
                <button
                    onClick={() => slideTo((current + 1) % images.length)}
                    className="group absolute right-4 top-1/2 z-10 -translate-y-1/2 rounded-full bg-white/20 p-3 transition-all hover:bg-white/50"
                >
                    <ChevronRight className="h-5 w-5 text-zinc-600 transition group-hover:scale-110" />
                </button>
            </div>
        </div>
    );
};

export default Slider;
