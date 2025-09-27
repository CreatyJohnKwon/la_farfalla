import { UserProfileData } from "@src/entities/type/interfaces";
import {
    useDeleteUserMutation,
    useUpdateUserMutation,
} from "@src/shared/hooks/react-query/useUserQuery";
import { useAddress } from "@src/shared/hooks/useAddress";
import { motion } from "framer-motion";
import { useState } from "react";

const UpdateUser = ({
    onClose,
    user,
    refetch,
}: {
    onClose: () => void;
    user: UserProfileData;
    refetch: () => void;
}) => {
    const [form, setForm] = useState({
        email: user.email || "",
        name: user.name || "",
        address: user.address || "",
        detailAddress: user.detailAddress || "",
        postcode: user.postcode || "",
        mileage: user.mileage || "0",
        phoneNumber: user.phoneNumber || "000-0000-0000",
    });

    const { formatPhoneNumber } = useAddress();
    const updateUser = useUpdateUserMutation();
    const deleteUser = useDeleteUserMutation();

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setForm((prev) => ({ ...prev, [name]: value }));
    };

    const handleSubmit = () => {
        updateUser.mutate(form, {
            onSuccess: () => {
                refetch();
                alert("유저 정보가 수정되었습니다.");
                onClose();
            },
            onError: () => alert("유저 정보 수정 실패"),
        });
    };

    const handleDeleteUser = () => {
        deleteUser.mutate(user._id, {
            onSuccess: () => {
                refetch();
                alert(
                    "유저 정보가 삭제되었습니다.\n유저 정보는 30일 이내에 복구할 수 있습니다.",
                );
                onClose();
            },
            onError: () => alert("유저 정보 삭제 실패"),
        });
    };

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
            onClick={() =>
                confirm("유저 정보 수정을\n취소하시겠습니까?") && onClose()
            }
        >
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.2 }}
                className="relative max-h-[90vh] w-full max-w-xl overflow-y-auto rounded-lg bg-white p-6"
                onClick={(e) => e.stopPropagation()}
            >
                <h2 className="mb-4 text-xl font-pretendard font-[600]">유저 정보 수정</h2>
                <div className="space-y-4">
                    <div>
                        <label className="text-sm text-gray-500">
                            유저 ID (이메일)
                        </label>
                        <p className="text-base font-pretendard font-[400] text-gray-800">
                            {user.email}
                        </p>
                        <p className="mt-1 font-mono text-xs text-gray-500">
                            {user._id}
                        </p>
                    </div>
                    <div>
                        <label className="block text-sm font-pretendard font-[400] text-gray-700">
                            이름
                        </label>
                        <input
                            name="name"
                            type="text"
                            placeholder="김하나"
                            value={form.name}
                            onChange={handleChange}
                            className="mt-1 w-full rounded-lg border border-gray-300 p-2 text-sm focus:border-black/50 focus:outline-none focus:ring-2 focus:ring-gray-50"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-pretendard font-[400] text-gray-700">
                            전화번호
                        </label>
                        <input
                            type="text"
                            name="phoneNumber"
                            placeholder="010-1234-5678 / 02-1234-5678"
                            value={form.phoneNumber}
                            onChange={(e) => {
                                const raw = e.target.value
                                    .replace(/\D/g, "")
                                    .slice(0, 11);
                                const formatted = formatPhoneNumber(raw);
                                setForm((prev) => ({
                                    ...prev,
                                    phoneNumber: formatted,
                                }));
                            }}
                            maxLength={
                                form.phoneNumber.startsWith("02") ? 12 : 13
                            }
                            className="mt-1 w-full rounded-lg border border-gray-300 p-2 text-sm focus:border-black/50 focus:outline-none focus:ring-2 focus:ring-gray-50"
                        />
                    </div>
                    
                    <div>
                        <label className="block text-sm font-pretendard font-[400] text-gray-700">
                            마일리지
                        </label>
                        <input
                            type="number"
                            name="mileage"
                            placeholder="1212"
                            value={form.mileage}
                            onChange={handleChange}
                            className="mt-1 w-full rounded-lg border border-gray-300 p-2 text-sm focus:border-black/50 focus:outline-none focus:ring-2 focus:ring-gray-50"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-pretendard font-[400] text-gray-700">
                            주소
                        </label>
                        <input
                            type="text"
                            name="address"
                            placeholder="서울시 강남구 테헤란로 1234"
                            value={form.address}
                            onChange={handleChange}
                            className="mt-1 w-full rounded-lg border border-gray-300 p-2 text-sm focus:border-black/50 focus:outline-none focus:ring-2 focus:ring-gray-50"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-pretendard font-[400] text-gray-700">
                            상세 주소
                        </label>
                        <input
                            type="text"
                            name="detailAddress"
                            placeholder="OO 아파트 1000호"
                            value={form.detailAddress}
                            onChange={handleChange}
                            className="mt-1 w-full rounded-lg border border-gray-300 p-2 text-sm focus:border-black/50 focus:outline-none focus:ring-2 focus:ring-gray-50"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-pretendard font-[400] text-gray-700">
                            우편번호
                        </label>
                        <input
                            placeholder="00000"
                            type="text"
                            name="postcode"
                            value={form.postcode}
                            onChange={handleChange}
                            className="mt-1 w-full rounded-lg border border-gray-300 p-2 text-sm focus:border-black/50 focus:outline-none focus:ring-2 focus:ring-gray-50"
                        />
                    </div>
                </div>

                <div className="mt-6 flex justify-end gap-3">
                    <button
                        onClick={() => {
                            if (confirm("삭제하시겠습니까?")) {
                                if (
                                    confirm(
                                        "복구할 수 없게 됩니다.\n정말로 삭제하시겠습니까?",
                                    )
                                ) {
                                    // 삭제 로직
                                    handleDeleteUser();
                                }
                            }
                        }}
                        className="rounded-lg bg-red-100 px-4 py-2 text-sm text-red-600 hover:bg-red-200"
                    >
                        삭제
                    </button>
                    <button
                        onClick={() =>
                            confirm("유저 정보 수정을\n취소하시겠습니까?") &&
                            onClose()
                        }
                        className="rounded-lg border border-gray-300 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                        취소
                    </button>
                    <button
                        onClick={() => {
                            if (confirm("저장하시겠습니까?")) {
                                // 저장 로직
                                handleSubmit();
                            }
                        }}
                        className="rounded-lg bg-black px-4 py-2 text-sm text-white hover:bg-black/70"
                    >
                        저장
                    </button>
                </div>
            </motion.div>
        </div>
    );
};

export default UpdateUser;
