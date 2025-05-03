"use client";

import {
    useUserQuery,
    useUpdateUserMutation,
} from "@/src/shared/hooks/react-query/useUserQuery";
import { useRouter } from "next/navigation";
import { useMemo, useState, useEffect } from "react";

const EditProfile = () => {
    const { data: user, isLoading } = useUserQuery();
    const updateUser = useUpdateUserMutation();
    // 클라이언트 측 비번 확인 검증용
    const [confirmPassword, setConfirmPassword] = useState<string>("");

    const router = useRouter();

    // 폼 제출 형식
    const [form, setForm] = useState({
        name: "",
        address: "",
        password: "",
    });

    useEffect(() => {
        if (user) {
            setForm({
                name: user.name || "",
                address: user.address || "",
                password: "",
            });
        }
    }, [user]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setForm((prev) => ({ ...prev, [name]: value }));
    };

    const handleSubmit = () => {
        updateUser.mutate(form, {
            onSuccess: () => {
                alert("프로필이 수정되었습니다.");
                router.refresh();
            },
            onError: () => alert("수정 실패"),
        });
    };

    const isPasswordMatch = useMemo(() => {
        return form.password === confirmPassword;
    }, [form.password, confirmPassword]);

    const isPasswordSafe = useMemo(() => {
        return (
            form.password.length >= 8 &&
            /[A-Z]/.test(form.password) &&
            /\d/.test(form.password)
        );
    }, [form.password]);

    if (isLoading) return <p>Loading...</p>;

    return (
        <div className="flex h-full flex-col items-center justify-center gap-6 font-pretendard text-xl sm:w-4/5 sm:text-3xl">
            {/* 이름 */}
            <input
                type="text"
                name="name"
                value={form.name}
                onChange={handleChange}
                placeholder="이름"
                className="w-full border p-2"
            />

            {/* 비밀번호 */}
            <div className="relative w-full">
                <input
                    type="password"
                    name="password"
                    value={form.password}
                    onChange={handleChange}
                    placeholder="비밀번호 (8자 이상, 변경 시 입력)"
                    className="h-16 w-full border border-gray-200 bg-white px-4 pr-36 text-gray-700 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-200"
                />
                {form.password.length > 0 && (
                    <p
                        className={`absolute right-3 top-1/2 -translate-y-1/2 text-sm sm:text-xl ${
                            isPasswordSafe ? "text-green-500" : "text-red-500"
                        }`}
                    >
                        {isPasswordSafe ? "안전함" : "위험함"}
                    </p>
                )}
            </div>

            {/* 비밀번호 확인 */}
            <div className="relative w-full">
                <input
                    type="password"
                    name="confirmPassword"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="비밀번호 확인"
                    className="h-16 w-full border border-gray-200 bg-white px-4 pr-36 text-gray-700 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-200"
                />
                {confirmPassword.length > 0 && (
                    <p
                        className={`absolute right-3 top-1/2 -translate-y-1/2 text-sm sm:text-xl ${
                            isPasswordMatch ? "text-green-500" : "text-red-500"
                        }`}
                    >
                        {isPasswordMatch ? "일치함" : "불일치"}
                    </p>
                )}
            </div>

            <input
                type="text"
                name="address"
                value={form.address}
                onChange={handleChange}
                placeholder="주소"
                className="w-full border p-2"
            />
            <button
                onClick={handleSubmit}
                className="place-self-end bg-black px-4 py-2 text-white"
            >
                저장
            </button>
        </div>
    );
};

export default EditProfile;
