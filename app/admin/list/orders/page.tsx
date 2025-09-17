"use client";

import { useState, useCallback, useMemo } from "react";
import StatusUpdateSelectedModal from "@src/widgets/modal/StatusUpdateSelectedModal";
import StatusUpdateModal from "@src/widgets/modal/StatusUpdateModal";
import UserInfoModal from "@src/widgets/modal/UserInfoModal";
import useOrderList from "@src/shared/hooks/useOrderList";
import ProductInfoModal from "@src/widgets/modal/ProductInfoModal";
import { OrderData } from "@src/components/order/interface";

type SortOption = "none" | "name_asc" | "name_desc";
type StatusFilter = "all" | string; // "all" 또는 실제 상태값

const Orders = () => {
    const {
        statusColor,
        statusResult,

        isUserModalOpen,
        setIsUserModalOpen,
        isStatusModalOpen,
        setIsStatusModalOpen,
        isSelectedModalOpen,
        setIsSelectedModalOpen,
        isProductModalOpen,
        setIsProductModalOpen,
        orderData,
        setOrderData,
        selectedOrder,

        orderListLoading,
        orders,

        onClose,

        toggleAll,
        toggleSingle,
        isAllSelected,

        refetch,
    } = useOrderList();

    // 필터 상태
    const [sortOption, setSortOption] = useState<SortOption>("none");
    const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");

    // Shift 키 범위 선택을 위한 상태
    const [lastCheckedIndex, setLastCheckedIndex] = useState<number | null>(
        null,
    );

    // 고유한 주문 상태 목록 추출
    const uniqueStatuses = useMemo(() => {
        if (!orders) return [];
        const statuses = [
            ...new Set(orders.map((order) => order.shippingStatus)),
        ];
        return statuses.sort();
    }, [orders]);

    // 필터링된 주문 목록
    const filteredAndSortedOrders = useMemo(() => {
        if (!orders) return [];

        let result = [...orders];

        // 상태 필터링
        if (statusFilter !== "all") {
            result = result.filter(
                (order) => order.shippingStatus === statusFilter,
            );
        }

        // 정렬
        switch (sortOption) {
            case "name_asc":
                result.sort((a, b) =>
                    a.userNm.localeCompare(b.userNm, "ko-KR"),
                );
                break;
            case "name_desc":
                result.sort((a, b) =>
                    b.userNm.localeCompare(a.userNm, "ko-KR"),
                );
                break;
            default:
                // "none"인 경우 원본 순서 유지
                break;
        }

        return result;
    }, [orders, sortOption, statusFilter]);

    // 개별 체크박스 클릭 처리 (Shift 키 범위 선택 포함)
    const handleToggleSingle = useCallback(
        (
            order: OrderData,
            currentIndex: number,
            event: React.MouseEvent<HTMLInputElement>,
        ) => {
            const isShiftPressed = event.shiftKey;

            if (
                isShiftPressed &&
                lastCheckedIndex !== null &&
                filteredAndSortedOrders
            ) {
                // Shift 키가 눌린 상태에서 범위 선택
                const startIndex = Math.min(lastCheckedIndex, currentIndex);
                const endIndex = Math.max(lastCheckedIndex, currentIndex);

                // 현재 클릭한 주문의 선택 상태를 기준으로 결정
                const isCurrentSelected = selectedOrder.some(
                    (selected) => selected._id === order._id,
                );
                const shouldSelect = !isCurrentSelected;

                // 범위 내의 모든 주문을 선택/해제 (현재 클릭한 항목 포함)
                for (let i = startIndex; i <= endIndex; i++) {
                    const targetOrder = filteredAndSortedOrders[i];
                    if (targetOrder) {
                        const isTargetSelected = selectedOrder.some(
                            (selected) => selected._id === targetOrder._id,
                        );

                        // 목표 상태와 현재 상태가 다르면 토글
                        if (shouldSelect !== isTargetSelected) {
                            setTimeout(() => toggleSingle(targetOrder), 0);
                        }
                    }
                }
            } else {
                // 일반 클릭 - 단일 토글
                toggleSingle(order);
                setLastCheckedIndex(currentIndex);
            }
        },
        [
            lastCheckedIndex,
            filteredAndSortedOrders,
            selectedOrder,
            toggleSingle,
        ],
    );

    // 전체 선택 시 lastCheckedIndex 초기화
    const handleToggleAll = useCallback(() => {
        toggleAll();
        setLastCheckedIndex(null);
    }, [toggleAll]);

    // 필터 초기화
    const resetFilters = () => {
        setSortOption("none");
        setStatusFilter("all");
        setLastCheckedIndex(null);
    };

    // 헬퍼 함수: 안전한 상태 텍스트 가져오기
    const getStatusText = (status: string) => {
        return statusResult[status as keyof typeof statusResult] || status;
    };

    // 헬퍼 함수: 안전한 상태 색상 가져오기
    const getStatusColor = (status: string) => {
        return (
            statusColor[status as keyof typeof statusColor] || "text-gray-600"
        );
    };

    return (
        <div className="w-full max-w-full p-4 font-pretendard sm:p-6 lg:p-16">
            {/* 헤더 */}
            <div className="mb-6 mt-[7vh]">
                <div className="flex flex-col gap-4">
                    {/* 타이틀과 버튼들 */}
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                        <div className="flex items-center gap-3">
                            <h1 className="text-xl font-semibold text-gray-800 sm:text-2xl">
                                주문 관리
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

                        <button
                            onClick={() => {
                                setIsSelectedModalOpen(true);
                            }}
                            className={`flex h-10 items-center justify-center whitespace-nowrap rounded border border-gray-300 bg-gray-100 px-4 text-gray-600 transition-colors sm:h-12 ${
                                selectedOrder.length > 0
                                    ? "hover:bg-gray-200 hover:text-gray-800"
                                    : "opacity-50"
                            }`}
                            title="일괄 변경"
                            disabled={selectedOrder.length === 0}
                        >
                            일괄 변경 ({selectedOrder.length})
                        </button>
                    </div>

                    {/* 필터 옵션 */}
                    <div className="flex flex-col items-start gap-4 rounded-lg bg-gray-50 p-4 lg:flex-row lg:items-center">
                        <div className="flex flex-1 flex-col items-start gap-3 sm:flex-row sm:items-center">
                            {/* 정렬 옵션 */}
                            <div className="flex items-center gap-2">
                                <span className="whitespace-nowrap text-sm text-gray-600">
                                    정렬:
                                </span>
                                <select
                                    value={sortOption}
                                    onChange={(e) =>
                                        setSortOption(
                                            e.target.value as SortOption,
                                        )
                                    }
                                    className="min-h-[44px] rounded-sm border border-gray-300 bg-white px-3 py-2 text-sm hover:border-gray-400 focus:border-gray-500 focus:outline-none focus:ring-1 focus:ring-gray-500"
                                >
                                    <option value="none">기본 순서</option>
                                    <option value="name_asc">
                                        주문자명 ㄱ-Z 순
                                    </option>
                                    <option value="name_desc">
                                        주문자명 Z-ㄱ 순
                                    </option>
                                </select>
                            </div>

                            {/* 상태 필터 */}
                            <div className="flex items-center gap-2">
                                <span className="whitespace-nowrap text-sm text-gray-600">
                                    상태:
                                </span>
                                <select
                                    value={statusFilter}
                                    onChange={(e) =>
                                        setStatusFilter(e.target.value)
                                    }
                                    className="focus:border-gray-5000 min-h-[44px] rounded-sm border border-gray-300 bg-white px-3 py-2 text-sm hover:border-gray-500 focus:outline-none focus:ring-1 focus:ring-gray-500"
                                >
                                    <option value="all">전체 상태</option>
                                    {uniqueStatuses.map((status) => (
                                        <option key={status} value={status}>
                                            {getStatusText(status)}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            {/* 필터 초기화 버튼 */}
                            {(sortOption !== "none" ||
                                statusFilter !== "all") && (
                                <button
                                    onClick={resetFilters}
                                    className="min-h-[44px] rounded-sm border border-gray-300 px-3 py-2 text-sm text-gray-600 transition-colors hover:bg-gray-100 hover:text-gray-800"
                                >
                                    필터 초기화
                                </button>
                            )}
                        </div>

                        {/* 결과 정보 */}
                        <div className="text-sm text-gray-600">
                            총{" "}
                            <span className="font-medium text-blue-600">
                                {filteredAndSortedOrders.length}
                            </span>
                            개 주문
                            {orders &&
                                filteredAndSortedOrders.length !==
                                    orders.length && (
                                    <span className="ml-1 text-gray-500">
                                        (전체 {orders.length}개 중)
                                    </span>
                                )}
                        </div>
                    </div>

                    {/* 활성 필터 표시 */}
                    {(sortOption !== "none" || statusFilter !== "all") && (
                        <div className="flex flex-wrap gap-2">
                            {sortOption !== "none" && (
                                <span className="inline-flex items-center rounded-full bg-blue-100 px-3 py-1 text-xs font-medium text-blue-800">
                                    정렬:{" "}
                                    {sortOption === "name_asc"
                                        ? "주문자명 ㄱ-Z 순"
                                        : "주문자명 Z-ㄱ 순"}
                                    <button
                                        onClick={() => setSortOption("none")}
                                        className="ml-1 hover:text-blue-600"
                                    >
                                        ×
                                    </button>
                                </span>
                            )}
                            {statusFilter !== "all" && (
                                <span className="inline-flex items-center rounded-full bg-green-100 px-3 py-1 text-xs font-medium text-green-800">
                                    상태: {getStatusText(statusFilter)}
                                    <button
                                        onClick={() => setStatusFilter("all")}
                                        className="ml-1 hover:text-green-600"
                                    >
                                        ×
                                    </button>
                                </span>
                            )}
                        </div>
                    )}
                </div>
            </div>

            {/* 테이블 컨테이너 */}
            <div className="overflow-hidden rounded-lg bg-white">
                <div className="overflow-x-auto">
                    <table className="w-full min-w-[700px] text-left text-sm">
                        <thead>
                            <tr className="whitespace-nowrap border-b bg-gray-50 text-gray-600">
                                <th className="w-[5%] px-4 py-3">
                                    <input
                                        type="checkbox"
                                        checked={isAllSelected}
                                        onChange={handleToggleAll}
                                        className="h-4 w-4"
                                    />
                                </th>
                                <th className="w-[15%] px-4 py-3 text-xs font-medium sm:text-sm">
                                    주문번호
                                </th>
                                <th className="w-[15%] px-4 py-3 text-xs font-medium sm:text-sm">
                                    결제번호
                                </th>
                                <th className="w-[10%] px-4 py-3 text-xs font-medium sm:text-sm">
                                    <div className="flex items-center gap-1">
                                        주문자
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
                                <th className="w-[10%] px-4 py-3 text-xs font-medium sm:text-sm">
                                    휴대전화번호
                                </th>
                                <th className="w-[20%] px-4 py-3 text-xs font-medium sm:text-sm">
                                    주소
                                </th>
                                <th className="w-[10%] px-4 py-3 text-xs font-medium sm:text-sm">
                                    상품목록
                                </th>
                                <th className="w-[10%] px-4 py-3 text-xs font-medium sm:text-sm">
                                    상태
                                </th>
                                <th className="w-[5%] px-4 py-3 text-xs font-medium sm:text-sm">
                                    상태 변경
                                </th>
                            </tr>
                        </thead>
                        {!orderListLoading && filteredAndSortedOrders && (
                            <tbody>
                                {filteredAndSortedOrders.map(
                                    (order: OrderData, index) => (
                                        <tr
                                            key={order._id}
                                            className={`border-b transition-colors hover:bg-gray-50 ${
                                                lastCheckedIndex === index
                                                    ? "bg-blue-50 ring-1 ring-blue-200"
                                                    : ""
                                            }`}
                                        >
                                            {/* 체크 박스 */}
                                            <td className="whitespace-nowrap px-4 py-3">
                                                {order._id && (
                                                    <input
                                                        type="checkbox"
                                                        className="h-4 w-4"
                                                        checked={selectedOrder.some(
                                                            (selected) =>
                                                                selected._id ===
                                                                order._id,
                                                        )}
                                                        onClick={(e) => {
                                                            handleToggleSingle(
                                                                order,
                                                                index,
                                                                e,
                                                            );
                                                        }}
                                                        onChange={() => {}} // 빈 함수로 onChange 경고 방지
                                                    />
                                                )}
                                            </td>
                                            {/* 주문번호 */}
                                            <td className="whitespace-nowrap px-4 py-3">
                                                <div 
                                                    className="font-mono text-xs text-gray-600 sm:text-sm cursor-pointer truncate w-[10vw] hover:underline"
                                                    onClick={() => {
                                                        navigator.clipboard.writeText(`${order._id}`);
                                                        alert("주문번호가 클립보드에 복사되었습니다.");
                                                    }}
                                                >
                                                    {order._id}
                                                </div>
                                            </td>
                                            {/* 결제번호 */}
                                            <td className="whitespace-nowrap px-4 py-3">
                                                <div 
                                                    className="font-mono text-xs text-gray-600 sm:text-sm cursor-pointer truncate w-[10vw] hover:underline"
                                                    onClick={() => {
                                                        navigator.clipboard.writeText(`${order.paymentId}`);
                                                        alert("결제번호가 클립보드에 복사되었습니다.");
                                                    }}
                                                >
                                                    {order.paymentId}
                                                </div>
                                            </td>
                                            {/* 주문자명 */}
                                            <td className="whitespace-nowrap px-4 py-3">
                                                <button
                                                    className="text-xs font-medium hover:text-blue-700 hover:underline sm:text-sm"
                                                    onClick={() => {
                                                        setOrderData(order);
                                                        setIsUserModalOpen(
                                                            true,
                                                        );
                                                    }}
                                                >
                                                    {order.userNm}
                                                    {lastCheckedIndex ===
                                                        index && (
                                                        <span className="ml-1 text-xs text-blue-500">
                                                            ●
                                                        </span>
                                                    )}
                                                </button>
                                            </td>
                                            {/* 휴대전화번호 */}
                                            <td className="whitespace-nowrap px-4 py-3 text-xs text-gray-700 sm:text-sm">
                                                {order.phoneNumber || "-"}
                                            </td>
                                            {/* 주소 */}
                                            <td className="px-4 py-3">
                                                <div className="max-w-full truncate text-xs text-gray-700 sm:text-sm">
                                                    {`${order.address}${order.detailAddress ? `, ${order.detailAddress}` : ""}${order.postcode ? ` (${order.postcode})` : ""}`}
                                                </div>
                                            </td>
                                            {/* 상품 목록 */}
                                            <td className="whitespace-nowrap px-4 py-3">
                                                <button
                                                    className="text-xs hover:text-blue-700 hover:underline sm:text-sm"
                                                    onClick={() => {
                                                        setOrderData(order);
                                                        setIsProductModalOpen(
                                                            true,
                                                        );
                                                    }}
                                                >
                                                    총{" "}
                                                    {order?.items.reduce(
                                                        (acc, cur) =>
                                                            acc + cur.quantity,
                                                        0,
                                                    ) || 0}
                                                    개
                                                </button>
                                            </td>
                                            {/* 상태 */}
                                            <td className="whitespace-nowrap px-4 py-3">
                                                <span
                                                    className={`-ms-2 inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${getStatusColor(order.shippingStatus)}`}
                                                >
                                                    {getStatusText(
                                                        order.shippingStatus
                                                    )}
                                                </span>
                                            </td>
                                            {/* 상태 변경 */}
                                            <td className="px-4 py-3">
                                                <button
                                                    className="text-xs font-medium text-red-500 hover:text-red-700 sm:text-sm"
                                                    onClick={() => {
                                                        setOrderData(order);
                                                        setIsStatusModalOpen(
                                                            true,
                                                        );
                                                    }}
                                                >
                                                    변경
                                                </button>
                                            </td>
                                        </tr>
                                    ),
                                )}
                            </tbody>
                        )}
                    </table>
                </div>

                {/* 로딩 상태 */}
                {orderListLoading && (
                    <div className="py-12 text-center">
                        <div className="inline-block h-8 w-8 animate-spin rounded-full border-b-2 border-blue-600"></div>
                        <p className="mt-2 text-sm text-gray-500">
                            주문 목록을 불러오는 중...
                        </p>
                    </div>
                )}

                {/* 빈 상태 */}
                {!orderListLoading && filteredAndSortedOrders.length === 0 && (
                    <div className="py-12 text-center text-gray-500">
                        <span className="mt-2 text-base font-medium text-gray-900">
                            {statusFilter !== "all" || sortOption !== "none"
                                ? "필터 조건에 맞는 주문이 없습니다"
                                : "주문이 없습니다"}
                        </span>
                        <p className="mt-1 text-sm text-gray-500">
                            {statusFilter !== "all" || sortOption !== "none"
                                ? "다른 필터 조건을 시도해보세요."
                                : "아직 등록된 주문이 없습니다."}
                        </p>
                    </div>
                )}
            </div>

            {/* 모달들 */}
            {isUserModalOpen && orderData && (
                <UserInfoModal orderData={orderData} onClose={onClose} />
            )}
            {isProductModalOpen && orderData && (
                <ProductInfoModal orderData={orderData} onClose={onClose} />
            )}
            {isStatusModalOpen && orderData && (
                <StatusUpdateModal orderData={orderData} onClose={onClose} />
            )}
            {isSelectedModalOpen && (
                <StatusUpdateSelectedModal
                    orderData={selectedOrder}
                    onClose={onClose}
                />
            )}
        </div>
    );
};

export default Orders;
