const SkeletonList = () => (
    <>
        {Array.from({ length: 3 }).map((_, i) => (
            <li
                key={`mileage_skeleton_${i}`}
                className="animate-pulse inset-0 border border-gray-200 bg-slate-100 p-6"
            >
                <div className="mb-3 h-4 w-1/3 bg-gray-300 rounded-sm" />
                <div className="mb-5 h-2 w-1/12 bg-gray-300 rounded-sm" />
                <div className="mb-4 h-3 w-1/12 bg-gray-300 rounded-sm" />
                <div className="mb-1 h-4 w-1/12 bg-gray-300 rounded-sm" />
                <div className="mb-4 h-2 w-1/12 bg-gray-300 rounded-sm" />
                <div className="mb-2 h-4 w-1/12 bg-gray-300 rounded-sm" />
            </li>
        ))}
    </>
);

export default SkeletonList;
