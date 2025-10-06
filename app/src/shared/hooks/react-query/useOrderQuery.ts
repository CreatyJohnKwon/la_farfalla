import { useInfiniteQuery, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
    getOrders,
    getSingleOrder,
    getOrderList,
    updateAdminOrder,
    updateOrderAddress,
    updateStock,
} from "../../lib/server/order";
import { useSetAtom } from "jotai";
import { resetProductFormAtom } from "../../lib/atom";
import { AddressUpdateInput } from "@src/entities/type/order";
import { OrderData, OrderPage, OrderUpdateInput, StockUpdateItem } from "@src/components/order/interface";
import useUsers from "../useUsers";

const useAllOrderQuery = () => {
    return useInfiniteQuery<OrderPage, Error, OrderPage, readonly ["admin-orders-infinite"], number>({
        queryKey: ["admin-orders-infinite"],
        queryFn: ({ pageParam }) => getOrderList({ pageParam }),
        initialPageParam: 1, // 첫 페이지의 파라미터
        getNextPageParam: (lastPage) => { // 다음 페이지 파라미터를 계산하는 로직
            return lastPage.nextPage ?? undefined;
        },
        staleTime: 1000 * 60 * 3, // 3분 캐시
        retry: false,
    });
};

const useSmartUpdateOrderMutation = () => {
    const queryClient = useQueryClient();
    const resetProductForm = useSetAtom(resetProductFormAtom);
    const { session } = useUsers();

    return useMutation({
        mutationFn: async (input: OrderUpdateInput | OrderUpdateInput[]) => {
            if (Array.isArray(input)) {
                const results = await Promise.allSettled(
                    input.map((order) =>
                        updateAdminOrder(
                            order.orderId,
                            order.shippingStatus,
                            order.trackingNumber,
                        ),
                    ),
                );

                // 실패한 항목들 체크
                const failures = results.filter(
                    (result) => result.status === "rejected",
                );
                if (failures.length > 0) {
                    throw new Error(`${failures.length}개 항목 업데이트 실패`);
                }

                return results;
            }

            return updateAdminOrder(
                input.orderId,
                input.shippingStatus,
                input.trackingNumber,
            );
        },

        onSuccess: () => {
            // 더 구체적인 캐시 업데이트
            queryClient.invalidateQueries({ queryKey: ["orders"] });
            resetProductForm();
        },

        onError: (error, variables) => {
            console.error("❌ useSmartUpdateOrderMutation | 업데이트 실패", {
                error,
                variables,
            });
            const count = Array.isArray(variables) ? variables.length : 1;
            alert(
                `${count}개 주문 업데이트 중 오류가 발생했습니다: ${error.message}`,
            );
        },
    });
};

const useOrderQuery = (userId?: string) => {
    return useQuery<OrderData[], Error>({
        queryKey: ["order-list", userId],
        queryFn: () => getOrders(userId!),
        enabled: Boolean(userId), // userId 준비되면 요청
        retry: false, // 실패 시 재시도 OFF
    });
};

const useSingleOrderQuery = (orderId: string) => {
    return useQuery<OrderData, Error>({
        queryKey: ["order-single", orderId],
        queryFn: () => getSingleOrder(orderId),
        enabled: Boolean(orderId), // userId 준비되면 요청
        retry: false, // 실패 시 재시도 OFF
    });
}

const useUpdateStockMutation = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({
            items,
            action,
        }: {
            items: StockUpdateItem[];
            action: "reduce" | "restore";
        }) => {
            const productId = items[0]?.productId;
            return updateStock(items, action, productId);
        },

        onSuccess: (res) => {
            // 관련 상품 데이터 무효화
            if (res.success) {
                res.items.forEach((update: StockUpdateItem) => {
                    queryClient.invalidateQueries({
                        queryKey: ["product", update.productId],
                    });
                    queryClient.invalidateQueries({
                        queryKey: [
                            "product-stock",
                            update.productId,
                            update.color,
                        ],
                    });
                });
    
                queryClient.invalidateQueries({ queryKey: ["products"] });
            }
            console.warn(res.message);
        },
        onError: (error) => {
            console.error("❌ 재고 업데이트 실패:", error.message);
        },
    });
};

const useUpdateAddressOrder = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (input: AddressUpdateInput) => {
            return updateOrderAddress(
                input.orderId,
                input.newAddress,
                input.reason,
                input.orderInfo,
            );
        },

        onSuccess: (data, variables) => {
            // 주문 관련 캐시 무효화
            queryClient.invalidateQueries({ queryKey: ["orders"] });
            queryClient.invalidateQueries({ queryKey: ["admin-order"] });
            queryClient.invalidateQueries({
                queryKey: ["order-list", data.userId],
            });

            // console.log("✅ 배송지 변경 완료:", data);
        },

        onError: (error, variables) => {
            console.error("❌ 배송지 변경 실패:", error);
            throw error; // 에러를 다시 throw하여 컴포넌트에서 처리할 수 있도록
        },
    });
};

export {
    useSingleOrderQuery,
    useAllOrderQuery,
    useSmartUpdateOrderMutation,
    useOrderQuery,
    useUpdateStockMutation,
    useUpdateAddressOrder,
};
