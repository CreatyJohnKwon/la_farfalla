"use client";

import { AddressModalProps } from "@src/entities/type/interfaces";
import { useEffect, useRef } from "react";

declare global {
    interface Window {
        daum: any;
    }
}

const AddressModal = ({ onComplete, onClose }: AddressModalProps) => {
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const renderPostcode = () => {
            if (!containerRef.current) return;

            containerRef.current.innerHTML = ""; // 기존 embed 제거

            new window.daum.Postcode({
                oncomplete: (data: any) => {
                    const addressData = data.address; // 전체 주소
                    const zonecode = data.zonecode; // 우편번호
                    onComplete(data);
                    onClose();
                },
                width: "100%",
                height: "100%",
            }).embed(containerRef.current);
        };

        // 이미 스크립트가 로드되어 있다면 바로 렌더
        if (window.daum?.Postcode) {
            renderPostcode();
            return;
        }

        // 스크립트 중복 방지
        const existed = document.querySelector(
            "script[src='//t1.daumcdn.net/mapjsapi/bundle/postcode/prod/postcode.v2.js']",
        );
        if (existed) {
            existed.addEventListener("load", renderPostcode);
            return;
        }

        // 스크립트 로드
        const script = document.createElement("script");
        script.src =
            "//t1.daumcdn.net/mapjsapi/bundle/postcode/prod/postcode.v2.js";
        script.async = true;
        script.onload = renderPostcode;
        document.body.appendChild(script);

        return () => {
            containerRef.current?.replaceChildren();
        };
    }, []);

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
            onClick={onClose}
        >
            <div className="relative h-[75vh] w-[92%] max-w-md overflow-hidden bg-white shadow-md">
                <div
                    ref={containerRef}
                    className="h-full w-full overflow-auto"
                    style={{ maxWidth: "100%", maxHeight: "100%" }}
                />
                <button
                    onClick={onClose}
                    className="absolute bottom-4 left-1/2 w-[90%] -translate-x-1/2 bg-gray-800 py-2 text-xl text-white"
                >
                    닫기
                </button>
            </div>
        </div>
    );
};

export default AddressModal;
