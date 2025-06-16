"use client";

import { ModalProps } from "@/src/entities/type/interfaces";
import { motion } from "framer-motion";

const Modal = ({
    onClose,
    children,
    className,
    containerClassName,
}: ModalProps) => {
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
                    "relative max-h-[90vh] w-full max-w-2xl overflow-y-auto bg-white p-6 shadow-2xl"
                }
                onClick={(e) => e.stopPropagation()}
            >
                {children}
            </motion.div>
        </div>
    );
};

export default Modal;
