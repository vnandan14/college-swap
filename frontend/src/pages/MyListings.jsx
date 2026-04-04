// ─── MyListings.jsx ──────────────────────────────────────────
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Eye, Edit, Trash2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { authHeader } from '../lib/supabase';
import toast from 'react-hot-toast';

const API = import.meta.env.VITE_API_URL;
const STATUS_COLOR = { active: 'bg-green-100 text-green-700', reserved: 'bg-yellow-100 text-yellow-700', sold: 'bg-blue-100 text-blue-700', deleted: 'bg-gray-100 text-gray-500' };

export default function MyListings() {
  const { user }   = useAuth();
  const [listings, setListings] = useState([]);
  const [loading,  setLoading]  = useState(true);

  useEffect(() => { if (user) load(); }, [user]);

  async function load() {
    const res  = await fetch(`${API}/listings/user/${user.id}`);
    const data = await res.json();
    if (res.ok) setListings(data);
    setLoading(false);
  }

  async function deleteItem(id) {
    if (!confirm('Delete this listing?')) return;
    const headers = await authHeader();
    const res = await fetch(`${API}/listings/${id}`, { method: 'DELETE', headers });
    if (res.ok) { toast.success('Deleted'); setListings(prev => prev.filter(l => l.id !== id)); }
    else toast.error('Delete failed');
  }

  if (loading) return <div className="flex justify-center py-20"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600" /></div>;

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">My Listings</h1>
        <Link to="/post" className="flex items-center gap-1.5 bg-green-600 text-white px-4 py-2 rounded-xl text-sm font-medium hover:bg-green-700 transition-colors">
          <Plus size={16} /> New listing
        </Link>
      </div>

      {listings.length === 0 ? (
        <div className="text-center py-16 text-gray-500">
          <p className="text-5xl mb-3">📦</p>
          <p className="text-lg font-medium text-gray-700">No listings yet</p>
          <Link to="/post" className="mt-4 inline-block bg-green-600 text-white px-6 py-2.5 rounded-xl text-sm font-medium hover:bg-green-700 transition-colors">Post your first item</Link>
        </div>
      ) : (
        <div className="space-y-3">
          {listings.map(l => (
            <div key={l.id} className="bg-white rounded-xl border border-gray-200 p-4 flex gap-4 hover:shadow-sm transition-shadow">
              <div className="w-16 h-16 rounded-lg overflow-hidden bg-gray-100 shrink-0">
                {l.image_urls?.[0]
                  ? <img src={l.image_urls[0]} className="w-full h-full object-cover" alt="" />
                  : <div className="w-full h-full flex items-center justify-center text-2xl">{l.categories?.icon || '📦'}</div>
                }
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2">
                  <Link to={`/listing/${l.id}`} className="font-semibold text-gray-900 hover:text-green-700 transition-colors truncate">{l.title}</Link>
                  <span className={`text-xs font-medium px-2 py-0.5 rounded-full shrink-0 capitalize ${STATUS_COLOR[l.status]}`}>{l.status}</span>
                </div>
                <p className="text-green-700 font-bold text-sm mt-0.5">₹{l.price.toLocaleString('en-IN')}</p>
                <div className="flex items-center gap-1 text-xs text-gray-400 mt-1">
                  <Eye size={11} /> {l.view_count || 0} views ·{' '}
                  {new Date(l.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                </div>
              </div>
              <div className="flex items-center gap-1 shrink-0">
                <Link to={`/post?edit=${l.id}`} className="p-2 hover:bg-gray-100 rounded-lg text-gray-500 transition-colors"><Edit size={16} /></Link>
                <button onClick={() => deleteItem(l.id)} className="p-2 hover:bg-red-50 rounded-lg text-gray-400 hover:text-red-500 transition-colors"><Trash2 size={16} /></button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
