"use client"; // Next 13 이상이라면 붙여줘야 함

import { loadingAtom } from "@/src/shared/lib/atom";
import { useAtom } from "jotai";

export const ScreenLoader = () => {
    const [isLoading] = useAtom(loadingAtom);

    if (!isLoading) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
            <div className="h-16 w-16 animate-spin rounded-full border-4 border-white border-t-transparent" />
        </div>
    );
};
