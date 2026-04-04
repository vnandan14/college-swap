import { useEffect, useState } from 'react';
import { authHeader } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';
import ChatWindow from '../components/ChatWindow';
import { CheckCircle, XCircle, Clock } from 'lucide-react';
import toast from 'react-hot-toast';

const API = import.meta.env.VITE_API_URL;

const STATUS_CONFIG = {
  pending:   { label: 'Pending',   icon: Clock,        color: 'text-amber-600  bg-amber-50  border-amber-200' },
  accepted:  { label: 'Accepted',  icon: CheckCircle,  color: 'text-green-600  bg-green-50  border-green-200' },
  rejected:  { label: 'Rejected',  icon: XCircle,      color: 'text-red-600    bg-red-50    border-red-200'   },
  cancelled: { label: 'Cancelled', icon: XCircle,      color: 'text-gray-500   bg-gray-50   border-gray-200'  },
  completed: { label: 'Completed', icon: CheckCircle,  color: 'text-blue-600   bg-blue-50   border-blue-200'  },
};

export default function Messages() {
  const { user } = useAuth();
  const [offers,       setOffers]       = useState([]);
  const [activeOffer,  setActiveOffer]  = useState(null);
  const [loading,      setLoading]      = useState(true);

  useEffect(() => { loadOffers(); }, []);

  async function loadOffers() {
    setLoading(true);
    const headers = await authHeader();
    const res  = await fetch(`${API}/offers/mine`, { headers });
    const data = await res.json();
    if (res.ok) { setOffers(data); if (data.length > 0) setActiveOffer(data[0]); }
    setLoading(false);
  }

  async function updateOfferStatus(offerId, status) {
    const headers = await authHeader();
    const res  = await fetch(`${API}/offers/${offerId}/status`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', ...headers },
      body: JSON.stringify({ status }),
    });
    const data = await res.json();
    if (res.ok) {
      toast.success(`Offer ${status}`);
      setOffers(prev => prev.map(o => o.id === offerId ? { ...o, ...data } : o));
      if (activeOffer?.id === offerId) setActiveOffer(prev => ({ ...prev, ...data }));
    } else toast.error(data.error);
  }

  const isSeller = (offer) => offer.seller_id === user?.id;

  if (loading) return <div className="flex justify-center py-20"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600" /></div>;

  if (offers.length === 0) return (
    <div className="max-w-lg mx-auto px-4 py-20 text-center">
      <p className="text-5xl mb-3">💬</p>
      <p className="text-xl font-semibold text-gray-900">No messages yet</p>
      <p className="text-gray-500 mt-2">When you make or receive an offer, your chats will appear here.</p>
    </div>
  );

  return (
    <div className="max-w-5xl mx-auto px-4 py-6">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Messages</h1>
      <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden" style={{ height: '70vh' }}>
        <div className="flex h-full">
          {/* Offer list */}
          <div className="w-full md:w-72 border-r border-gray-200 overflow-y-auto shrink-0">
            {offers.map(offer => {
              const listing = offer.listings;
              const other   = isSeller(offer) ? offer.buyer : offer.seller;
              const cfg     = STATUS_CONFIG[offer.status];
              const StatusIcon = cfg.icon;
              const isActive = activeOffer?.id === offer.id;

              return (
                <button key={offer.id} onClick={() => setActiveOffer(offer)}
                  className={`w-full text-left p-4 border-b border-gray-100 hover:bg-gray-50 transition-colors ${isActive ? 'bg-green-50 border-l-2 border-l-green-500' : ''}`}
                >
                  <div className="flex gap-3 items-start">
                    <div className="w-10 h-10 rounded-lg overflow-hidden bg-gray-100 shrink-0">
                      {listing?.image_urls?.[0]
                        ? <img src={listing.image_urls[0]} className="w-full h-full object-cover" alt="" />
                        : <div className="w-full h-full flex items-center justify-center text-lg">📦</div>
                      }
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">{listing?.title}</p>
                      <p className="text-xs text-gray-500 mt-0.5">{isSeller(offer) ? `Buyer: ${other?.name}` : `Seller: ${other?.name}`}</p>
                      <div className={`inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full border mt-1 ${cfg.color}`}>
                        <StatusIcon size={10} /> {cfg.label}
                      </div>
                    </div>
                    <p className="text-sm font-bold text-green-700 shrink-0">₹{offer.offered_price?.toLocaleString('en-IN')}</p>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Chat panel */}
          {activeOffer ? (
            <div className="flex-1 flex flex-col min-w-0">
              {/* Offer header */}
              <div className="p-4 border-b border-gray-200 bg-gray-50">
                <div className="flex items-center justify-between flex-wrap gap-3">
                  <div>
                    <p className="font-semibold text-gray-900 text-sm">{activeOffer.listings?.title}</p>
                    <p className="text-xs text-gray-500 mt-0.5">
                      Offered: <span className="text-green-700 font-bold">₹{activeOffer.offered_price?.toLocaleString('en-IN')}</span>
                      {' · '}Listed at ₹{activeOffer.listings?.price?.toLocaleString('en-IN')}
                    </p>
                  </div>

                  {/* Seller actions */}
                  {isSeller(activeOffer) && activeOffer.status === 'pending' && (
                    <div className="flex gap-2">
                      <button onClick={() => updateOfferStatus(activeOffer.id, 'accepted')} className="px-3 py-1.5 bg-green-600 text-white text-xs font-semibold rounded-lg hover:bg-green-700 transition-colors">Accept</button>
                      <button onClick={() => updateOfferStatus(activeOffer.id, 'rejected')} className="px-3 py-1.5 bg-white border border-red-300 text-red-600 text-xs font-semibold rounded-lg hover:bg-red-50 transition-colors">Reject</button>
                    </div>
                  )}
                  {/* Buyer cancel */}
                  {!isSeller(activeOffer) && activeOffer.status === 'pending' && (
                    <button onClick={() => updateOfferStatus(activeOffer.id, 'cancelled')} className="px-3 py-1.5 bg-white border border-gray-300 text-gray-600 text-xs font-semibold rounded-lg hover:bg-gray-50 transition-colors">Cancel Offer</button>
                  )}
                  {/* Mark complete (seller, accepted) */}
                  {isSeller(activeOffer) && activeOffer.status === 'accepted' && (
                    <button onClick={() => updateOfferStatus(activeOffer.id, 'completed')} className="px-3 py-1.5 bg-blue-600 text-white text-xs font-semibold rounded-lg hover:bg-blue-700 transition-colors">Mark as Sold</button>
                  )}
                </div>
              </div>

              <ChatWindow offer={activeOffer} />
            </div>
          ) : (
            <div className="flex-1 flex items-center justify-center text-gray-400 text-sm">
              Select a conversation
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
