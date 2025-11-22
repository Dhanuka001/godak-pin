import { Link } from 'react-router-dom';

const ItemCard = ({ item }) => {
  return (
    <div className="card overflow-hidden hover:shadow-lg transition">
      <div className="h-40 bg-slate-100">
        <img
          src={item.imageUrl || '/placeholder.jpg'}
          alt={item.title}
          className="h-full w-full object-cover"
          onError={(e) => {
            e.target.src = 'https://via.placeholder.com/400x200.png?text=GodakPin.lk';
          }}
        />
      </div>
      <div className="p-4 space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-xs bg-primary/10 text-primary px-3 py-1 rounded-full">මුලින් එන කෙනාට</span>
          <span className="text-xs text-slate-500">{item.condition}</span>
        </div>
        <h3 className="text-lg font-semibold text-slate-900 truncate">{item.title}</h3>
        <div className="text-sm text-slate-600 flex flex-wrap gap-2">
          <span className="bg-slate-100 px-3 py-1 rounded-full">{item.category}</span>
          <span className="bg-slate-100 px-3 py-1 rounded-full">
            {item.district} • {item.city}
          </span>
        </div>
        <div className="flex justify-between items-center pt-2">
          <div className="text-xs text-slate-500">නිකුත් කළේ: {item.ownerName || 'සාමාජික'}</div>
          <Link to={`/items/${item._id}`} className="btn-secondary text-sm px-3 py-2">
            <span className="btn-label">
              <span className="si">වැඩි විස්තර</span>
              <span className="en">View details</span>
            </span>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ItemCard;
