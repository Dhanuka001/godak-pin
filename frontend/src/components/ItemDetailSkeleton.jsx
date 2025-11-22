const ItemDetailSkeleton = () => (
  <div className="container-fixed py-8">
    <div className="grid md:grid-cols-2 gap-6">
      <div className="skeleton h-72" />
      <div className="space-y-4">
        <div className="h-6 w-1/2 skeleton" />
        <div className="h-4 w-1/3 skeleton" />
        <div className="h-4 w-1/2 skeleton" />
        <div className="h-20 skeleton" />
        <div className="h-12 w-40 skeleton" />
      </div>
    </div>
  </div>
);

export default ItemDetailSkeleton;
