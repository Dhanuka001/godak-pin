import { Link } from 'react-router-dom';

const ItemCard = ({ item }) => {
  const formatTimeAgo = () => {
    if (!item.createdAt) return '';
    const now = new Date();
    const created = new Date(item.createdAt);
    const diffMs = now - created;
    const minutes = Math.floor(diffMs / 60000);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (days > 0) return `${days} day${days > 1 ? 's' : ''} ago`;
    if (hours > 0) return `${hours} hour${hours > 1 ? 's' : ''} ago`;
    return `${Math.max(minutes, 1)} min ago`;
  };

  return (
    <div className="card overflow-hidden hover:shadow-lg transition">
      <div className="h-48 bg-slate-100">
        <img
          src={item.imageUrl || '/placeholder.jpg'}
          alt={item.title}
          className="h-full w-full object-cover"
          onError={(e) => {
            e.target.src = 'https://via.placeholder.com/400x200.png?text=GodakPin.lk';
          }}
        />
      </div>
      <div className="p-3 space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-[11px] bg-primary/10 text-primary px-2.5 py-1 rounded-full whitespace-nowrap">
            මුලින් එන කෙනාට
          </span>
          <span className="text-[11px] text-slate-500 whitespace-nowrap">{item.condition}</span>
        </div>
        <h3 className="text-sm font-semibold text-slate-900 truncate">{item.title}</h3>
        <div className="text-xs text-slate-600 flex flex-wrap gap-2 items-center">
          <span className="bg-slate-100 px-2.5 py-1 rounded-full whitespace-nowrap flex items-center gap-1">
            <span aria-hidden>📍</span>
            <span className="whitespace-nowrap">
              {item.district} • {item.city}
            </span>
          </span>
        </div>
        <div className="flex justify-between items-center pt-2">
          <div className="text-[11px] text-slate-500 whitespace-nowrap">{formatTimeAgo()}</div>
          <Link
            to={`/items/${item._id}`}
            className="inline-flex items-center justify-center rounded-lg border border-primary text-primary px-3 py-2 text-xs font-semibold transition hover:bg-primary/10 focus:outline-none focus:ring-2 focus:ring-primary-dark focus:ring-offset-2 whitespace-nowrap"
          >
            වැඩි විස්තර / Details
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ItemCard;
