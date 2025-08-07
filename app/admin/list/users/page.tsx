"use client";

import { UserProfileData } from "@/src/entities/type/interfaces";
import {
    useRestoreUserMutation,
    useUserListQuery,
} from "@/src/shared/hooks/react-query/useUserQuery";
import UpdateUser from "@/src/widgets/modal/UpdateUser";
import { useState, useMemo } from "react";

type SortOption = "latest" | "oldest" | "name_asc" | "name_desc" | "none";

const Users = () => {
    const {
        data: users,
        isLoading: isUserDataLoading,
        refetch,
    } = useUserListQuery();
    const restoreUser = useRestoreUserMutation();

    const [openModal, setOpenModal] = useState(false);
    const [userData, setUserData] = useState<UserProfileData>();
    const [sortOption, setSortOption] = useState<SortOption>("none");

    const handleRestoreUser = (userId: string) => {
        restoreUser.mutate(userId, {
            onSuccess: () => {
                refetch();
                alert("유저 정보가 복구되었습니다.");
            },
            onError: () => alert("유저 정보 복구 실패"),
        });
    };

    // 정렬된 유저 목록
    const sortedUsers = useMemo(() => {
        if (!users || sortOption === "none") return users || [];

        const usersCopy = [...users];

        switch (sortOption) {
            case "latest":
                return usersCopy.sort(
                    (a, b) =>
                        new Date(b.createdAt || 0).getTime() -
                        new Date(a.createdAt || 0).getTime(),
                );
            case "oldest":
                return usersCopy.sort(
                    (a, b) =>
                        new Date(a.createdAt || 0).getTime() -
                        new Date(b.createdAt || 0).getTime(),
                );
            case "name_asc":
                return usersCopy.sort((a, b) =>
                    a.name.localeCompare(b.name, "ko-KR"),
                );
            case "name_desc":
                return usersCopy.sort((a, b) =>
                    b.name.localeCompare(a.name, "ko-KR"),
                );
            default:
                return usersCopy;
        }
    }, [users, sortOption]);

    if (isUserDataLoading) return <div>Loading...</div>;
    if (!users) return <div>유저 목록이 없습니다.</div>;

    return (
        <div className="w-full max-w-full p-4 font-pretendard sm:p-6 lg:p-16">
            {/* 헤더 */}
            <div className="mb-6 mt-4 sm:mt-8 lg:mt-[5vh]">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex items-center gap-3">
                        <h1 className="text-xl font-semibold text-gray-800 sm:text-2xl">
                            유저 관리
                        </h1>
                        <button
                            onClick={() => refetch()}
                            className="flex h-9 w-9 items-center justify-center rounded border border-gray-300 bg-gray-100 text-gray-600 transition-colors hover:bg-gray-200 hover:text-gray-800 sm:h-10 sm:w-10"
                            title="새로고침"
                        >
                            <svg
                                className="h-4 w-4 sm:h-5 sm:w-5"
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

                    {/* 필터 옵션 */}
                    <div className="flex flex-col items-start gap-3 sm:flex-row sm:items-center">
                        <span className="whitespace-nowrap text-sm text-gray-600">
                            정렬 기준:
                        </span>
                        <select
                            value={sortOption}
                            onChange={(e) =>
                                setSortOption(e.target.value as SortOption)
                            }
                            className="min-h-[44px] rounded-md border border-gray-300 bg-white px-4 py-2 text-sm hover:border-gray-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                            <option value="none">기본 순서</option>
                            <option value="latest">최근 가입순</option>
                            <option value="oldest">오래된 가입순</option>
                            <option value="name_asc">이름 ㄱ-ㅎ 순</option>
                            <option value="name_desc">이름 ㅎ-ㄱ 순</option>
                        </select>
                    </div>
                </div>

                {/* 총 유저 수 표시 */}
                <div className="mt-4 text-sm text-gray-600">
                    총{" "}
                    <span className="font-medium text-blue-600">
                        {sortedUsers.length}
                    </span>
                    명의 유저
                    {sortOption !== "none" && (
                        <span className="ml-2 text-gray-500">
                            (
                            {sortOption === "latest"
                                ? "최근 가입순"
                                : sortOption === "oldest"
                                  ? "오래된 가입순"
                                  : sortOption === "name_asc"
                                    ? "이름 ㄱ-ㅎ 순"
                                    : "이름 ㅎ-ㄱ 순"}{" "}
                            정렬됨)
                        </span>
                    )}
                </div>
            </div>

            {/* 테이블 컨테이너 */}
            <div className="overflow-hidden rounded-lg bg-white">
                <div className="overflow-x-auto">
                    <table className="w-full min-w-[800px] text-sm">
                        <thead>
                            <tr className="border-b bg-gray-50 text-gray-600">
                                <th className="w-[20%] px-4 py-3 text-left text-xs font-medium sm:text-sm">
                                    아이디(이메일)
                                </th>
                                <th className="w-[15%] px-4 py-3 text-left text-xs font-medium sm:text-sm">
                                    <div className="flex items-center gap-1">
                                        회원명
                                        {(sortOption === "name_asc" ||
                                            sortOption === "name_desc") && (
                                            <svg
                                                className={`h-4 w-4 ${sortOption === "name_asc" ? "rotate-0" : "rotate-180"}`}
                                                fill="none"
                                                stroke="currentColor"
                                                viewBox="0 0 24 24"
                                            >
                                                <path
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                    strokeWidth={2}
                                                    d="M5 15l7-7 7 7"
                                                />
                                            </svg>
                                        )}
                                    </div>
                                </th>
                                <th className="w-[14%] px-4 py-3 text-left text-xs font-medium sm:text-sm">
                                    휴대전화
                                </th>
                                <th className="w-[31%] px-4 py-3 text-left text-xs font-medium sm:text-sm">
                                    주소
                                </th>
                                <th className="w-[10%] px-4 py-3 text-left text-xs font-medium sm:text-sm">
                                    마일리지
                                </th>
                                <th className="w-[10%] px-4 py-3 text-center text-xs font-medium sm:text-sm">
                                    수정
                                </th>
                            </tr>
                        </thead>

                        <tbody>
                            {sortedUsers.map(
                                (user: UserProfileData, index: number) => (
                                    <tr
                                        key={user._id}
                                        className="border-b transition-colors hover:bg-gray-50"
                                    >
                                        <td className="px-4 py-3">
                                            <div className="flex flex-col">
                                                <span
                                                    className={`text-xs sm:text-sm ${
                                                        user.deletedAt
                                                            ? "text-red-400 line-through"
                                                            : "text-gray-900"
                                                    }`}
                                                >
                                                    {user.email}
                                                </span>
                                                {user.createdAt && (
                                                    <span className="mt-1 text-xs text-gray-400">
                                                        가입:{" "}
                                                        {new Date(
                                                            user.createdAt,
                                                        ).toLocaleDateString(
                                                            "ko-KR",
                                                        )}
                                                    </span>
                                                )}
                                            </div>
                                        </td>
                                        <td className="px-4 py-3">
                                            <div className="flex items-center gap-2">
                                                {(sortOption === "latest" ||
                                                    sortOption ===
                                                        "oldest") && (
                                                    <span className="rounded-full bg-blue-100 px-2 py-1 text-xs text-blue-800">
                                                        #{index + 1}
                                                    </span>
                                                )}
                                                <span
                                                    className={`text-xs sm:text-sm ${
                                                        user.deletedAt
                                                            ? "text-gray-400 line-through"
                                                            : "font-medium text-gray-900"
                                                    }`}
                                                >
                                                    {user.name}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-4 py-3 text-xs text-gray-700 sm:text-sm">
                                            {user.phoneNumber || "-"}
                                        </td>
                                        <td className="px-4 py-3 text-xs text-gray-700 sm:text-sm">
                                            {user.address && user.detailAddress
                                                ? `${user.address} ${user.detailAddress}${user.postcode ? `, (${user.postcode})` : ""}`
                                                : "-"}
                                        </td>
                                        <td className="px-4 py-3 text-xs sm:text-sm">
                                            <span className="font-medium text-green-600">
                                                {user.mileage?.toLocaleString() ||
                                                    0}
                                                P
                                            </span>
                                        </td>
                                        <td className="px-4 py-3">
                                            <div className="flex items-center justify-center gap-1">
                                                {/* 수정 버튼 */}
                                                <button
                                                    onClick={() => {
                                                        setUserData(user);
                                                        setOpenModal(true);
                                                    }}
                                                    className="flex min-h-[44px] min-w-[44px] items-center justify-center rounded-md text-gray-400 transition-colors hover:bg-blue-50 hover:text-blue-600"
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

                                                {/* 복구 버튼 (삭제된 유저만) */}
                                                {user.deletedAt && (
                                                    <button
                                                        onClick={() => {
                                                            if (
                                                                confirm(
                                                                    "삭제된 유저 정보를\n복구하시겠습니까?",
                                                                )
                                                            ) {
                                                                handleRestoreUser(
                                                                    user._id,
                                                                );
                                                            }
                                                        }}
                                                        className="flex min-h-[44px] min-w-[44px] items-center justify-center rounded-md text-gray-400 transition-colors hover:bg-red-50 hover:text-red-600"
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
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ),
                            )}
                        </tbody>
                    </table>
                </div>

                {/* 빈 상태 */}
                {sortedUsers.length === 0 && (
                    <div className="py-12 text-center text-gray-500">
                        <svg
                            className="mx-auto h-12 w-12 text-gray-400"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                            />
                        </svg>
                        <h3 className="mt-2 text-sm font-medium text-gray-900">
                            유저가 없습니다
                        </h3>
                        <p className="mt-1 text-sm text-gray-500">
                            등록된 유저가 없습니다.
                        </p>
                    </div>
                )}
            </div>

            {/* 수정 모달 */}
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
