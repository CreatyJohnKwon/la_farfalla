const ProductListSkeleton = () => {
    return (
        Array.from({ length: 6 }).map((_, index) => (
            <li key={`skeleton-${index}`} className="pb-8 text-center md:pb-0">
                <div className="relative overflow-hidden">
                    <div className="pb-[133.33%]"></div>
                    <div className="absolute left-0 top-0 h-full w-full">
                        <div className="animate-shimmer h-full w-full animate-pulse bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 bg-[length:200%_100%]" />
                    </div>
                </div>
                <div className="space-y-2 pt-2">
                    <div className="h-4 animate-pulse rounded bg-gray-200"></div>
                    <div className="mx-auto h-4 w-3/4 animate-pulse rounded bg-gray-200"></div>
                    <div className="mx-auto h-3 w-1/2 animate-pulse rounded bg-gray-200"></div>
                    <div className="mx-auto h-4 w-2/3 animate-pulse rounded bg-gray-200"></div>
                </div>
            </li>
        ))
    )
}

export default ProductListSkeleton;