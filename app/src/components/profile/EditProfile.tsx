"use client";

import AddressModal from "@/src/widgets/modal/Address/AddressModal";
import {
    useUserQuery,
    useUpdateUserMutation,
} from "@src/shared/hooks/react-query/useUserQuery";
import { useAddress } from "@src/shared/hooks/useAddress";
import useUsers from "@src/shared/hooks/useUsers";
import { useRouter } from "next/navigation";
import { useMemo, useState, useEffect } from "react";

const EditProfile = () => {
    const { data: user, isLoading } = useUserQuery();
    const { session } = useUsers();
    const updateUser = useUpdateUserMutation();
    // 클라이언트 측 비번 확인 검증용
    const [confirmPassword, setConfirmPassword] = useState<string>("");
    const { isOpen, onComplete, openModal, closeModal } = useAddress();

    const router = useRouter();

    // 폼 제출 형식
    const [form, setForm] = useState({
        email: "",
        name: "",
        address: "",
        detailAddress: "",
        postcode: "",
        password: "",
    });

    useEffect(() => {
        if (user && session) {
            setForm({
                email: session?.user?.email ?? "",
                name: user.name ?? "",
                address: user.address ?? "",
                detailAddress: user.detailAddress ?? "",
                postcode: user.postcode ?? "",
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

    if (isLoading)
        return (
            <p className="font-amstel-thin place-self-center text-center text-lg">
                Loading...
            </p>
        );

    if (session && session.user)
        return (
            <div className="flex w-[90vw] flex-col items-start justify-start gap-6 overflow-y-auto pb-5 font-pretendard text-lg font-[200] sm:w-full">
                <span className="font-amstel-thin w-full border border-gray-200 bg-white px-4 py-2 text-gray-500 placeholder:text-gray-400 focus:outline-none">
                    {session.user.email}
                </span>

                {user.provider === "local" && (
                    <>
                        {/* 비밀번호 */}
                        <div className="relative w-full">
                            <input
                                type="password"
                                name="password"
                                value={form.password}
                                onChange={handleChange}
                                placeholder="비밀번호 (8자 이상, 대소문자 및 숫자)"
                                className="min-h-12 w-full border border-gray-200 bg-white px-4 text-gray-700 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-200"
                            />
                            {form.password.length > 0 && (
                                <p
                                    className={`absolute right-3 top-1/2 -translate-y-1/2 ${
                                        isPasswordSafe
                                            ? "text-green-500"
                                            : "text-red-500"
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
                                onChange={(e) =>
                                    setConfirmPassword(e.target.value)
                                }
                                placeholder="비밀번호 확인"
                                className="min-h-12 w-full border border-gray-200 bg-white px-4 text-gray-700 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-200"
                            />
                            {confirmPassword.length > 0 && (
                                <p
                                    className={`absolute right-3 top-1/2 -translate-y-1/2 ${
                                        isPasswordMatch
                                            ? "text-green-500"
                                            : "text-red-500"
                                    }`}
                                >
                                    {isPasswordMatch ? "일치함" : "불일치"}
                                </p>
                            )}
                        </div>
                    </>
                )}

                <div className="relative w-full">
                    <input
                        type="text"
                        name="address"
                        value={form.address}
                        onChange={handleChange}
                        placeholder={"주소"}
                        readOnly
                        className="min-h-12 w-full border border-gray-200 bg-white px-4 text-gray-700 placeholder:text-gray-400 focus:outline-none"
                    />
                    <input
                        name="postcode"
                        value={form.postcode}
                        onChange={handleChange}
                        readOnly
                        className="hidden"
                    />
                    <button
                        type="button"
                        onClick={() =>
                            openModal((value) =>
                                setForm((prev) => ({
                                    ...prev, // 기존 name, detailAddress, password는 손대지 않고
                                    address: value.address, // 새 주소 추가
                                    postcode: value.zonecode, // 새 우편번호 추가
                                })),
                            )
                        }
                        className="absolute right-1 top-1/2 -translate-y-1/2 bg-black px-3 py-3 text-xs font-[300] text-white sm:bg-black/70 sm:px-5 sm:py-2 sm:text-base sm:hover:bg-black"
                    >
                        주소 찾기
                    </button>
                </div>

                <input
                    type="text"
                    name="detailAddress"
                    value={form.detailAddress}
                    onChange={handleChange}
                    placeholder={"상세주소"}
                    className="min-h-12 w-full border border-gray-200 bg-white px-4 text-gray-700 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-200"
                />

                <button
                    onClick={handleSubmit}
                    className="font-amstel w-full bg-black px-5 py-2 text-base text-white sm:w-auto sm:place-self-end sm:text-lg"
                >
                    Save
                </button>

                {isOpen && (
                    <AddressModal
                        onComplete={onComplete}
                        onClose={closeModal}
                    />
                )}
            </div>
        );
};

export default EditProfile;
