const SkeletonList = () => (
  <>
    {Array.from({ length: 3 }).map((_, i) => (
      <li
          key={`mileage_skeleton_${i}`}
          className="animate-pulse border border-gray-200 bg-slate-100 p-4"
      >
          <div className="mb-2 h-4 w-1/3 bg-gray-300" />
          <div className="mb-2 h-3 w-1/3 bg-gray-300" />
          <div className="mb-2 h-3 w-1/3 bg-gray-300" />
          <div className="mb-2 h-3 w-1/3 bg-gray-300" />
      </li>
    ))}
  </>
);

export default SkeletonList;