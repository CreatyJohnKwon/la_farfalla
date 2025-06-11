import {
    QueryObserverResult,
    useMutation,
    useQuery,
    useQueryClient,
} from "@tanstack/react-query";
import { OrderData } from "@src/entities/type/interfaces";
import { getAllOrder, updateAdminOrder } from "../../lib/server/order";

const useAllOrderQuery = () => {
    return useQuery<OrderData[], Error>({
        queryKey: ["admin-order"],
        queryFn: () => getAllOrder(),
        staleTime: 1000 * 60 * 3, // 3분 캐시
        retry: false, // 실패 시 재시도 OFF
    });
};

const useUpdateOrderMutation = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({
            orderId,
            shippingStatus,
            trackingNumber,
        }: {
            orderId: string | undefined;
            shippingStatus: string;
            trackingNumber: string;
        }) => updateAdminOrder(orderId, shippingStatus, trackingNumber),

        onSuccess: (data: any) => {
            console.log("✅ 업데이트 성공:", data);
            queryClient.invalidateQueries({ queryKey: ["orders"] }); // 주문 목록 refetch
            alert("업데이트 성공!");
        },

        onError: (error: any) => {
            console.error("❌ 업데이트 실패:", error);
            alert("업데이트 중 문제가 발생했어요.");
        },
    });
};

export { useAllOrderQuery, useUpdateOrderMutation };
