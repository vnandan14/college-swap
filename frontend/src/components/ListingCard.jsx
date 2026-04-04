import { Link } from 'react-router-dom';
import { Heart, MapPin, Clock } from 'lucide-react';

const CONDITION_LABELS = { new: 'New', like_new: 'Like New', good: 'Good', fair: 'Fair', poor: 'Poor' };
const CONDITION_COLORS = { new: 'bg-green-100 text-green-800', like_new: 'bg-teal-100 text-teal-800', good: 'bg-blue-100 text-blue-800', fair: 'bg-yellow-100 text-yellow-700', poor: 'bg-red-100 text-red-700' };

function timeAgo(dateStr) {
  const diff = Date.now() - new Date(dateStr);
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

export default function ListingCard({ listing }) {
  const img = listing.image_urls?.[0];

  return (
    <Link to={`/listing/${listing.id}`} className="group bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-md hover:-translate-y-0.5 transition-all duration-200">
      {/* Image */}
      <div className="relative aspect-square bg-gray-100 overflow-hidden">
        {img
          ? <img src={img} alt={listing.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
          : <div className="w-full h-full flex items-center justify-center text-4xl">{listing.categories?.icon || '📦'}</div>
        }
        {listing.status === 'reserved' && (
          <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
            <span className="bg-yellow-400 text-yellow-900 text-xs font-bold px-2 py-1 rounded-full">Reserved</span>
          </div>
        )}
        <span className={`absolute top-2 left-2 text-xs font-medium px-2 py-0.5 rounded-full ${CONDITION_COLORS[listing.condition]}`}>
          {CONDITION_LABELS[listing.condition]}
        </span>
      </div>

      {/* Info */}
      <div className="p-3">
        <h3 className="font-medium text-gray-900 text-sm line-clamp-2 mb-1 group-hover:text-green-700 transition-colors">{listing.title}</h3>
        <p className="text-lg font-bold text-green-700">₹{listing.price.toLocaleString('en-IN')}</p>
        {listing.is_negotiable && <p className="text-xs text-gray-400">Negotiable</p>}

        <div className="mt-2 flex items-center justify-between">
          <div className="flex items-center gap-1 text-xs text-gray-500">
            <MapPin size={11} />
            <span className="truncate max-w-[100px]">{listing.college || listing.users?.college}</span>
          </div>
          <div className="flex items-center gap-1 text-xs text-gray-400">
            <Clock size={11} />
            {timeAgo(listing.created_at)}
          </div>
        </div>

        {listing.users && (
          <div className="mt-2 flex items-center gap-1.5">
            <div className="w-5 h-5 rounded-full bg-green-100 flex items-center justify-center text-green-700 text-xs font-bold">
              {listing.users.name?.[0]?.toUpperCase()}
            </div>
            <span className="text-xs text-gray-500">{listing.users.name}</span>
          </div>
        )}
      </div>
    </Link>
  );
}
