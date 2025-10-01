"use client";

import usePage from "@src/shared/hooks/usePage";
import AddressModal from "@src/widgets/modal/address/AddressModal";
import {
    useUserQuery,
    useUpdateUserMutation,
} from "@src/shared/hooks/react-query/useUserQuery";
import { useAddress } from "@src/shared/hooks/useAddress";
import useUsers from "@src/shared/hooks/useUsers";
import { useMemo, useState, useEffect } from "react";

const EditProfile = () => {
    const { data: user, isLoading } = useUserQuery();
    const { session } = useUsers();
    const updateUser = useUpdateUserMutation();
    const [confirmPassword, setConfirmPassword] = useState<string>("");
    const { isOpen, onComplete, openModal, closeModal } = useAddress();

    // 폼 제출 형식
    const [form, setForm] = useState({
        email: "",
        name: "",
        address: "",
        detailAddress: "",
        postcode: "",
        password: "",
    });

    const [initialForm, setInitialForm] = useState(form);

    useEffect(() => {
        if (user && session) {
            const initialData = {
                email: session?.user?.email ?? "",
                name: user.name ?? "",
                address: user.address ?? "",
                detailAddress: user.detailAddress ?? "",
                postcode: user.postcode ?? "",
                password: "",
            };
            setForm(initialData);
            setInitialForm(initialData);
        }
    }, [user, session]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setForm((prev) => ({ ...prev, [name]: value }));
    };

    const handleSubmit = () => {
        // 1. 전송할 데이터 객체(payload) 생성, 식별자인 email은 항상 포함
        const payload: { [key: string]: any } = {
            email: form.email,
        };

        // 2. initialForm과 form을 비교하여 변경된 값만 payload에 추가
        // 'name', 'address', 'detailAddress', 'postcode' 필드를 확인
        (Object.keys(initialForm) as Array<keyof typeof initialForm>).forEach((key) => {
            // password는 별도로 처리하고, email은 이미 추가했으므로 건너뜀
            if (key === "password" || key === "email") return;

            if (initialForm[key] !== form[key]) {
                payload[key] = form[key];
            }
        });

        // 3. 비밀번호는 빈 값이 아니면 항상 payload에 추가
        if (form.password) {
            payload.password = form.password;
        }

        // 4. 만약 변경된 내용이 없다면(payload에 email만 있다면) 함수 종료
        if (Object.keys(payload).length <= 1) {
            alert("변경된 내용이 없습니다.");
            return;
        }

        // 5. 변경된 데이터만 담긴 payload를 서버로 전송
        updateUser.mutate(payload, {
            onSuccess: (res) => {
                // ✨ 중요: 성공 시 initialForm을 현재 form 상태로 업데이트
                setInitialForm(form);
                setForm((prev) => ({ ...prev, password: "" }));
                setConfirmPassword("");
                alert(res.message);
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

    const isFormChanged = useMemo(() => {
        // 초기 데이터가 없으면 변경된 것으로 간주하지 않음
        if (!initialForm.email) return false;

        // 비밀번호를 제외한 다른 필드 중 하나라도 값이 다른지 확인
        const otherFieldsChanged =
            initialForm.name !== form.name ||
            initialForm.address !== form.address ||
            initialForm.detailAddress !== form.detailAddress ||
            initialForm.postcode !== form.postcode;

        // 비밀번호 필드에 입력이 있는지 확인
        const passwordChanged = form.password !== "";

        return otherFieldsChanged || passwordChanged;
    }, [form, initialForm]);

    const canSave = useMemo(() => {
        // 변경된 내용이 없으면 비활성화
        if (!isFormChanged) return false;

        // 만약 비밀번호가 변경되었다면, 안전성과 일치 여부까지 확인해야 함
        if (form.password) {
            return isPasswordSafe && isPasswordMatch;
        }

        // 비밀번호 변경 없이 다른 정보만 변경된 경우
        return true;
    }, [isFormChanged, form.password, isPasswordSafe, isPasswordMatch]);

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
                                placeholder="변경할 비밀번호 (8자 이상, 대소문자 및 숫자)"
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
                                placeholder="변경할 비밀번호 확인"
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
                    <div className="border border-gray-200 bg-white text-gray-700">
                        <input
                            type="text"
                            name="address"
                            value={form.address}
                            onChange={handleChange}
                            placeholder={"주소"}
                            readOnly
                            className="min-h-12 w-full placeholder:text-gray-400 overflow-hidden whitespace-nowrap truncate pe-[20vw] px-4 focus:outline-none focus:ring-2 focus:ring-gray-200" 
                        />
                        <input
                            name="postcode"
                            value={form.postcode}
                            onChange={handleChange}
                            readOnly
                            className="hidden"
                        />
                    </div>
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
                        className="absolute right-1 top-1/2 -translate-y-1/2 px-3 py-3 text-xs underline font-[300] text-black transition-all ease-in-out sm:text-gray-500 sm:px-4 sm:py-2 sm:text-sm sm:hover:text-black"
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
                    className="z-10 min-h-12 w-full border border-gray-200 bg-white px-4 text-gray-700 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-200"
                />

                <button
                    onClick={handleSubmit}
                    disabled={!canSave}
                    className={`z-10 font-pretendard ease-in-out duration-300 w-full px-5 py-2 text-base text-white transition-colors sm:w-auto sm:place-self-end sm:text-lg font-[300] ${
                        canSave
                            ? "bg-black hover:bg-black/70"
                            : "cursor-not-allowed bg-gray-400"
                    }`}
                >
                    저장
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
