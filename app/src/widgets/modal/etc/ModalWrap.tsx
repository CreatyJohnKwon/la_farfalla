"use client";

import { ModalProps } from "@/src/entities/type/common";
import usePage from "@/src/shared/hooks/usePage";
import { motion } from "framer-motion";
import { useEffect } from "react";

const ModalWrap = ({
    onClose,
    children,
    className,
    containerClassName,
}: ModalProps) => {
    const { router, pathName } = usePage();

    useEffect(() => {
        const handlePopState = (event: PopStateEvent) => {
            onClose();
        };

        window.addEventListener('popstate', handlePopState);

        return () => {
            window.removeEventListener('popstate', handlePopState);
        };
    }, [router]);

    useEffect(() => {
        // 키보드를 눌렀을 때 실행될 함수
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === "Escape") {
                onClose(); // Escape 키가 눌리면 onClose 함수를 호출합니다.
            }
        };

        // 컴포넌트가 마운트될 때 window에 keydown 이벤트 리스너를 추가합니다.
        window.addEventListener("keydown", handleKeyDown);

        // 컴포넌트가 언마운트될 때 이벤트 리스너를 정리(제거)합니다.
        return () => {
            window.removeEventListener("keydown", handleKeyDown);
        };
    }, [onClose]);

    return (
        <div
            className={`fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 ${containerClassName || ""}`}
            onClick={onClose}
        >
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.2 }}
                className={
                    className ||
                    "relative max-h-[90vh] sm:max-w-[60vw] overflow-y-auto bg-white p-6 shadow-2xl"
                }
                onClick={(e) => e.stopPropagation()}
            >
                {children}
            </motion.div>
        </div>
    );
};

export default ModalWrap;
