import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { authHeader } from '../lib/supabase';
import ImageUpload from '../components/ImageUpload';
import toast from 'react-hot-toast';

const API = import.meta.env.VITE_API_URL;

const CATEGORIES = [
  { id: 1, name: 'Books & Notes', icon: '📚' },
  { id: 2, name: 'Electronics',   icon: '💻' },
  { id: 3, name: 'Furniture',     icon: '🪑' },
  { id: 4, name: 'Clothing',      icon: '👕' },
  { id: 5, name: 'Sports & Fitness', icon: '🏋️' },
  { id: 6, name: 'Kitchen & Appliances', icon: '🍳' },
  { id: 7, name: 'Stationery',    icon: '✏️' },
  { id: 8, name: 'Cycles & Vehicles', icon: '🚲' },
  { id: 9, name: 'Musical Instruments', icon: '🎸' },
  { id: 10, name: 'Other',        icon: '📦' },
];

const CONDITIONS = [
  { value: 'new',      label: 'New',       desc: 'Never used, original packaging' },
  { value: 'like_new', label: 'Like New',  desc: 'Used once or twice, no marks' },
  { value: 'good',     label: 'Good',      desc: 'Minor wear, works perfectly' },
  { value: 'fair',     label: 'Fair',      desc: 'Visible wear, fully functional' },
  { value: 'poor',     label: 'Poor',      desc: 'Heavy use, functional with flaws' },
];

export default function PostListing() {
  const navigate = useNavigate();
  const [loading,   setLoading]   = useState(false);
  const [images,    setImages]    = useState([]);
  const [form, setForm] = useState({
    title: '', description: '', price: '', is_negotiable: true,
    category_id: '', condition: 'good',
  });

  const set = (key, val) => setForm(f => ({ ...f, [key]: val }));

  async function handleSubmit(e) {
    e.preventDefault();
    if (!form.title || !form.price || !form.category_id) {
      toast.error('Please fill in all required fields'); return;
    }
    setLoading(true);
    try {
      const headers = await authHeader();
      const res = await fetch(`${API}/listings`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...headers },
        body: JSON.stringify({ ...form, price: parseFloat(form.price), image_urls: images }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      toast.success('Listing posted!');
      navigate(`/listing/${data.id}`);
    } catch (err) { toast.error(err.message); }
    finally { setLoading(false); }
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-10">
      <h1 className="text-2xl font-bold text-gray-900 mb-8">Post a Listing</h1>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Photos */}
        <div>
          <label className="block font-semibold text-gray-900 mb-2">Photos</label>
          <p className="text-sm text-gray-500 mb-3">Add up to 5 photos. First photo is the cover.</p>
          <ImageUpload images={images} setImages={setImages} />
        </div>

        {/* Title */}
        <div>
          <label className="block font-semibold text-gray-900 mb-1.5">Title <span className="text-red-500">*</span></label>
          <input
            type="text" value={form.title} onChange={e => set('title', e.target.value)}
            placeholder="e.g. Engineering Mathematics Textbook (3rd Year)"
            className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-green-500 text-sm"
            maxLength={100} required
          />
          <p className="text-xs text-gray-400 mt-1">{form.title.length}/100</p>
        </div>

        {/* Category */}
        <div>
          <label className="block font-semibold text-gray-900 mb-2">Category <span className="text-red-500">*</span></label>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {CATEGORIES.map(c => (
              <button type="button" key={c.id} onClick={() => set('category_id', c.id)}
                className={`flex items-center gap-2 px-3 py-2.5 rounded-xl border text-sm transition-colors
                  ${form.category_id == c.id ? 'border-green-500 bg-green-50 text-green-700 font-medium' : 'border-gray-200 text-gray-700 hover:border-green-300'}`}>
                <span>{c.icon}</span> {c.name}
              </button>
            ))}
          </div>
        </div>

        {/* Condition */}
        <div>
          <label className="block font-semibold text-gray-900 mb-2">Condition <span className="text-red-500">*</span></label>
          <div className="space-y-2">
            {CONDITIONS.map(c => (
              <label key={c.value} className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-colors
                ${form.condition === c.value ? 'border-green-500 bg-green-50' : 'border-gray-200 hover:border-green-300'}`}>
                <input type="radio" name="condition" value={c.value} checked={form.condition === c.value} onChange={() => set('condition', c.value)} className="accent-green-600" />
                <div>
                  <p className="text-sm font-medium text-gray-900">{c.label}</p>
                  <p className="text-xs text-gray-500">{c.desc}</p>
                </div>
              </label>
            ))}
          </div>
        </div>

        {/* Price */}
        <div>
          <label className="block font-semibold text-gray-900 mb-1.5">Price <span className="text-red-500">*</span></label>
          <div className="flex gap-3">
            <div className="relative flex-1">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 font-medium">₹</span>
              <input type="number" value={form.price} onChange={e => set('price', e.target.value)}
                placeholder="0" min="1" className="w-full pl-8 pr-4 py-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-green-500 text-sm" required />
            </div>
            <label className="flex items-center gap-2 cursor-pointer bg-white border border-gray-200 px-4 rounded-xl hover:border-green-300 transition-colors">
              <input type="checkbox" checked={form.is_negotiable} onChange={e => set('is_negotiable', e.target.checked)} className="accent-green-600 w-4 h-4" />
              <span className="text-sm text-gray-700">Negotiable</span>
            </label>
          </div>
        </div>

        {/* Description */}
        <div>
          <label className="block font-semibold text-gray-900 mb-1.5">Description <span className="text-red-500">*</span></label>
          <textarea value={form.description} onChange={e => set('description', e.target.value)}
            placeholder="Describe your item — edition, year, any damage, reason for selling..."
            rows={5} maxLength={1000} required
            className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-green-500 text-sm resize-none"
          />
          <p className="text-xs text-gray-400 mt-1">{form.description.length}/1000</p>
        </div>

        <button type="submit" disabled={loading}
          className="w-full bg-green-600 text-white py-4 rounded-xl font-bold text-base hover:bg-green-700 disabled:opacity-60 transition-colors">
          {loading ? 'Posting...' : 'Post Listing'}
        </button>
      </form>
    </div>
  );
}
