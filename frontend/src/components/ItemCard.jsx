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

  const statusValue = item.status || 'available';
  const statusLabel =
    statusValue === 'given'
      ? 'Given / ලබා දී ඇත'
      : statusValue === 'reserved'
      ? 'Reserved / රඳවා ඇත'
      : 'Available / ලබා දීමට';
  const statusTone =
    statusValue === 'given'
      ? 'bg-emerald-50 text-emerald-700 border-emerald-100'
      : statusValue === 'reserved'
      ? 'bg-amber-50 text-amber-700 border-amber-100'
      : 'bg-blue-50 text-blue-700 border-blue-100';
  const statusTextTone =
    statusValue === 'given'
      ? 'text-emerald-700'
      : statusValue === 'reserved'
      ? 'text-amber-700'
      : 'text-blue-700';

  return (
    <Link to={`/items/${item.slug || item._id}`} className="block">
      {/* Mobile layout */}
      <div className="md:hidden border-b border-slate-200 py-3 px-1 hover:bg-slate-50 transition">
        <div className="flex gap-3">
          <div className="w-24 h-24 rounded-lg overflow-hidden bg-slate-100 flex-shrink-0">
            <img
              src={item.imageUrl || '/placeholder.jpg'}
              alt={item.title}
              className="w-full h-full object-cover"
              onError={(e) => {
                e.target.src = 'https://via.placeholder.com/400x200.png?text=GodakPin.lk';
              }}
            />
          </div>
          <div className="flex-1 space-y-1 flex flex-col">
            <div className="flex items-start justify-between gap-2">
              <h3 className="text-sm font-semibold text-slate-900 line-clamp-2">{item.title}</h3>
              <span className="text-[11px] text-slate-500 whitespace-nowrap">{formatTimeAgo()}</span>
            </div>
            <span className={`text-[11px] font-semibold ${statusTextTone}`}>{statusLabel}</span>
            <div className="text-xs text-slate-600 line-clamp-2">{descriptionSnippet || item.condition}</div>
            <div className="text-xs font-semibold text-primary flex items-center gap-1">
              <span aria-hidden>📍</span>
              <span className="truncate">{item.city || 'City'}</span>
            </div>
            <div className="mt-auto flex justify-end">
              <span className="inline-flex items-center gap-2 text-primary px-3 py-2 rounded-lg text-xs font-semibold transition hover:text-primary-dark">
                <span>විස්තර බලන්න / Details</span>
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Desktop layout */}
      <div className="hidden md:block card overflow-hidden hover:shadow-lg transition group">
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
            <span className={`text-[11px] font-semibold px-2 py-1 rounded-full border ${statusTone}`}>{statusLabel}</span>
          </div>
          <div className="flex items-center justify-between text-[11px] text-primary font-semibold gap-2">
            <span className="flex items-center gap-1">
              <span aria-hidden>📍</span>
              <span className="truncate max-w-[160px]">{item.city || 'City'}</span>
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
      </div>
    </Link>
  );
};

export default ItemCard;
