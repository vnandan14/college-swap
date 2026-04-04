import { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { MapPin, Star, Eye, MessageCircle, Heart, Share2, ChevronLeft, ChevronRight, Trash2, Edit } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { authHeader } from '../lib/supabase';
import OfferModal from '../components/OfferModal';
import toast from 'react-hot-toast';

const API = import.meta.env.VITE_API_URL;
const CONDITION_LABELS = { new: 'New', like_new: 'Like New', good: 'Good', fair: 'Fair', poor: 'Poor' };

export default function ListingDetail() {
  const { id }    = useParams();
  const { user }  = useAuth();
  const navigate  = useNavigate();
  const [listing,     setListing]     = useState(null);
  const [loading,     setLoading]     = useState(true);
  const [imgIdx,      setImgIdx]      = useState(0);
  const [showOffer,   setShowOffer]   = useState(false);
  const [deleting,    setDeleting]    = useState(false);
  const [buying,      setBuying]      = useState(false);

  useEffect(() => { fetchListing(); }, [id]);

  async function handleBuyNow() {
    if (!user) return navigate('/login');
    if (!confirm(`Commit to buying this for ₹${listing.price.toLocaleString('en-IN')}? This will instantly send a full-price offer to the seller.`)) return;
    setBuying(true);
    try {
      const headers = await authHeader();
      const res = await fetch(`${API}/offers`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...headers },
        body: JSON.stringify({ 
          listing_id: listing.id, 
          offered_price: listing.price, 
          message: 'I want to buy this right now at your asking price!' 
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      toast.success('Purchase request sent! Check your messages.');
      navigate('/messages');
    } catch (err) {
      toast.error(err.message);
    } finally {
      setBuying(false);
    }
  }

  async function fetchListing() {
    setLoading(true);
    const res  = await fetch(`${API}/listings/${id}`);
    const data = await res.json();
    if (res.ok) setListing(data);
    else toast.error('Listing not found');
    setLoading(false);
  }

  async function deleteListing() {
    if (!confirm('Delete this listing?')) return;
    setDeleting(true);
    const headers = await authHeader();
    const res = await fetch(`${API}/listings/${id}`, { method: 'DELETE', headers });
    if (res.ok) { toast.success('Listing deleted'); navigate('/my-listings'); }
    else toast.error('Delete failed');
    setDeleting(false);
  }

  if (loading) return <div className="flex justify-center py-20"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600" /></div>;
  if (!listing) return <div className="text-center py-20 text-gray-500">Listing not found</div>;

  const images   = listing.image_urls || [];
  const isOwner  = user?.id === listing.user_id;
  const seller   = listing.users;

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <div className="grid md:grid-cols-2 gap-10">
        {/* Image gallery */}
        <div>
          <div className="relative bg-gray-100 rounded-2xl overflow-hidden aspect-square">
            {images.length > 0
              ? <img src={images[imgIdx]} alt={listing.title} className="w-full h-full object-cover" />
              : <div className="w-full h-full flex items-center justify-center text-6xl">📦</div>
            }
            {images.length > 1 && (
              <>
                <button onClick={() => setImgIdx(i => (i - 1 + images.length) % images.length)} className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/80 backdrop-blur-sm p-2 rounded-full hover:bg-white shadow transition-colors">
                  <ChevronLeft size={20} />
                </button>
                <button onClick={() => setImgIdx(i => (i + 1) % images.length)} className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/80 backdrop-blur-sm p-2 rounded-full hover:bg-white shadow transition-colors">
                  <ChevronRight size={20} />
                </button>
                <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
                  {images.map((_, i) => <div key={i} className={`h-1.5 rounded-full transition-all ${i === imgIdx ? 'bg-white w-4' : 'bg-white/50 w-1.5'}`} />)}
                </div>
              </>
            )}
          </div>
          {images.length > 1 && (
            <div className="flex gap-2 mt-3 overflow-x-auto pb-1">
              {images.map((url, i) => (
                <button key={i} onClick={() => setImgIdx(i)} className={`shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2 transition-colors ${i === imgIdx ? 'border-green-500' : 'border-transparent'}`}>
                  <img src={url} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Details */}
        <div className="space-y-5">
          <div>
            <div className="flex items-start justify-between gap-3">
              <h1 className="text-2xl font-bold text-gray-900">{listing.title}</h1>
              {isOwner && (
                <div className="flex gap-2 shrink-0">
                  <Link to={`/post?edit=${id}`} className="p-2 hover:bg-gray-100 rounded-lg text-gray-500 transition-colors"><Edit size={18} /></Link>
                  <button onClick={deleteListing} disabled={deleting} className="p-2 hover:bg-red-50 rounded-lg text-red-400 hover:text-red-600 transition-colors"><Trash2 size={18} /></button>
                </div>
              )}
            </div>
            <p className="text-3xl font-bold text-green-700 mt-1">₹{listing.price.toLocaleString('en-IN')}</p>
            {listing.is_negotiable && <span className="text-xs bg-green-50 text-green-700 px-2 py-0.5 rounded-full font-medium">Negotiable</span>}
          </div>

          {/* Meta */}
          <div className="flex flex-wrap gap-3 text-sm">
            <span className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full">{CONDITION_LABELS[listing.condition]}</span>
            {listing.categories && <span className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full">{listing.categories.icon} {listing.categories.name}</span>}
            <span className="flex items-center gap-1 text-gray-500"><Eye size={14} /> {listing.view_count} views</span>
          </div>

          {/* Description */}
          <div>
            <h3 className="font-semibold text-gray-900 mb-1.5">Description</h3>
            <p className="text-gray-600 text-sm leading-relaxed whitespace-pre-line">{listing.description}</p>
          </div>

          {/* Location */}
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <MapPin size={15} className="text-green-600" />
            {listing.college}
          </div>

          {/* Seller card */}
          {seller && (
            <Link to={`/profile/${seller.id}`} className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl border border-gray-200 hover:border-green-300 transition-colors group">
              <div className="w-11 h-11 rounded-full bg-green-100 flex items-center justify-center text-green-700 font-bold text-lg shrink-0">
                {seller.avatar_url
                  ? <img src={seller.avatar_url} className="w-11 h-11 rounded-full object-cover" alt="" />
                  : seller.name?.[0]?.toUpperCase()
                }
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-gray-900 group-hover:text-green-700 transition-colors">{seller.name}</p>
                <p className="text-sm text-gray-500">{seller.college}</p>
              </div>
              <div className="flex items-center gap-1 text-amber-500 shrink-0">
                <Star size={14} fill="currentColor" />
                <span className="text-sm font-medium text-gray-700">{seller.rating?.toFixed(1)} ({seller.rating_count})</span>
              </div>
            </Link>
          )}

          {/* Actions */}
          {!isOwner && listing.status === 'active' && (
            <div className="space-y-3">
              <button
                onClick={handleBuyNow}
                disabled={buying}
                className="w-full bg-green-700 text-white py-3.5 rounded-xl font-bold hover:bg-green-800 transition-colors flex items-center justify-center gap-2 disabled:opacity-70"
              >
                ⚡ Buy Now for ₹{listing.price.toLocaleString('en-IN')}
              </button>
              <button
                onClick={() => user ? setShowOffer(true) : navigate('/login')}
                className="w-full bg-white border-2 border-green-600 text-green-700 py-3.5 rounded-xl font-semibold hover:bg-green-50 transition-colors flex items-center justify-center gap-2"
              >
                <MessageCircle size={20} /> Negotiate Offer
              </button>
              {seller?.whatsapp && (
                <a
                  href={`https://wa.me/${seller.whatsapp}?text=Hi! I'm interested in your listing: ${listing.title}`}
                  target="_blank" rel="noopener noreferrer"
                  className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl border-2 border-gray-200 text-gray-700 font-semibold hover:border-green-400 hover:text-green-700 transition-colors"
                >
                  WhatsApp Seller
                </a>
              )}
            </div>
          )}

          {listing.status === 'reserved' && (
            <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-xl text-sm text-yellow-800 font-medium text-center">
              This item is currently reserved
            </div>
          )}
          {listing.status === 'sold' && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-sm text-red-800 font-medium text-center">
              This item has been sold
            </div>
          )}
        </div>
      </div>

      {showOffer && <OfferModal listing={listing} onClose={() => setShowOffer(false)} onSuccess={() => navigate('/messages')} />}
    </div>
  );
}
