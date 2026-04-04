import { Link, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { Search, ArrowRight } from 'lucide-react';

const CATEGORIES = [
  { id: 1, name: 'Books & Notes',        icon: '📚' },
  { id: 2, name: 'Electronics',          icon: '💻' },
  { id: 3, name: 'Furniture',            icon: '🪑' },
  { id: 4, name: 'Clothing',             icon: '👕' },
  { id: 5, name: 'Sports & Fitness',     icon: '🏋️' },
  { id: 6, name: 'Kitchen & Appliances', icon: '🍳' },
  { id: 7, name: 'Stationery',           icon: '✏️' },
  { id: 8, name: 'Cycles & Vehicles',    icon: '🚲' },
  { id: 9, name: 'Musical Instruments',  icon: '🎸' },
  { id: 10, name: 'Other',              icon: '📦' },
];

export default function Home() {
  const [query, setQuery] = useState('');
  const navigate = useNavigate();

  const handleSearch = (e) => {
    e.preventDefault();
    navigate(`/browse?q=${encodeURIComponent(query)}`);
  };

  return (
    <div>
      {/* Hero */}
      <section className="bg-gradient-to-br from-green-700 to-teal-600 text-white py-20 px-4">
        <div className="max-w-3xl mx-auto text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-4 leading-tight">
            Buy, sell & swap with<br />your college community
          </h1>
          <p className="text-green-100 text-lg mb-8">
            Books, electronics, furniture and more — all from students at your college.
          </p>
          <form onSubmit={handleSearch} className="flex gap-2 max-w-xl mx-auto">
            <div className="relative flex-1">
              <Search size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                value={query}
                onChange={e => setQuery(e.target.value)}
                placeholder="Search for items..."
                className="w-full pl-10 pr-4 py-3.5 rounded-xl text-gray-900 focus:outline-none focus:ring-2 focus:ring-white text-sm"
              />
            </div>
            <button type="submit" className="bg-white text-green-700 font-semibold px-6 py-3.5 rounded-xl hover:bg-green-50 transition-colors">
              Search
            </button>
          </form>
        </div>
      </section>

      {/* Categories */}
      <section className="max-w-6xl mx-auto px-4 py-12">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-900">Browse by category</h2>
          <Link to="/browse" className="flex items-center gap-1 text-green-700 text-sm font-medium hover:gap-2 transition-all">
            See all <ArrowRight size={16} />
          </Link>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
          {CATEGORIES.map(cat => (
            <Link
              key={cat.id}
              to={`/browse?category=${cat.id}`}
              className="flex flex-col items-center gap-2 p-4 bg-white rounded-xl border border-gray-200 hover:border-green-400 hover:shadow-sm hover:-translate-y-0.5 transition-all group"
            >
              <span className="text-3xl">{cat.icon}</span>
              <span className="text-xs font-medium text-gray-700 text-center group-hover:text-green-700 transition-colors">{cat.name}</span>
            </Link>
          ))}
        </div>
      </section>

      {/* Stats */}
      <section className="bg-green-50 border-y border-green-100 py-10 px-4">
        <div className="max-w-4xl mx-auto grid grid-cols-3 gap-8 text-center">
          {[
            { value: '10,000+', label: 'Items listed' },
            { value: '5,000+', label: 'Happy students' },
            { value: '200+', label: 'Colleges' },
          ].map(stat => (
            <div key={stat.label}>
              <p className="text-3xl font-bold text-green-700">{stat.value}</p>
              <p className="text-sm text-gray-600 mt-1">{stat.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="max-w-3xl mx-auto px-4 py-16 text-center">
        <h2 className="text-3xl font-bold text-gray-900 mb-3">Have something to sell?</h2>
        <p className="text-gray-600 mb-6">List your item in under 2 minutes and reach thousands of students.</p>
        <Link to="/post" className="inline-flex items-center gap-2 bg-green-600 text-white px-8 py-3.5 rounded-xl font-semibold hover:bg-green-700 transition-colors">
          Post a listing <ArrowRight size={18} />
        </Link>
      </section>
    </div>
  );
}
