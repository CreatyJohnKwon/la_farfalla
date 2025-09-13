const SkeletonList = () => (
  <>
    {Array.from({ length: 5 }).map((_, i) => (
      <li
          key={`mileage_skeleton_${i}`}
          className="border p-5"
      >
        <div className="flex items-center justify-between h-5 animate-fade-in">
          <div className="h-full w-12 sm:w-16 bg-gray-300 rounded-sm" />
          <div className="h-full w-20 bg-gray-300 rounded-sm -ms-12 sm:-ms-[28vw]" />
          <div className="h-full w-10 bg-gray-300 rounded-sm" />
        </div>
      </li>
    ))}
  </>
);

export default SkeletonList;