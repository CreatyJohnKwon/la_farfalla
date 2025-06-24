"use client";

import { UserProfileData } from "@/src/entities/type/interfaces";
import { useUserListQuery } from "@/src/shared/hooks/react-query/useUserQuery";

const Coupons = () => {
    const {
        data: users,
        isLoading: isUserDataLoading,
        refetch,
    } = useUserListQuery();

    if (isUserDataLoading) return <div>Loading...</div>;
    if (!users) return <div>쿠폰 목록이 없습니다.</div>;

    return (
        <div className="w-full max-w-full overflow-x-auto border font-pretendard sm:p-16 md:overflow-x-visible">
            <div className="ms-5 mt-20 flex h-8 w-full items-center justify-between sm:ms-0">
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

            <table className="ms-5 mt-5 h-full w-full min-w-[800px] table-auto text-left text-sm sm:ms-0">
                <thead>
                    <tr className="border-b text-gray-600">
                        <th className="w-[15%] px-2 py-2 text-xs sm:text-sm md:px-4">
                            회원명
                        </th>
                        <th className="w-[20%] px-2 py-2 text-xs sm:text-sm md:px-4">
                            이메일(아이디)
                        </th>
                        <th className="w-[20%] px-2 py-2 text-xs sm:text-sm md:px-4">
                            휴대전화
                        </th>
                        <th className="w-[25%] px-2 py-2 text-xs sm:text-sm md:px-4">
                            주소
                        </th>
                        <th className="w-[20%] px-2 py-2 text-xs sm:text-sm md:px-4">
                            보유 마일리지
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
                                {user.name}
                            </td>
                            <td className="px-2 py-2 text-xs sm:text-sm md:px-4">
                                {user.email}
                            </td>
                            <td className="px-2 py-2 text-xs sm:text-sm md:px-4">
                                {user.phoneNumber}
                            </td>
                            <td className="px-2 py-2 text-xs sm:text-sm md:px-4">
                                {`${user.address} ${user.detailAddress}, (${user.postcode})`}
                            </td>
                            <td className="px-2 py-2 text-end text-xs sm:text-sm md:px-4">
                                {user.mileage}
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default Coupons;
