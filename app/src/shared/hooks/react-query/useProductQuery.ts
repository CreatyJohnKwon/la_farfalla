import { useQuery } from "@tanstack/react-query";
import { Product } from "@/src/entities/type/interfaces";
import { getAllProduct } from "../../lib/server/product";

const useProductQuery = () => {
    return useQuery<Product[], Error>({
        queryKey: ["admin-get-product"],
        queryFn: () => getAllProduct(),
        staleTime: 1000 * 60 * 3, // 3분 캐시
        retry: false, // 실패시 재시도 OFF
    });
};

export { useProductQuery };
