const ProductSkeleton = () => {
    return (
        <li className="animate-pulse text-center pb-6">
            {/* 이미지 영역: 3:4 비율을 동일하게 유지 */}
            <div className="relative overflow-hidden">
                <div className="pb-[133.33%]"></div>
                <div className="absolute inset-0 bg-gray-200"></div>
            </div>

            {/* 상품 정보 텍스트 영역 */}
            <div className="pt-2">
                {/* 영문 제목 [Title] */}
                <div className="mx-auto mt-1 h-4 w-3/4 rounded bg-gray-200 sm:h-5"></div>
                {/* 한글 제목 */}
                <div className="mx-auto mt-2 h-4 w-1/2 rounded bg-gray-200 sm:h-5"></div>
                {/* 컬러 정보 */}
                <div className="mx-auto mt-2 h-3 w-1/4 rounded bg-gray-200 sm:h-4"></div>
            </div>

            {/* 가격 정보 텍스트 영역 */}
            <div className="mt-4">
                <div className="mx-auto h-4 w-1/3 rounded bg-gray-200 sm:h-5"></div>
            </div>
        </li>
    );
};

export default ProductSkeleton;