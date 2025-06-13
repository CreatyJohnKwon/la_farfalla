import { useQuery } from "@tanstack/react-query";
import { Product, Season } from "@/src/entities/type/interfaces";
import { getProduct, getProductList } from "../../lib/server/product";
import { getSeason } from "../../lib/server/season";

const useProductListQuery = () => {
    return useQuery<Product[], Error>({
        queryKey: ["get-product-list"],
        queryFn: () => getProductList(),
        staleTime: 1000 * 60 * 3, // 3분 캐시
        retry: false, // 실패시 재시도 OFF
    });
};

const useProductQuery = (id: string) => {
    return useQuery<Product, Error>({
        queryKey: ["get-product", id],
        queryFn: () => getProduct(id),
        staleTime: 0, // 항상 refresh
        retry: false, // 실패시 재시도 OFF
    });
};

const useSeasonQuery = () => {
    return useQuery<Season[], Error>({
        queryKey: ["get-season"],
        queryFn: () => getSeason(),
        staleTime: 1000 * 60 * 60, // 1시간 캐시
        retry: true,
    });
};

export { useProductListQuery, useProductQuery, useSeasonQuery };
