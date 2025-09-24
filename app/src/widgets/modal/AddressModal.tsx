"use client";

import { AddressModalProps } from "@src/entities/type/interfaces";
import { useEffect, useRef, useState } from "react";

declare global {
    interface Window {
        daum: any;
    }
}

const SkeletonLoader = () => {
    return (
        <div className="absolute inset-0 z-10 animate-pulse bg-white p-5">
            <div className="mb-6 h-10 rounded bg-gray-200"></div>
            <div className="space-y-3">
                <div className="h-8 rounded bg-gray-200"></div>
                <div className="h-8 rounded bg-gray-200"></div>
                <div className="h-8 rounded bg-gray-200"></div>
                <div className="h-8 w-3/4 rounded bg-gray-200"></div>
            </div>
            <div className="mt-8 space-y-3">
                <div className="h-8 rounded bg-gray-200"></div>
                <div className="h-8 rounded bg-gray-200"></div>
            </div>
        </div>
    );
};

const AddressModal = ({ onComplete, onClose }: AddressModalProps) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const renderPostcode = () => {
            if (!containerRef.current) return;
            containerRef.current.innerHTML = "";
            new window.daum.Postcode({
                oncomplete: (data: any) => {
                    onComplete(data);
                    onClose();
                },
                width: "100%",
                height: "100%",
                theme: {
                    searchBgColor: "#FFFFFF",
                    contentBgColor: "#FFFFFF",
                    postcodeTextColor: "#333333",
                    emphTextColor: "#000000",
                },
            }).embed(containerRef.current, {
                autoClose: false,
            });
            setIsLoading(false);
        };

        if (window.daum?.Postcode) {
            renderPostcode();
            return;
        }

        const existedScript = document.querySelector(
            "script[src='//t1.daumcdn.net/mapjsapi/bundle/postcode/prod/postcode.v2.js']",
        );

        // ◀️ 변경: if 블록 안에서 직접 클린업 함수를 return 하도록 수정
        if (existedScript) {
            existedScript.addEventListener("load", renderPostcode);
            return () => {
                existedScript.removeEventListener("load", renderPostcode);
            };
        }

        const newScript = document.createElement("script");
        newScript.src =
            "//t1.daumcdn.net/mapjsapi/bundle/postcode/prod/postcode.v2.js";
        newScript.async = true;
        newScript.onload = renderPostcode;
        document.body.appendChild(newScript);
        
        // ◀️ 추가: 새로 생성한 스크립트를 제거하는 클린업 로직
        return () => {
            document.body.removeChild(newScript);
        };
    }, []);

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
            onClick={onClose}
        >
            <div
                className="relative h-[75vh] w-[92%] max-w-md overflow-hidden bg-white shadow-md"
                onClick={(e) => e.stopPropagation()}
            >
                {isLoading && <SkeletonLoader />}
                <div
                    ref={containerRef}
                    className="h-full w-full overflow-auto"
                    style={{ visibility: isLoading ? "hidden" : "visible" }}
                />
                <button
                    onClick={onClose}
                    className="absolute bottom-4 left-1/2 w-[90%] -translate-x-1/2 bg-black py-2 text-base text-white hover:bg-black/70"
                >
                    닫기
                </button>
            </div>
        </div>
    );
};

export default AddressModal;