import { Link } from 'react-router-dom';

const AdPreviewCard = ({ listing }) => {
  if (!listing) return null;
  const listingUrl = listing.slug ? `/items/${listing.slug}` : `/items/${listing.id}`;
  return (
    <div className="border-b border-slate-100 px-6 py-4">
      <div className="flex items-center gap-3 rounded-2xl bg-slate-50 p-3">
        <div className="h-16 w-16 flex-shrink-0 overflow-hidden rounded-2xl bg-slate-200">
          <img
            src={listing.imageUrl || '/placeholder.jpg'}
            alt={listing.title}
            className="h-full w-full object-cover"
            onError={(event) => {
              event.currentTarget.src = 'https://via.placeholder.com/200x200.png?text=Listing';
            }}
          />
        </div>
        <div className="flex flex-1 flex-col gap-1">
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-400">Listing</p>
          <p className="text-sm font-semibold text-slate-900 line-clamp-2">{listing.title}</p>
          <div className="flex items-center justify-between text-xs text-slate-500">
            <span className="text-sm font-semibold text-slate-600">Free to take</span>
            <Link to={listingUrl} className="text-primary font-semibold">
              View listing ↗
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdPreviewCard;
