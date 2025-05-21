import { useState } from "react";

export const useAddress = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [onComplete, setOnComplete] = useState<(address: string) => void>(
        () => () => {},
    );

    const openModal = (callback: (address: string) => void) => {
        setOnComplete(() => callback);
        setIsOpen(true);
    };

    const closeModal = () => {
        setIsOpen(false);
    };

    return { isOpen, openModal, closeModal, onComplete };
};
