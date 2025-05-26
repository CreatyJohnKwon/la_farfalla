const SkeletonList = () => (
  <>
    {Array.from({ length: 3 }).map((_, i) => (
      <li
        key={`coupon_skeleton_${i}`}
        className="animate-pulse border border-gray-200 bg-slate-100 p-4"
      >
        <div className="mb-3 h-7 w-1/3 bg-gray-300" />
        <div className="h-5 w-1/4 bg-gray-300" />
      </li>
    ))}
  </>
);

export default SkeletonList;