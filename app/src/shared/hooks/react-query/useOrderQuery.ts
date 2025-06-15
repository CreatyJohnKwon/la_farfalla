import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { OrderData, OrderUpdateInput } from "@src/entities/type/interfaces";
import { getOrderList, updateAdminOrder } from "../../lib/server/order";
import useProduct from "../useProduct";

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
    const { setFormData } = useProduct();

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

        onSuccess: (variables) => {
            // 더 구체적인 캐시 업데이트
            queryClient.invalidateQueries({ queryKey: ["orders"] });

            // 배열인지 단일인지에 따른 메시지 구분
            const count = Array.isArray(variables) ? variables.length : 1;
            alert(`${count}개 주문 상태 업데이트 완료!`);

            setFormData({
                title: {
                    kr: "",
                    eg: "",
                },
                description: {
                    images: [],
                    text: "",
                },
                price: "",
                discount: "",
                image: [],
                colors: [],
                seasonName: "",
                size: [],
            });
        },

        onError: (error, variables) => {
            console.error("❌ 업데이트 실패", error);
            const count = Array.isArray(variables) ? variables.length : 1;
            alert(
                `${count}개 주문 업데이트 중 오류가 발생했어요: ${error.message}`,
            );
        },
    });
};

export { useAllOrderQuery, useSmartUpdateOrderMutation };
