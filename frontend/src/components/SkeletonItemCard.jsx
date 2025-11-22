const SkeletonItemCard = () => (
  <div className="card overflow-hidden">
    <div className="h-40 skeleton" />
    <div className="p-4 space-y-3">
      <div className="flex gap-2">
        <div className="h-4 w-20 skeleton" />
        <div className="h-4 w-16 skeleton" />
      </div>
      <div className="h-5 w-3/4 skeleton" />
      <div className="h-4 w-1/2 skeleton" />
      <div className="h-9 skeleton" />
    </div>
  </div>
);

export default SkeletonItemCard;
