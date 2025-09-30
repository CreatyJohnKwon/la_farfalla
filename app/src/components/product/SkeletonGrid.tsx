import ProductSkeleton from "./ProductSkeleton";

const SkeletonGrid = ({ count = 9 }: { count?: number }) => {
    return (
        <ul className="grid w-[93vw] animate-fade-in grid-cols-2 gap-2 sm:gap-24 md:grid-cols-3">
            {Array.from({ length: count }).map((_, index) => (
                <ProductSkeleton key={index} />
            ))}
        </ul>
    );
};

export default SkeletonGrid;
