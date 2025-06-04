import { AddressData } from "@/src/entities/type/interfaces";
import { useState } from "react";

export const useAddress = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [onComplete, setOnComplete] = useState<(address: string) => void>(
        () => () => {},
    );

    const openModal = (callback: (address: AddressData) => void) => {
        setOnComplete(() => callback);
        setIsOpen(true);
    };

    const closeModal = () => {
        setIsOpen(false);
    };

    const formatPhoneNumber = (value: string): string => {
        const numbers = value.replace(/\D/g, "").slice(0, 11);

        // 02로 시작할 때
        if (numbers.startsWith("02")) {
            if (numbers.length >= 10) {
                return numbers.replace(/(\d{2})(\d{4})(\d{4})/, "$1-$2-$3");
            } else {
                return numbers.replace(/(\d{2})(\d{3})(\d{4})/, "$1-$2-$3");
            }
        }

        // 그 외의 지역번호 (010, 031 등)
        if (numbers.length < 4) return numbers;
        if (numbers.length < 8) return numbers.replace(/(\d{3})(\d+)/, "$1-$2");
        return numbers.replace(/(\d{3})(\d{4})(\d+)/, "$1-$2-$3");
    };

    return { isOpen, openModal, closeModal, onComplete, formatPhoneNumber };
};
