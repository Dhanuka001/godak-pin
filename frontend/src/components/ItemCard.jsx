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

  const descriptionSnippet =
    typeof item.description === 'string' && item.description.length
      ? `${item.description.slice(0, 110)}${item.description.length > 110 ? '…' : ''}`
      : '';

  return (
    <Link
      to={`/items/${item.slug || item._id}`}
      className="card overflow-hidden hover:shadow-lg transition block group"
    >
      <div className="relative h-48 bg-slate-100">
        <img
          src={item.imageUrl || '/placeholder.jpg'}
          alt={item.title}
          className="h-full w-full object-cover group-hover:scale-[1.02] transition"
          onError={(e) => {
            e.target.src = 'https://via.placeholder.com/400x200.png?text=GodakPin.lk';
          }}
        />
        <div className="absolute bottom-0 left-0 p-3 bg-gradient-to-t from-black/50 via-black/10 to-transparent text-white">
          <span className="text-[11px] bg-white/20 px-2.5 py-1 rounded-full backdrop-blur">{item.condition}</span>
        </div>
      </div>
      <div className="p-3 space-y-2">
        <div className="flex items-center justify-between text-[11px] text-slate-500 gap-3">
          <span className="whitespace-nowrap">{formatTimeAgo()}</span>
          <span className="flex items-center gap-1 text-primary font-semibold">
            <span aria-hidden>📍</span>
            <span className="truncate max-w-[120px] sm:max-w-[160px]">{item.city || 'City'}</span>
          </span>
        </div>
        <h3 className="text-sm font-semibold text-slate-900 line-clamp-2 min-h-[2.5rem]">{item.title}</h3>
        {descriptionSnippet && (
          <p className="text-xs text-slate-600 leading-relaxed line-clamp-2 min-h-[2.5rem]">{descriptionSnippet}</p>
        )}
        <div className="flex justify-end pt-1">
          <span className="inline-flex items-center gap-2 bg-white text-primary px-3 py-2 rounded-lg text-xs font-semibold border border-primary/40 shadow-sm transition hover:bg-primary hover:text-white">
            <span>විස්තර බලන්න / Details</span>
          </span>
        </div>
      </div>
    </Link>
  );
};

export default ItemCard;
