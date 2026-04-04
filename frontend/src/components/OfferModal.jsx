import { useState } from 'react';
import { X, IndianRupee } from 'lucide-react';
import { supabase, authHeader } from '../lib/supabase';
import toast from 'react-hot-toast';

const API = import.meta.env.VITE_API_URL;

export default function OfferModal({ listing, onClose, onSuccess }) {
  const [price,   setPrice]   = useState(listing.price);
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  async function submit(e) {
    e.preventDefault();
    if (!price || price <= 0) return toast.error('Enter a valid price');
    setLoading(true);
    try {
      const headers = await authHeader();
      const res = await fetch(`${API}/offers`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...headers },
        body: JSON.stringify({ listing_id: listing.id, offered_price: price, message }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      toast.success('Offer sent!');
      onSuccess?.(data);
      onClose();
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-gray-100">
          <h2 className="text-lg font-semibold text-gray-900">Make an Offer</h2>
          <button onClick={onClose} className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors">
            <X size={18} />
          </button>
        </div>

        {/* Listing preview */}
        <div className="p-5 border-b border-gray-100 flex gap-3">
          <div className="w-16 h-16 rounded-lg overflow-hidden bg-gray-100 shrink-0">
            {listing.image_urls?.[0]
              ? <img src={listing.image_urls[0]} className="w-full h-full object-cover" alt="" />
              : <div className="w-full h-full flex items-center justify-center text-2xl">📦</div>
            }
          </div>
          <div>
            <p className="font-medium text-gray-900 text-sm line-clamp-2">{listing.title}</p>
            <p className="text-green-700 font-bold mt-0.5">₹{listing.price.toLocaleString('en-IN')}</p>
            {listing.is_negotiable && <p className="text-xs text-gray-400">Negotiable</p>}
          </div>
        </div>

        <form onSubmit={submit} className="p-5 space-y-4">
          {/* Offer price */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Your Offer Price</label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 font-medium">₹</span>
              <input
                type="number"
                value={price}
                onChange={e => setPrice(e.target.value)}
                min="1"
                className="w-full pl-8 pr-4 py-2.5 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                required
              />
            </div>
            {price < listing.price && (
              <p className="text-xs text-amber-600 mt-1">
                {Math.round((1 - price / listing.price) * 100)}% below asking price
              </p>
            )}
          </div>

          {/* Optional message */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Message (optional)</label>
            <textarea
              value={message}
              onChange={e => setMessage(e.target.value)}
              placeholder="Hi! Is this still available?"
              rows={3}
              className="w-full px-3 py-2.5 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent text-sm resize-none"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-green-600 text-white py-3 rounded-xl font-semibold hover:bg-green-700 disabled:opacity-60 transition-colors"
          >
            {loading ? 'Sending...' : 'Send Offer'}
          </button>
        </form>
      </div>
    </div>
  );
}
