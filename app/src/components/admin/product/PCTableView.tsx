import { Product, SortOption } from "@/src/entities/type/products";
import useProduct from "@/src/shared/hooks/useProduct";
import { Dispatch, SetStateAction, useMemo } from "react";

import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors, DragEndEvent } from '@dnd-kit/core';
import { arrayMove, SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy } from '@dnd-kit/sortable';
import SortableRow from "./SortableRow";
import { useUpdateProductsOrderIndexMutation } from "@/src/shared/hooks/react-query/useProductQuery";

const PCTableView = ({
    sortOption,
    stockFilter,
    categoryFilter,
    products,
    setProducts,
    setIsOpenUpdateModal,
    setOnStatus,
    setEditProduct,
}: {
    sortOption: SortOption;
    stockFilter: "all" | "in_stock" | "out_of_stock";
    categoryFilter: string[];
    products: Product[];
    setProducts: Dispatch<SetStateAction<Product[]>>;
    setIsOpenUpdateModal: Dispatch<SetStateAction<boolean>>;
    setOnStatus: Dispatch<SetStateAction<"update" | "create" | undefined>>;
    setEditProduct: Dispatch<SetStateAction<Product | undefined>>;
}) => {
    const {
        deleteProduct,
        returnCategories,
    } = useProduct();
    const { mutate: updateOrder } = useUpdateProductsOrderIndexMutation();

    const sensors = useSensors(
        useSensor(PointerSensor),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        })
    );

    const productIds = useMemo(() => 
        products
            .map(p => p._id)
            .filter((id): id is string => typeof id === "string"),
        [products]
    );

    const handleDragEnd = (event: DragEndEvent) => {
        const { active, over } = event;

        if (over && active.id !== over.id) {
            setProducts((items) => {
                const oldIndex = items.findIndex((item) => item._id === active.id);
                const newIndex = items.findIndex((item) => item._id === over.id);

                const newOrderedItems = arrayMove(items, oldIndex, newIndex);

                // 서버에 보낼 데이터를 가공합니다 (전체 상품 정보 대신 _id와 새 index만 보냄).
                const orderPayload = newOrderedItems.map((item, index) => ({
                    _id: item._id!,
                    index: index,
                }));
                
                updateOrder(orderPayload);
                
                return newOrderedItems;
            });
        }
    };

    return (
        <div className="hidden overflow-x-auto lg:block">
            <DndContext
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragEnd={handleDragEnd}
            >
                <table className="w-full min-w-[700px] table-fixed text-left text-sm">
                    <thead>
                        <tr className="sticky top-0 whitespace-nowrap border-b bg-gray-50 text-gray-600">
                            {sortOption === "none" && stockFilter === "all" && categoryFilter.length === 0 ?
                                <th className="w-[5%] px-4 py-3 text-xs font-medium sm:text-sm">
                                    순서
                                </th> : null
                            }
                            <th className="w-[10%] px-4 py-3 text-xs font-medium sm:text-sm">
                                대표 이미지
                            </th>
                            <th className="w-[15%] px-4 py-3 text-xs font-medium sm:text-sm">
                                <div className="flex items-center gap-1">
                                    상품명
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
                                카테고리
                            </th>
                            <th className="w-[10%] px-4 py-3 text-xs font-medium sm:text-sm">
                                <div className="flex items-center gap-1 whitespace-nowrap">
                                    가격
                                    {(sortOption === "price_asc" ||
                                        sortOption ===
                                            "price_desc") && (
                                        <svg
                                            className={`h-4 w-4 ${sortOption === "price_asc" ? "rotate-0" : "rotate-180"}`}
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
                                상품평
                            </th>
                            <th className="w-[10%] px-4 py-3 text-xs font-medium sm:text-sm">
                                할인율
                            </th>
                            <th className="w-[15%] px-4 py-3 text-xs font-medium sm:text-sm">
                                색상
                            </th>
                            <th className="w-[15%] px-4 py-3 text-xs font-medium sm:text-sm">
                                사이즈
                            </th>
                            <th className="w-[5%] px-4 py-3 text-xs font-medium sm:text-sm">
                                총 수량
                            </th>
                            <th className="w-[10%] px-4 py-3 text-xs font-medium text-center sm:text-sm">
                                공개 여부
                            </th>
                            <th className="w-[10%] whitespace-nowrap px-4 py-3 text-xs font-medium sm:text-sm">
                                수정/삭제
                            </th>
                        </tr>
                    </thead>

                    <SortableContext items={productIds} strategy={verticalListSortingStrategy}>
                        <tbody>
                            {products.map(
                                (product: Product, index: number) => (
                                    <SortableRow
                                        index={index}
                                        key={product._id}
                                        product={product}
                                        stockFilter={stockFilter}
                                        categoryFilter={categoryFilter}
                                        sortOption={sortOption}
                                        deleteProduct={deleteProduct}
                                        returnCategories={returnCategories}
                                        setIsOpenUpdateModal={setIsOpenUpdateModal}
                                        setOnStatus={setOnStatus}
                                        setEditProduct={setEditProduct}
                                    />
                                ),
                            )}
                        </tbody>
                    </SortableContext>
                </table>
            </DndContext>
        </div>
    )
}

export default PCTableView;