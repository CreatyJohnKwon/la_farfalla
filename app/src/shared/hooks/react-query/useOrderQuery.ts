import { useQuery } from "@tanstack/react-query";
import { OrderData } from "@src/entities/type/interfaces";
import { getAllOrder } from "../../lib/server/order";

const useAllOrderQuery = () => {
    return useQuery<OrderData[], Error>({
        queryKey: ["admin-order"],
        queryFn: () => getAllOrder(),
        staleTime: 1000 * 60 * 3, // 3분 캐시
        retry: false, // 실패 시 재시도 OFF
    });
};

export { useAllOrderQuery };
