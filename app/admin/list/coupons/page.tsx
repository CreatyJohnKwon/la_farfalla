"use client";

import { Fragment, useState, useMemo } from "react";
import { ICoupon } from "@/src/entities/type/interfaces";
import {
    useGetUserCouponsListQuery,
    useDeleteManageCouponMutation,
    useGetManageCouponsListQuery,
    useUpdateManageCouponMutation,
    useDeleteUserCouponMutation,
} from "@/src/shared/hooks/react-query/useBenefitQuery";
import CouponCreateModal from "@/src/widgets/modal/CouponCreateModal";
import LoadingSpinner from "@/src/widgets/spinner/LoadingSpinner";

const CouponAdmin = () => {
    const [selectedCoupon, setSelectedCoupon] = useState<ICoupon | null>(null);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [filterStatus, setFilterStatus] = useState<"all" | "used" | "unused">(
        "all",
    );
    const [activeTab, setActiveTab] = useState<"issued" | "templates">(
        "issued",
    );

    // 발급된 쿠폰 필터 상태
    const [userSearchTerm, setUserSearchTerm] = useState("");
    const [issuedSortOrder, setIssuedSortOrder] = useState<
        "latest" | "oldest" | "none"
    >("none");

    // 템플릿 쿠폰 필터 상태
    const [templateStatusFilter, setTemplateStatusFilter] = useState<
        "all" | "active" | "expired" | "inactive"
    >("all");
    const [templateSortOrder, setTemplateSortOrder] = useState<
        "latest" | "oldest" | "none"
    >("none");

    // 우측 - 쿠폰 템플릿 관리 (Coupon 스키마)
    const {
        data: manageCoupons,
        isLoading: manageCouponLoading,
        refetch: manageCouponRefetch,
    } = useGetManageCouponsListQuery();

    // 좌측 - 유저 발급 쿠폰 관리 (UserCoupon 스키마)
    const {
        data: userCoupons,
        isLoading: userCouponLoading,
        refetch: userCouponRefetch,
    } = useGetUserCouponsListQuery("all");

    // 쿠폰 삭제 mutation
    const deleteManageCouponMutation = useDeleteManageCouponMutation();
    const updateManageCouponMutation = useUpdateManageCouponMutation();
    const deleteUserCouponMutation = useDeleteUserCouponMutation();

    // 쿠폰 템플릿 활성화/비활성화 토글
    const toggleCouponActive = async (
        couponId: string,
        currentIsActive: boolean,
    ) => {
        try {
            updateManageCouponMutation.mutate(
                { couponId, currentIsActive },
                {
                    onSuccess: manageCouponRefetch,
                },
            );
        } catch (error) {
            console.error("쿠폰 템플릿 상태 변경 실패:", error);
        }
    };

    // 쿠폰 삭제
    const deleteCoupon = (name: string, id: string | undefined) => {
        if (
            confirm(
                `${name} 쿠폰을 정말로 삭제하시겠습니까?\n배포된 모든 쿠폰까지 삭제됩니다.`,
            )
        ) {
            deleteManageCouponMutation.mutate(id, {
                onSuccess: () => {
                    alert("쿠폰이 삭제되었습니다.");
                    manageCouponRefetch();
                    userCouponRefetch();
                },
            });
        }
    };

    // 유저 쿠폰 회수
    const revokeUserCoupon = async (userCouponId: string) => {
        if (!confirm("이 사용자의 쿠폰을 회수하시겠습니까?")) return;

        try {
            // 쿠폰 회수 로직
            deleteUserCouponMutation.mutate(userCouponId, {
                onSuccess: () => {
                    alert("쿠폰이 회수되었습니다.");
                    manageCouponRefetch();
                    userCouponRefetch();
                },
            });
        } catch (error) {
            console.error("쿠폰 회수 실패:", error);
        }
    };

    // 헬퍼 함수들
    const getTypeLabel = (type: string) => {
        const typeMap = {
            common: "공용",
            personal: "개인",
            event: "이벤트",
        };
        return typeMap[type as keyof typeof typeMap] || type;
    };

    const getDiscountDisplay = (coupon: ICoupon) => {
        if (coupon.discountType === "percentage") {
            return `${coupon.discountValue}%`;
        } else {
            return `${coupon.discountValue.toLocaleString()}원`;
        }
    };

    const formatDateTime = (date: Date) =>
        new Date(date).toLocaleString("ko-KR");
    const formatDate = (date: Date) =>
        new Date(date).toLocaleDateString("ko-KR");

    const getCouponStatus = (coupon: ICoupon) => {
        if (!coupon || !coupon.startAt || !coupon.endAt) {
            return { label: "데이터 오류", color: "bg-red-100 text-red-800" };
        }

        const now = new Date();
        const start = new Date(coupon.startAt);
        const end = new Date(coupon.endAt);

        if (!coupon.isActive)
            return { label: "비활성", color: "bg-gray-100 text-gray-800" };
        if (now < start)
            return { label: "예정", color: "bg-blue-100 text-blue-800" };
        if (now > end)
            return { label: "만료", color: "bg-red-100 text-red-800" };
        return { label: "활성", color: "bg-green-100 text-green-800" };
    };

    const getAssignmentTypeLabel = (type: string) => {
        const typeMap = {
            manual: "수동 발급",
            auto: "자동 발급",
            event: "이벤트",
            signup: "가입 혜택",
        };
        return typeMap[type as keyof typeof typeMap] || type;
    };

    const getCouponId = (couponId: any): string | undefined =>
        typeof couponId === "string" ? couponId : couponId?._id;

    // 필터링된 사용자 쿠폰 목록
    const filteredUserCoupons = useMemo(() => {
        if (!userCoupons?.data) return [];

        let result = [...userCoupons.data];

        // 사용 상태 필터
        if (filterStatus === "used") {
            result = result.filter((uc) => uc.isUsed);
        } else if (filterStatus === "unused") {
            result = result.filter((uc) => !uc.isUsed);
        }

        // 사용자 검색
        if (userSearchTerm.trim()) {
            const searchLower = userSearchTerm.toLowerCase();
            result = result.filter((uc) => {
                const email = uc.userId?.email?.toLowerCase() || "";
                const userId =
                    (typeof uc.userId === "string"
                        ? uc.userId
                        : uc.userId?._id
                    )?.toLowerCase() || "";
                return (
                    email.includes(searchLower) || userId.includes(searchLower)
                );
            });
        }

        // 발급 날짜 정렬
        if (issuedSortOrder === "latest") {
            result.sort(
                (a, b) =>
                    new Date(b.assignedAt).getTime() -
                    new Date(a.assignedAt).getTime(),
            );
        } else if (issuedSortOrder === "oldest") {
            result.sort(
                (a, b) =>
                    new Date(a.assignedAt).getTime() -
                    new Date(b.assignedAt).getTime(),
            );
        }

        return result;
    }, [userCoupons?.data, filterStatus, userSearchTerm, issuedSortOrder]);

    // 필터링된 템플릿 쿠폰 목록
    const filteredManageCoupons = useMemo(() => {
        if (!manageCoupons?.data) return [];

        let result = [...manageCoupons.data];

        // 상태 필터
        if (templateStatusFilter !== "all") {
            result = result.filter((coupon) => {
                if (!coupon || !coupon.startAt || !coupon.endAt) return false;

                const now = new Date();
                const start = new Date(coupon.startAt);
                const end = new Date(coupon.endAt);

                switch (templateStatusFilter) {
                    case "active":
                        return coupon.isActive && now >= start && now <= end;
                    case "expired":
                        return now > end;
                    case "inactive":
                        return !coupon.isActive;
                    default:
                        return true;
                }
            });
        }

        // 생성 날짜 정렬
        if (templateSortOrder === "latest") {
            result.sort(
                (a, b) =>
                    new Date(b.createdAt || 0).getTime() -
                    new Date(a.createdAt || 0).getTime(),
            );
        } else if (templateSortOrder === "oldest") {
            result.sort(
                (a, b) =>
                    new Date(a.createdAt || 0).getTime() -
                    new Date(b.createdAt || 0).getTime(),
            );
        }

        return result;
    }, [manageCoupons?.data, templateStatusFilter, templateSortOrder]);

    // 선택된 쿠폰에 해당하는 사용자 쿠폰 필터링
    const selectedCouponUserCoupons = selectedCoupon
        ? userCoupons?.data.filter(
              (uc) => uc.couponId?._id === selectedCoupon._id,
          ) || []
        : [];

    // 필터 초기화 함수들
    const resetIssuedFilters = () => {
        setFilterStatus("all");
        setUserSearchTerm("");
        setIssuedSortOrder("none");
    };

    const resetTemplateFilters = () => {
        setTemplateStatusFilter("all");
        setTemplateSortOrder("none");
    };

    // 로딩 상태
    const isLoading = userCouponLoading || manageCouponLoading;

    return (
        <div className="w-full max-w-full p-4 font-pretendard sm:p-6 lg:p-16">
            {/* 헤더 */}
            <div className="mb-6 mt-4 sm:mt-8 lg:mt-[5vh]">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex items-center gap-3">
                        <h1 className="text-xl font-semibold text-gray-800 sm:text-2xl">
                            쿠폰 관리
                        </h1>
                        <button
                            onClick={() => {
                                userCouponRefetch();
                                manageCouponRefetch();
                            }}
                            className="flex h-9 w-9 items-center justify-center rounded border border-gray-300 bg-gray-100 text-gray-600 transition-colors hover:bg-gray-200 hover:text-gray-800 sm:h-10 sm:w-10"
                            title="새로고침"
                            disabled={isLoading}
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
                    <button
                        onClick={() => setShowCreateModal(true)}
                        className="flex h-10 items-center justify-center whitespace-nowrap rounded border bg-gray-100 px-4 text-sm font-medium text-gray-800 transition-colors hover:bg-gray-200 sm:h-12 sm:px-6 sm:text-base"
                    >
                        새 쿠폰 템플릿 생성
                    </button>
                </div>
            </div>

            {/* 모바일 탭 네비게이션 */}
            <div className="mb-6 lg:hidden">
                <div className="flex border-b border-gray-200">
                    <button
                        onClick={() => setActiveTab("issued")}
                        className={`flex-1 border-b-2 px-4 py-3 text-center text-sm font-medium transition-colors ${
                            activeTab === "issued"
                                ? "border-blue-500 bg-blue-50 text-blue-600"
                                : "border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700"
                        }`}
                    >
                        발급된 쿠폰
                        <span className="ml-2 rounded-full bg-gray-100 px-2 py-1 text-xs text-gray-600">
                            {userCoupons?.data.length || 0}
                        </span>
                    </button>
                    <button
                        onClick={() => setActiveTab("templates")}
                        className={`flex-1 border-b-2 px-4 py-3 text-center text-sm font-medium transition-colors ${
                            activeTab === "templates"
                                ? "border-blue-500 bg-blue-50 text-blue-600"
                                : "border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700"
                        }`}
                    >
                        쿠폰 템플릿
                        <span className="ml-2 rounded-full bg-gray-100 px-2 py-1 text-xs text-gray-600">
                            {manageCoupons?.data.length || 0}
                        </span>
                    </button>
                </div>
            </div>

            {/* 메인 컨텐츠 - 반응형 레이아웃 */}
            <div className="flex flex-col gap-6 lg:flex-row">
                {/* 발급된 사용자 쿠폰 목록 */}
                <div
                    className={`w-full lg:w-1/2 ${activeTab !== "issued" ? "hidden lg:block" : ""}`}
                >
                    <div className="rounded-lg border bg-white shadow-sm">
                        <div className="flex flex-col border-b px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
                            <div className="mb-3 sm:mb-0">
                                <h2 className="text-lg font-medium text-gray-800 sm:text-xl">
                                    발급된 쿠폰 관리
                                </h2>
                                <p className="mt-1 text-sm text-gray-600">
                                    총 {userCoupons?.data.length || 0}개 발급
                                </p>
                            </div>
                            <div className="flex items-center gap-2">
                                <select
                                    value={filterStatus}
                                    onChange={(e) =>
                                        setFilterStatus(e.target.value as any)
                                    }
                                    className="min-h-[44px] rounded border border-gray-300 px-3 py-2 text-sm sm:text-base"
                                >
                                    <option value="all">전체</option>
                                    <option value="used">사용됨</option>
                                    <option value="unused">미사용</option>
                                </select>
                            </div>
                        </div>

                        <div className="overflow-hidden">
                            {isLoading ? (
                                <LoadingSpinner
                                    size="sm"
                                    fullScreen={false}
                                    message="Loading..."
                                />
                            ) : filteredUserCoupons.length === 0 ? (
                                <div className="px-4 py-12 text-center text-gray-500">
                                    {userSearchTerm ||
                                    filterStatus !== "all" ||
                                    issuedSortOrder !== "none"
                                        ? "필터 조건에 맞는 쿠폰이 없습니다."
                                        : "발급된 쿠폰이 없습니다."}
                                </div>
                            ) : (
                                <>
                                    {/* 데스크톱 테이블 */}
                                    <div className="scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100 hidden max-h-[70vh] overflow-y-auto lg:block">
                                        <table className="w-full text-left text-sm">
                                            <thead>
                                                <tr className="whitespace-nowrap border-b bg-gray-50 text-gray-600">
                                                    <th className="px-4 py-3 text-sm">
                                                        사용자 / 쿠폰 ID
                                                    </th>
                                                    <th className="px-4 py-3 text-sm">
                                                        <div className="flex items-center gap-1">
                                                            발급정보
                                                            {issuedSortOrder !==
                                                                "none" && (
                                                                <svg
                                                                    className={`h-4 w-4 ${issuedSortOrder === "latest" ? "rotate-0" : "rotate-180"}`}
                                                                    fill="none"
                                                                    stroke="currentColor"
                                                                    viewBox="0 0 24 24"
                                                                >
                                                                    <path
                                                                        strokeLinecap="round"
                                                                        strokeLinejoin="round"
                                                                        strokeWidth={
                                                                            2
                                                                        }
                                                                        d="M5 15l7-7 7 7"
                                                                    />
                                                                </svg>
                                                            )}
                                                        </div>
                                                    </th>
                                                    <th className="px-4 py-3 text-sm">
                                                        상태
                                                    </th>
                                                    <th className="px-4 py-3 text-sm">
                                                        할인금액
                                                    </th>
                                                    <th className="px-4 py-3 text-sm">
                                                        작업
                                                    </th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {filteredUserCoupons.map(
                                                    (userCoupon, index) => (
                                                        <tr
                                                            key={userCoupon._id}
                                                            className="border-b hover:bg-gray-50"
                                                        >
                                                            <td className="px-4 py-3">
                                                                <div>
                                                                    <div className="font-pretendard font-[500] text-gray-900">
                                                                        {`쿠폰명 | ${
                                                                            manageCoupons?.data.find(
                                                                                (
                                                                                    coupon,
                                                                                ) =>
                                                                                    coupon._id ===
                                                                                    getCouponId(
                                                                                        userCoupon.couponId,
                                                                                    ),
                                                                            )
                                                                                ?.name ||
                                                                            "쿠폰명 없음"
                                                                        }`}
                                                                    </div>
                                                                    <div className="font-pretendard font-[500] text-gray-900">
                                                                        {`사용자 | ${userCoupon.userId?.email ? userCoupon.userId.email : userCoupon.userId?._id ? userCoupon.userId._id : "탈퇴한 회원"}`}
                                                                    </div>
                                                                    <div className="font-pretendard text-xs text-gray-400">
                                                                        {`쿠폰 ID | ${
                                                                            typeof userCoupon.couponId ===
                                                                            "string"
                                                                                ? userCoupon.couponId
                                                                                : userCoupon
                                                                                      .couponId
                                                                                      ?._id
                                                                        }`}
                                                                    </div>
                                                                    <div className="font-pretendard text-xs text-gray-400">
                                                                        {`발급 ID | ${userCoupon._id}`}
                                                                    </div>
                                                                </div>
                                                            </td>
                                                            <td className="px-4 py-3">
                                                                <div className="text-xs text-gray-600">
                                                                    <span
                                                                        className={`-ms-1 inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${
                                                                            userCoupon.assignmentType ===
                                                                            "manual"
                                                                                ? "bg-purple-100 text-purple-800"
                                                                                : userCoupon.assignmentType ===
                                                                                    "auto"
                                                                                  ? "bg-blue-100 text-blue-800"
                                                                                  : userCoupon.assignmentType ===
                                                                                      "event"
                                                                                    ? "bg-orange-100 text-orange-800"
                                                                                    : "bg-green-100 text-green-800"
                                                                        }`}
                                                                    >
                                                                        {getAssignmentTypeLabel(
                                                                            userCoupon.assignmentType,
                                                                        )}
                                                                    </span>

                                                                    <div className="mt-2">
                                                                        {`발급: ${formatDateTime(
                                                                            userCoupon.assignedAt,
                                                                        )}`}
                                                                    </div>
                                                                </div>
                                                            </td>
                                                            <td className="px-4 py-3">
                                                                <span
                                                                    className={`-ms-1 inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${
                                                                        userCoupon.isUsed
                                                                            ? "bg-green-100 text-green-800"
                                                                            : "bg-yellow-100 text-yellow-800"
                                                                    }`}
                                                                >
                                                                    {userCoupon.isUsed
                                                                        ? "사용됨"
                                                                        : "미사용"}
                                                                </span>
                                                                {userCoupon.usedAt && (
                                                                    <div className="mt-2 text-xs text-gray-500">
                                                                        {`사용일: ${formatDate(
                                                                            userCoupon.assignedAt,
                                                                        )}`}
                                                                    </div>
                                                                )}
                                                                {userCoupon.usedOrderId && (
                                                                    <div className="mt-1 text-xs text-gray-400">
                                                                        {`주문 ID: ${userCoupon.usedOrderId}`}
                                                                    </div>
                                                                )}
                                                            </td>
                                                            <td className="px-4 py-3 text-gray-900">
                                                                {userCoupon.discountAmount
                                                                    ? `${userCoupon.discountAmount.toLocaleString()}원`
                                                                    : "-"}
                                                            </td>
                                                            <td className="px-4 py-3">
                                                                {!userCoupon.isUsed && (
                                                                    <button
                                                                        onClick={() =>
                                                                            revokeUserCoupon(
                                                                                userCoupon._id,
                                                                            )
                                                                        }
                                                                        className="font-pretendard-bold text-sm text-red-600 hover:text-red-800"
                                                                        title="회수"
                                                                    >
                                                                        회수
                                                                    </button>
                                                                )}
                                                            </td>
                                                        </tr>
                                                    ),
                                                )}
                                            </tbody>
                                        </table>
                                    </div>

                                    {/* 모바일 카드 */}
                                    <div className="scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100 max-h-[60vh] overflow-y-auto lg:hidden">
                                        {filteredUserCoupons.map(
                                            (userCoupon) => (
                                                <div
                                                    key={userCoupon._id}
                                                    className="border-b p-4 hover:bg-gray-50"
                                                >
                                                    <div className="space-y-3">
                                                        <div>
                                                            <div className="text-sm font-medium text-gray-900 sm:text-base">
                                                                {manageCoupons?.data.find(
                                                                    (coupon) =>
                                                                        coupon._id ===
                                                                        getCouponId(
                                                                            userCoupon.couponId,
                                                                        ),
                                                                )?.name ||
                                                                    "쿠폰명 없음"}
                                                            </div>
                                                            <div className="mt-1 text-sm text-gray-600">
                                                                {userCoupon
                                                                    .userId
                                                                    ?.email
                                                                    ? userCoupon
                                                                          .userId
                                                                          .email
                                                                    : userCoupon
                                                                            .userId
                                                                            ?._id
                                                                      ? userCoupon
                                                                            .userId
                                                                            ._id
                                                                      : "탈퇴한 회원"}
                                                            </div>
                                                        </div>

                                                        <div className="flex flex-wrap gap-2">
                                                            <span
                                                                className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${
                                                                    userCoupon.assignmentType ===
                                                                    "manual"
                                                                        ? "bg-purple-100 text-purple-800"
                                                                        : userCoupon.assignmentType ===
                                                                            "auto"
                                                                          ? "bg-blue-100 text-blue-800"
                                                                          : userCoupon.assignmentType ===
                                                                              "event"
                                                                            ? "bg-orange-100 text-orange-800"
                                                                            : "bg-green-100 text-green-800"
                                                                }`}
                                                            >
                                                                {getAssignmentTypeLabel(
                                                                    userCoupon.assignmentType,
                                                                )}
                                                            </span>
                                                            <span
                                                                className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${
                                                                    userCoupon.isUsed
                                                                        ? "bg-green-100 text-green-800"
                                                                        : "bg-yellow-100 text-yellow-800"
                                                                }`}
                                                            >
                                                                {userCoupon.isUsed
                                                                    ? "사용됨"
                                                                    : "미사용"}
                                                            </span>
                                                        </div>

                                                        <div className="flex items-center justify-between">
                                                            <div className="text-sm text-gray-600">
                                                                할인금액:{" "}
                                                                {userCoupon.discountAmount
                                                                    ? `${userCoupon.discountAmount.toLocaleString()}원`
                                                                    : "-"}
                                                            </div>
                                                            {!userCoupon.isUsed && (
                                                                <button
                                                                    onClick={() =>
                                                                        revokeUserCoupon(
                                                                            userCoupon._id,
                                                                        )
                                                                    }
                                                                    className="min-h-[44px] rounded border border-red-200 px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-50 hover:text-red-800"
                                                                >
                                                                    회수
                                                                </button>
                                                            )}
                                                        </div>

                                                        <div className="space-y-1 text-xs text-gray-400">
                                                            <div>
                                                                발급:{" "}
                                                                {formatDateTime(
                                                                    userCoupon.assignedAt,
                                                                )}
                                                            </div>
                                                            {userCoupon.usedAt && (
                                                                <div>
                                                                    사용일:{" "}
                                                                    {formatDate(
                                                                        userCoupon.assignedAt,
                                                                    )}
                                                                </div>
                                                            )}
                                                            {userCoupon.usedOrderId && (
                                                                <div>
                                                                    주문 ID:{" "}
                                                                    {
                                                                        userCoupon.usedOrderId
                                                                    }
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                            ),
                                        )}
                                    </div>
                                </>
                            )}
                        </div>
                    </div>
                </div>

                {/* 쿠폰 템플릿 관리 */}
                <div
                    className={`w-full lg:w-1/2 ${activeTab !== "templates" ? "hidden lg:block" : ""}`}
                >
                    <div className="rounded-lg border bg-white shadow-sm">
                        <div className="border-b px-4 py-4 sm:px-6">
                            <h2 className="text-lg font-medium text-gray-800 sm:text-xl">
                                쿠폰 템플릿 관리
                            </h2>
                            <p className="mt-1 text-sm text-gray-600">
                                총 {manageCoupons?.data.length || 0}개의 템플릿
                            </p>
                        </div>

                        <div className="overflow-hidden">
                            {isLoading ? (
                                <LoadingSpinner
                                    size="sm"
                                    fullScreen={false}
                                    message="Loading..."
                                />
                            ) : !filteredManageCoupons ||
                              filteredManageCoupons.length === 0 ? (
                                <div className="px-4 py-12 text-center text-gray-500">
                                    {templateStatusFilter !== "all" ||
                                    templateSortOrder !== "none"
                                        ? "필터 조건에 맞는 템플릿이 없습니다."
                                        : "등록된 쿠폰 템플릿이 없습니다."}
                                </div>
                            ) : (
                                <>
                                    {/* 데스크톱 테이블 */}
                                    <div className="scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100 hidden max-h-[70vh] overflow-y-auto lg:block">
                                        <table className="w-full text-left text-sm">
                                            <thead>
                                                <tr className="border-b bg-gray-50 text-gray-600">
                                                    <th className="px-4 py-3 text-sm">
                                                        <div className="flex items-center gap-1">
                                                            쿠폰명
                                                            {templateSortOrder !==
                                                                "none" && (
                                                                <svg
                                                                    className={`h-4 w-4 ${templateSortOrder === "latest" ? "rotate-0" : "rotate-180"}`}
                                                                    fill="none"
                                                                    stroke="currentColor"
                                                                    viewBox="0 0 24 24"
                                                                >
                                                                    <path
                                                                        strokeLinecap="round"
                                                                        strokeLinejoin="round"
                                                                        strokeWidth={
                                                                            2
                                                                        }
                                                                        d="M5 15l7-7 7 7"
                                                                    />
                                                                </svg>
                                                            )}
                                                        </div>
                                                    </th>
                                                    <th className="px-4 py-3 text-sm">
                                                        타입
                                                    </th>
                                                    <th className="px-4 py-3 text-sm">
                                                        할인
                                                    </th>
                                                    <th className="w-[20%] px-4 py-3 text-sm">
                                                        상태
                                                    </th>
                                                    <th className="w-[10%] px-4 py-3 text-center text-sm">
                                                        작업
                                                    </th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {manageCoupons?.data.map(
                                                    (coupon) => {
                                                        if (
                                                            !coupon ||
                                                            !coupon._id
                                                        ) {
                                                            return null;
                                                        }

                                                        const status =
                                                            getCouponStatus(
                                                                coupon,
                                                            );
                                                        return (
                                                            <Fragment
                                                                key={coupon._id}
                                                            >
                                                                <tr
                                                                    className={`cursor-pointer border-b transition-colors hover:bg-gray-50 ${
                                                                        selectedCoupon?._id ===
                                                                        coupon._id
                                                                            ? "bg-blue-50"
                                                                            : ""
                                                                    }`}
                                                                    onClick={() => {
                                                                        if (
                                                                            selectedCoupon ===
                                                                            null
                                                                        ) {
                                                                            setSelectedCoupon(
                                                                                coupon,
                                                                            );
                                                                        } else {
                                                                            setSelectedCoupon(
                                                                                null,
                                                                            );
                                                                        }
                                                                    }}
                                                                >
                                                                    <td className="px-4 py-3">
                                                                        <div>
                                                                            <div className="font-medium text-gray-900">
                                                                                {
                                                                                    coupon.name
                                                                                }
                                                                            </div>
                                                                            <div className="text-xs text-gray-500">
                                                                                {
                                                                                    coupon.code
                                                                                }
                                                                            </div>
                                                                            {coupon.description && (
                                                                                <div className="mt-1 text-xs text-gray-400">
                                                                                    {
                                                                                        coupon.description
                                                                                    }
                                                                                </div>
                                                                            )}
                                                                        </div>
                                                                    </td>
                                                                    <td className="px-4 py-3">
                                                                        <span
                                                                            className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${
                                                                                coupon.type ===
                                                                                "common"
                                                                                    ? "bg-blue-100 text-blue-800"
                                                                                    : coupon.type ===
                                                                                        "personal"
                                                                                      ? "bg-green-100 text-green-800"
                                                                                      : "bg-orange-100 text-orange-800"
                                                                            }`}
                                                                        >
                                                                            {getTypeLabel(
                                                                                coupon.type ||
                                                                                    "",
                                                                            )}
                                                                        </span>
                                                                    </td>
                                                                    <td className="px-4 py-3 text-gray-900">
                                                                        <div>
                                                                            {getDiscountDisplay(
                                                                                coupon,
                                                                            )}
                                                                        </div>
                                                                        <div className="text-xs text-gray-500">
                                                                            {
                                                                                coupon.currentUsage
                                                                            }{" "}
                                                                            /{" "}
                                                                            {coupon.maxUsage ||
                                                                                "무제한"}
                                                                        </div>
                                                                    </td>
                                                                    <td className="px-4 py-3">
                                                                        <div className="flex flex-col gap-1">
                                                                            <span
                                                                                className={`inline-flex w-24 items-center rounded-full px-2 py-1 text-center text-xs font-medium ${status.color}`}
                                                                            >
                                                                                {
                                                                                    status.label
                                                                                }
                                                                            </span>
                                                                            <button
                                                                                onClick={(
                                                                                    e,
                                                                                ) => {
                                                                                    e.stopPropagation();
                                                                                    toggleCouponActive(
                                                                                        coupon._id ||
                                                                                            "",
                                                                                        coupon.isActive,
                                                                                    );
                                                                                }}
                                                                                className={`relative inline-flex h-4 w-7 items-center rounded-full transition-colors focus:outline-none ${
                                                                                    coupon.isActive
                                                                                        ? "bg-blue-600"
                                                                                        : "bg-gray-300"
                                                                                }`}
                                                                            >
                                                                                <span
                                                                                    className={`inline-block h-2 w-2 transform rounded-full bg-white transition-transform ${
                                                                                        coupon.isActive
                                                                                            ? "translate-x-4"
                                                                                            : "translate-x-1"
                                                                                    }`}
                                                                                />
                                                                            </button>
                                                                        </div>
                                                                    </td>
                                                                    <td className="px-4 py-3 text-center">
                                                                        <button
                                                                            onClick={(
                                                                                e,
                                                                            ) => {
                                                                                e.stopPropagation();
                                                                                deleteCoupon(
                                                                                    coupon.name,
                                                                                    coupon._id,
                                                                                );
                                                                            }}
                                                                            className="text-sm text-red-600 hover:text-red-800"
                                                                            title="삭제"
                                                                        >
                                                                            <svg
                                                                                className="h-5 w-5"
                                                                                fill="none"
                                                                                stroke="currentColor"
                                                                                viewBox="0 0 24 24"
                                                                            >
                                                                                <path
                                                                                    strokeLinecap="round"
                                                                                    strokeLinejoin="round"
                                                                                    strokeWidth={
                                                                                        2
                                                                                    }
                                                                                    d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                                                                                />
                                                                            </svg>
                                                                        </button>
                                                                    </td>
                                                                </tr>
                                                                {/* 선택된 쿠폰 템플릿 상세 정보 */}
                                                                {selectedCoupon?._id ===
                                                                    coupon._id && (
                                                                    <tr>
                                                                        <td
                                                                            colSpan={
                                                                                5
                                                                            }
                                                                            className="border-t bg-gray-50 px-4 py-3"
                                                                        >
                                                                            <h3 className="mb-2 text-sm font-medium text-gray-800">
                                                                                선택된
                                                                                템플릿
                                                                                상세
                                                                                정보
                                                                            </h3>
                                                                            <div className="grid grid-cols-2 gap-4 text-xs">
                                                                                <div>
                                                                                    <span className="text-gray-600">
                                                                                        기간:
                                                                                    </span>
                                                                                    <span className="ml-2">
                                                                                        {formatDate(
                                                                                            selectedCoupon.startAt,
                                                                                        )}{" "}
                                                                                        ~{" "}
                                                                                        {formatDate(
                                                                                            selectedCoupon.endAt,
                                                                                        )}
                                                                                    </span>
                                                                                </div>

                                                                                {selectedCoupon.maxUsagePerUser && (
                                                                                    <div>
                                                                                        <span className="text-gray-600">
                                                                                            유저당
                                                                                            사용제한:
                                                                                        </span>
                                                                                        <span className="ml-2">
                                                                                            {
                                                                                                selectedCoupon.maxUsagePerUser
                                                                                            }{" "}
                                                                                            회
                                                                                        </span>
                                                                                    </div>
                                                                                )}

                                                                                <div>
                                                                                    <span className="text-gray-600">
                                                                                        이
                                                                                        템플릿
                                                                                        발급수:
                                                                                    </span>
                                                                                    <span className="ml-2 font-medium text-blue-600">
                                                                                        {
                                                                                            selectedCouponUserCoupons.length
                                                                                        }

                                                                                        개
                                                                                    </span>
                                                                                </div>
                                                                            </div>
                                                                        </td>
                                                                    </tr>
                                                                )}
                                                            </Fragment>
                                                        );
                                                    },
                                                )}
                                            </tbody>
                                        </table>
                                    </div>

                                    {/* 모바일 카드 */}
                                    <div className="scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100 max-h-[60vh] overflow-y-auto lg:hidden">
                                        {manageCoupons?.data.map((coupon) => {
                                            if (!coupon || !coupon._id) {
                                                return null;
                                            }

                                            const status =
                                                getCouponStatus(coupon);
                                            return (
                                                <div
                                                    key={coupon._id}
                                                    className="border-b"
                                                >
                                                    <div
                                                        className={`cursor-pointer p-4 transition-colors hover:bg-gray-50 ${
                                                            selectedCoupon?._id ===
                                                            coupon._id
                                                                ? "bg-blue-50"
                                                                : ""
                                                        }`}
                                                        onClick={() => {
                                                            if (
                                                                selectedCoupon ===
                                                                null
                                                            ) {
                                                                setSelectedCoupon(
                                                                    coupon,
                                                                );
                                                            } else {
                                                                setSelectedCoupon(
                                                                    null,
                                                                );
                                                            }
                                                        }}
                                                    >
                                                        <div className="space-y-3">
                                                            <div className="flex items-start justify-between">
                                                                <div className="flex-1">
                                                                    <div className="text-sm font-medium text-gray-900 sm:text-base">
                                                                        {
                                                                            coupon.name
                                                                        }
                                                                    </div>
                                                                    <div className="mt-1 text-xs text-gray-500 sm:text-sm">
                                                                        {
                                                                            coupon.code
                                                                        }
                                                                    </div>
                                                                    {coupon.description && (
                                                                        <div className="mt-1 text-xs text-gray-400">
                                                                            {
                                                                                coupon.description
                                                                            }
                                                                        </div>
                                                                    )}
                                                                </div>
                                                                <button
                                                                    onClick={(
                                                                        e,
                                                                    ) => {
                                                                        e.stopPropagation();
                                                                        deleteCoupon(
                                                                            coupon.name,
                                                                            coupon._id,
                                                                        );
                                                                    }}
                                                                    className="flex min-h-[44px] min-w-[44px] items-center justify-center rounded border border-red-200 text-red-600 hover:bg-red-50 hover:text-red-800"
                                                                    title="삭제"
                                                                >
                                                                    <svg
                                                                        className="h-5 w-5"
                                                                        fill="none"
                                                                        stroke="currentColor"
                                                                        viewBox="0 0 24 24"
                                                                    >
                                                                        <path
                                                                            strokeLinecap="round"
                                                                            strokeLinejoin="round"
                                                                            strokeWidth={
                                                                                2
                                                                            }
                                                                            d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                                                                        />
                                                                    </svg>
                                                                </button>
                                                            </div>

                                                            <div className="flex flex-wrap gap-2">
                                                                <span
                                                                    className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${
                                                                        coupon.type ===
                                                                        "common"
                                                                            ? "bg-blue-100 text-blue-800"
                                                                            : coupon.type ===
                                                                                "personal"
                                                                              ? "bg-green-100 text-green-800"
                                                                              : "bg-orange-100 text-orange-800"
                                                                    }`}
                                                                >
                                                                    {getTypeLabel(
                                                                        coupon.type ||
                                                                            "",
                                                                    )}
                                                                </span>
                                                                <span
                                                                    className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${status.color}`}
                                                                >
                                                                    {
                                                                        status.label
                                                                    }
                                                                </span>
                                                            </div>

                                                            <div className="flex items-center justify-between">
                                                                <div className="text-sm text-gray-900">
                                                                    할인:{" "}
                                                                    {getDiscountDisplay(
                                                                        coupon,
                                                                    )}
                                                                    <div className="mt-1 text-xs text-gray-500">
                                                                        사용:{" "}
                                                                        {
                                                                            coupon.currentUsage
                                                                        }{" "}
                                                                        /{" "}
                                                                        {coupon.maxUsage ||
                                                                            "무제한"}
                                                                    </div>
                                                                </div>
                                                                <div className="flex items-center gap-2">
                                                                    <span className="text-sm text-gray-600">
                                                                        활성화
                                                                    </span>
                                                                    <button
                                                                        onClick={(
                                                                            e,
                                                                        ) => {
                                                                            e.stopPropagation();
                                                                            toggleCouponActive(
                                                                                coupon._id ||
                                                                                    "",
                                                                                coupon.isActive,
                                                                            );
                                                                        }}
                                                                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${
                                                                            coupon.isActive
                                                                                ? "bg-blue-600"
                                                                                : "bg-gray-300"
                                                                        }`}
                                                                    >
                                                                        <span
                                                                            className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                                                                                coupon.isActive
                                                                                    ? "translate-x-6"
                                                                                    : "translate-x-1"
                                                                            }`}
                                                                        />
                                                                    </button>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>

                                                    {/* 모바일 상세 정보 */}
                                                    {selectedCoupon?._id ===
                                                        coupon._id && (
                                                        <div className="border-t bg-gray-50 px-4 py-3">
                                                            <h3 className="mb-3 text-sm font-medium text-gray-800">
                                                                상세 정보
                                                            </h3>
                                                            <div className="space-y-2 text-sm">
                                                                <div className="flex justify-between">
                                                                    <span className="text-gray-600">
                                                                        기간:
                                                                    </span>
                                                                    <span className="text-right">
                                                                        {formatDate(
                                                                            selectedCoupon.startAt,
                                                                        )}
                                                                        <br />~{" "}
                                                                        {formatDate(
                                                                            selectedCoupon.endAt,
                                                                        )}
                                                                    </span>
                                                                </div>

                                                                {selectedCoupon.maxUsagePerUser && (
                                                                    <div className="flex justify-between">
                                                                        <span className="text-gray-600">
                                                                            유저당
                                                                            사용제한:
                                                                        </span>
                                                                        <span>
                                                                            {
                                                                                selectedCoupon.maxUsagePerUser
                                                                            }
                                                                            회
                                                                        </span>
                                                                    </div>
                                                                )}

                                                                <div className="flex justify-between">
                                                                    <span className="text-gray-600">
                                                                        이
                                                                        템플릿
                                                                        발급수:
                                                                    </span>
                                                                    <span className="font-medium text-blue-600">
                                                                        {
                                                                            selectedCouponUserCoupons.length
                                                                        }
                                                                        개
                                                                    </span>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>
                                            );
                                        })}
                                    </div>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* 쿠폰 생성 모달 */}
            {showCreateModal && (
                <CouponCreateModal
                    isOpen={showCreateModal}
                    onClose={() => setShowCreateModal(false)}
                    onRefetch={manageCouponRefetch}
                />
            )}
        </div>
    );
};

export default CouponAdmin;
