"use client";

import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import axios from "axios";

const FindPasswordModal = ({ onClose }: { onClose: () => void }) => {
    const [email, setEmail] = useState("");

    // useMutation 훅을 사용하여 비밀번호 찾기 API를 호출합니다.
    const { mutate, isPending, isSuccess, isError, error } = useMutation({
        mutationFn: (userEmail: string) =>
            axios.get(`/api/user/me/find?email=${userEmail}`),
        onSuccess: () => {
            setEmail("");
        },
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (email.trim() !== "") mutate(email);
    };

    // 오류 메시지 파싱 함수
    const getErrorMessage = (err: unknown): string => {
        if (err instanceof axios.AxiosError) {
            // 백엔드에서 보낸 에러 메시지를 우선적으로 사용
            if (err.response?.data?.error) {
                return err.response.data.error;
            }
            // HTTP 상태 코드에 따른 일반적인 메시지
            if (err.response?.status === 404) {
                return "입력하신 이메일로 등록된 로컬 계정을 찾을 수 없습니다.";
            }
            if (err.response?.status === 500) {
                return "서버 오류가 발생했습니다. 잠시 후 다시 시도해주세요.";
            }
        }
        return "알 수 없는 오류가 발생했습니다. 다시 시도해주세요.";
    };


    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50" onClick={onClose}>
            <div className="relative w-[90vw] rounded-sm bg-white p-6 shadow-xl md:w-[40vw]" onClick={(e) => e.stopPropagation()}>
                <button
                    onClick={onClose}
                    className="absolute right-4 top-5 text-xl sm:text-2xl font-amstel font-[500] text-gray-500 hover:text-gray-900"
                >
                    &times;
                </button>
                <h2 className="mb-4 text-start text-lg sm:text-xl font-bold">비밀번호 찾기</h2>
                <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                    <p className="text-xs sm:text-sm text-gray-600">
                        가입된 이메일을 입력하시면 임시 비밀번호가 전송됩니다.
                    </p>
                    <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="이메일 주소"
                        className="py-3 w-full border border-gray-200 px-4 text-black text-sm sm:text-base placeholder:text-gray-400 focus:outline-none"
                        required
                    />
                    <button
                        type="submit"
                        disabled={isPending || email.length === 0}
                        className={`w-full py-3 font-pretendard text-white transition-colors text-sm sm:text-base
                            ${isPending || email.length === 0 ? "cursor-not-allowed bg-gray-400" : "bg-black hover:bg-black/50"}
                        `}
                    >
                        {isPending ? "전송 중..." : "임시 비밀번호 받기"}
                    </button>
                </form>

                {isSuccess && (
                    <div className="mt-4 bg-green-100 p-3 text-xs sm:text-sm text-green-700">
                        <p>{`이메일로 임시 비밀번호가 전송되었습니다.`}</p>
                    </div>
                )}
                {isError && (
                    <div className="mt-4 bg-red-100 p-3 text-sm text-red-700">
                        <p>{getErrorMessage(error)}</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default FindPasswordModal;