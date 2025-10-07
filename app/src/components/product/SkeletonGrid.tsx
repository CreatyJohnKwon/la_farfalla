import ProductSkeleton from "./ProductSkeleton";

const SkeletonGrid = ({ count = 9 }: { count?: number }) => {
    return (
        <ul className="w-[93vw] animate-fade-in grid-cols-2 gap-2 grid md:hidden">
            {Array.from({ length: count }).map((_, index) => (
                <ProductSkeleton key={index} />
            ))}
        </ul>
    );
};

export default SkeletonGrid;
