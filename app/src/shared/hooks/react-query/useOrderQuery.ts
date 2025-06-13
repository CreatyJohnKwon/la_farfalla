import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { OrderData, OrderUpdateInput } from "@src/entities/type/interfaces";
import { getOrderList, updateAdminOrder } from "../../lib/server/order";

const useAllOrderQuery = () => {
    return useQuery<OrderData[], Error>({
        queryKey: ["admin-order"],
        queryFn: () => getOrderList(),
        staleTime: 1000 * 60 * 3, // 3분 캐시
        retry: false, // 실패 시 재시도 OFF
    });
};

const useSmartUpdateOrderMutation = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (input: OrderUpdateInput | OrderUpdateInput[]) => {
            // 여러 개 처리
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
                return results;
            }

            // 단일 처리
            return updateAdminOrder(
                input.orderId,
                input.shippingStatus,
                input.trackingNumber,
            );
        },

        onSuccess: (data) => {
            console.log("✅ 업데이트 성공", data);
            queryClient.invalidateQueries({ queryKey: ["orders"] });
            alert("주문 상태 업데이트 완료!");
        },

        onError: (error) => {
            console.error("❌ 업데이트 실패", error);
            alert("업데이트 중 오류가 발생했어요.");
        },
    });
};

export { useAllOrderQuery, useSmartUpdateOrderMutation };
