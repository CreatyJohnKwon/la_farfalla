"use client";

import { UserProfileData } from "@/src/entities/type/interfaces";
import {
    useRestoreUserMutation,
    useUserListQuery,
} from "@/src/shared/hooks/react-query/useUserQuery";
import UpdateUser from "@/src/widgets/modal/UpdateUser";
import { useState } from "react";

const Users = () => {
    const {
        data: users,
        isLoading: isUserDataLoading,
        refetch,
    } = useUserListQuery();
    const restoreUser = useRestoreUserMutation();

    const [openModal, setOpenModal] = useState(false);
    const [userData, setUserData] = useState<UserProfileData>();

    const handleRestoreUser = (userId: string) => {
        restoreUser.mutate(userId, {
            onSuccess: () => {
                refetch();
                alert("유저 정보가 복구되었습니다.");
            },
            onError: () => alert("유저 정보 복구 실패"),
        });
    };

    if (isUserDataLoading) return <div>Loading...</div>;
    if (!users) return <div>유저 목록이 없습니다.</div>;

    return (
        <div className="w-full max-w-full overflow-x-auto font-pretendard sm:p-16  md:overflow-x-visible">
            <div className="ms-5 mt-[5vh] flex h-8 w-full items-center justify-between sm:ms-0 whitespace-nowrap">
                <div className="flex items-center gap-4 h-full">
                    <h1 className="text-xl font-semibold text-gray-800">
                        유저 관리
                    </h1>
                    {/* 새로고침 버튼 */}
                    <button
                        onClick={() => refetch()}
                        className="flex h-full w-8 items-center justify-center rounded border border-gray-300 bg-gray-100 text-gray-600 transition-colors hover:bg-gray-200 hover:text-gray-800"
                        title="새로고침"
                    >
                        <svg
                            className="h-4 w-4"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                            />
                        </svg>
                    </button>
                </div>
            </div>

            <table className="ms-5 mt-5 h-full w-full min-w-[800px] table-auto text-sm sm:ms-0">
                <thead>
                    <tr className="border-b text-gray-600">
                        <th className="w-[20%] px-2 py-2 text-start text-xs sm:text-sm md:px-4">
                            아이디(이메일)
                        </th>
                        <th className="w-[15%] px-2 py-2 text-start text-xs sm:text-sm md:px-4">
                            회원명
                        </th>
                        <th className="w-[14%] px-2 py-2 text-start text-xs sm:text-sm md:px-4">
                            휴대전화
                        </th>
                        <th className="w-[31%] px-2 py-2 text-start text-xs sm:text-sm md:px-4">
                            주소
                        </th>
                        <th className="w-[10%] px-2 py-2 text-start text-xs sm:text-sm md:px-4">
                            마일리지
                        </th>
                        <th className="w-[20%] px-2 py-2 text-center text-xs sm:text-sm md:px-4">
                            수정
                        </th>
                    </tr>
                </thead>

                <tbody>
                    {users.map((user: UserProfileData) => (
                        <tr
                            key={user._id}
                            className="border-b hover:bg-gray-50"
                        >
                            <td className="px-2 py-2 text-xs sm:text-sm md:px-4">
                                <span className={`text-xs sm:text-sm ${ user.deletedAt ? "text-red-300 line-through": "text-black"}`}>
                                    {user.email}
                                </span>
                            </td>
                            <td className="px-2 py-2 md:px-4">
                                <span className={`text-xs sm:text-sm ${ user.deletedAt ? "text-black/50 line-through": "text-black"}`}>
                                    {user.name}
                                </span>
                            </td>
                            <td className="px-2 py-2 text-xs sm:text-sm md:px-4">
                                {user.phoneNumber}
                            </td>
                            <td className="px-2 py-2 text-xs sm:text-sm md:px-4">
                                {`${user.address} ${user.detailAddress}, (${user.postcode})`}
                            </td>
                            <td className="px-2 py-2 text-xs sm:text-sm md:px-4">
                                {user.mileage}
                            </td>
                            <td className="px-2 py-2 text-center text-xs sm:text-sm md:px-4">
                                {/* 수정 버튼 */}
                                <button
                                    onClick={() => {
                                        setUserData(user);
                                        setOpenModal(true);
                                    }}
                                    className="rounded-md p-2 text-gray-400 hover:bg-blue-50 hover:text-blue-600"
                                    title="수정"
                                >
                                    <svg
                                        className="h-4 w-4"
                                        fill="none"
                                        stroke="currentColor"
                                        viewBox="0 0 24 24"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={2}
                                            d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                                        />
                                    </svg>
                                </button>
                                {/* 복구 버튼 */}
                                {user.deletedAt ? (
                                    <button
                                        onClick={() => {
                                            confirm(
                                                "삭제된 유저 정보를\n복구하시겠습니까?",
                                            ) && handleRestoreUser(user._id);
                                        }}
                                        className="rounded-md p-2 text-gray-400 hover:bg-blue-50 hover:text-red-600"
                                        title="복구"
                                    >
                                        <svg
                                            className="h-4 w-4"
                                            fill="none"
                                            stroke="currentColor"
                                            viewBox="0 0 24 24"
                                        >
                                            <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                strokeWidth={2}
                                                d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                                            />
                                        </svg>
                                    </button>
                                ) : (
                                    <></>
                                )}
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
            {openModal && userData && (
                <UpdateUser
                    onClose={() => setOpenModal(false)}
                    user={userData}
                    refetch={refetch}
                />
            )}
        </div>
    );
};

export default Users;
