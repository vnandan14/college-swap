import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { SlidersHorizontal, X } from 'lucide-react';
import ListingCard from '../components/ListingCard';

const API = import.meta.env.VITE_API_URL;

const CATEGORIES = [
  { id: 1, name: 'Books & Notes', icon: '📚' },
  { id: 2, name: 'Electronics',   icon: '💻' },
  { id: 3, name: 'Furniture',     icon: '🪑' },
  { id: 4, name: 'Clothing',      icon: '👕' },
  { id: 5, name: 'Sports',        icon: '🏋️' },
  { id: 6, name: 'Kitchen',       icon: '🍳' },
  { id: 7, name: 'Stationery',    icon: '✏️' },
  { id: 8, name: 'Cycles',        icon: '🚲' },
  { id: 9, name: 'Music',         icon: '🎸' },
  { id: 10, name: 'Other',        icon: '📦' },
];
const CONDITIONS = ['new', 'like_new', 'good', 'fair', 'poor'];

export default function Browse() {
  const [params, setParams] = useSearchParams();
  const [listings,    setListings]    = useState([]);
  const [loading,     setLoading]     = useState(true);
  const [showFilters, setShowFilters] = useState(false);

  const [filters, setFilters] = useState({
    q:         params.get('q') || '',
    category:  params.get('category') || '',
    condition: '',
    min_price: '',
    max_price: '',
    page: 1,
  });

  useEffect(() => { fetchListings(); }, [filters]);

  async function fetchListings() {
    setLoading(true);
    const p = new URLSearchParams();
    Object.entries(filters).forEach(([k, v]) => v && p.set(k, v));
    try {
      const res  = await fetch(`${API}/listings?${p}`);
      const data = await res.json();
      setListings(data.listings || []);
    } finally { setLoading(false); }
  }

  const setFilter = (key, val) => setFilters(f => ({ ...f, [key]: val, page: 1 }));
  const clearFilters = () => setFilters({ q: '', category: '', condition: '', min_price: '', max_price: '', page: 1 });

  const activeFilterCount = [filters.category, filters.condition, filters.min_price, filters.max_price].filter(Boolean).length;

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row gap-6">
        {/* Sidebar filters */}
        <aside className={`md:w-60 shrink-0 ${showFilters ? 'block' : 'hidden md:block'}`}>
          <div className="bg-white rounded-xl border border-gray-200 p-5 sticky top-24 space-y-5">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-gray-900">Filters</h3>
              {activeFilterCount > 0 && (
                <button onClick={clearFilters} className="text-xs text-red-500 hover:text-red-700 flex items-center gap-0.5">
                  <X size={12} /> Clear all
                </button>
              )}
            </div>

            {/* Category */}
            <div>
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Category</p>
              <div className="space-y-1">
                <button onClick={() => setFilter('category', '')} className={`w-full text-left text-sm px-2 py-1.5 rounded-lg transition-colors ${!filters.category ? 'bg-green-50 text-green-700 font-medium' : 'text-gray-700 hover:bg-gray-50'}`}>
                  All categories
                </button>
                {CATEGORIES.map(c => (
                  <button key={c.id} onClick={() => setFilter('category', c.id)} className={`w-full text-left text-sm px-2 py-1.5 rounded-lg flex items-center gap-2 transition-colors ${filters.category == c.id ? 'bg-green-50 text-green-700 font-medium' : 'text-gray-700 hover:bg-gray-50'}`}>
                    <span>{c.icon}</span> {c.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Condition */}
            <div>
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Condition</p>
              <div className="space-y-1">
                {CONDITIONS.map(c => (
                  <button key={c} onClick={() => setFilter('condition', filters.condition === c ? '' : c)} className={`w-full text-left text-sm px-2 py-1.5 rounded-lg capitalize transition-colors ${filters.condition === c ? 'bg-green-50 text-green-700 font-medium' : 'text-gray-700 hover:bg-gray-50'}`}>
                    {c.replace('_', ' ')}
                  </button>
                ))}
              </div>
            </div>

            {/* Price range */}
            <div>
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Price (₹)</p>
              <div className="flex gap-2">
                <input type="number" placeholder="Min" value={filters.min_price} onChange={e => setFilter('min_price', e.target.value)} className="w-full px-2 py-1.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-green-500" />
                <input type="number" placeholder="Max" value={filters.max_price} onChange={e => setFilter('max_price', e.target.value)} className="w-full px-2 py-1.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-green-500" />
              </div>
            </div>
          </div>
        </aside>

        {/* Main content */}
        <div className="flex-1 min-w-0">
          {/* Search bar + mobile filter toggle */}
          <div className="flex gap-3 mb-6">
            <input
              type="text"
              value={filters.q}
              onChange={e => setFilter('q', e.target.value)}
              placeholder="Search items..."
              className="flex-1 px-4 py-2.5 rounded-xl border border-gray-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
            />
            <button
              onClick={() => setShowFilters(f => !f)}
              className={`md:hidden flex items-center gap-1.5 px-3 py-2.5 rounded-xl border text-sm font-medium transition-colors ${showFilters ? 'bg-green-600 text-white border-green-600' : 'border-gray-200 text-gray-700'}`}
            >
              <SlidersHorizontal size={16} />
              Filters {activeFilterCount > 0 && `(${activeFilterCount})`}
            </button>
          </div>

          {/* Results */}
          {loading ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
              {[...Array(8)].map((_, i) => (
                <div key={i} className="bg-white rounded-xl border border-gray-200 overflow-hidden animate-pulse">
                  <div className="aspect-square bg-gray-100" />
                  <div className="p-3 space-y-2">
                    <div className="h-4 bg-gray-100 rounded w-3/4" />
                    <div className="h-4 bg-gray-100 rounded w-1/2" />
                  </div>
                </div>
              ))}
            </div>
          ) : listings.length === 0 ? (
            <div className="text-center py-16 text-gray-500">
              <p className="text-5xl mb-3">🔍</p>
              <p className="font-medium text-gray-700">No items found</p>
              <p className="text-sm mt-1">Try different search terms or clear filters</p>
            </div>
          ) : (
            <>
              <p className="text-sm text-gray-500 mb-4">{listings.length} items found</p>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                {listings.map(l => <ListingCard key={l.id} listing={l} />)}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
