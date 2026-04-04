import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ShoppingBag, Plus, MessageCircle, User, LogOut, Search, BookOpen } from 'lucide-react';

export default function Navbar() {
  const { user, profile, logout } = useAuth();
  const navigate = useNavigate();
  const [navQuery, setNavQuery] = useState('');

  const handleNavSearch = (e) => {
    e.preventDefault();
    if (navQuery.trim()) navigate(`/browse?q=${encodeURIComponent(navQuery)}`);
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white border-b border-gray-200 shadow-sm">
      <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2 font-bold text-xl text-green-700">
          <BookOpen size={24} className="text-green-600" />
          CollegeSwap
        </Link>

        {/* Search bar */}
        <div className="hidden md:flex flex-1 max-w-md mx-6">
          <form onSubmit={handleNavSearch} className="relative w-full">
            <button type="submit" className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-green-600 transition-colors">
              <Search size={16} />
            </button>
            <input
              type="text"
              value={navQuery}
              onChange={e => setNavQuery(e.target.value)}
              placeholder="Search books, electronics, furniture..."
              className="w-full pl-9 pr-4 py-2 rounded-lg border border-gray-200 bg-gray-50 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
            />
          </form>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2">
          {user ? (
            <>
              <Link to="/post" className="flex items-center gap-1.5 bg-green-600 text-white px-3 py-2 rounded-lg text-sm font-medium hover:bg-green-700 transition-colors">
                <Plus size={16} /> Sell Item
              </Link>
              <Link to="/messages" className="p-2 text-gray-600 hover:text-green-700 hover:bg-gray-100 rounded-lg transition-colors">
                <MessageCircle size={20} />
              </Link>
              <Link to={`/profile/${user.id}`} className="flex items-center gap-2 p-2 hover:bg-gray-100 rounded-lg transition-colors">
                {profile?.avatar_url
                  ? <img src={profile.avatar_url} className="w-7 h-7 rounded-full object-cover" alt="" />
                  : <div className="w-7 h-7 rounded-full bg-green-100 flex items-center justify-center text-green-700 text-xs font-bold">{profile?.name?.[0]?.toUpperCase()}</div>
                }
              </Link>
              <button onClick={logout} className="p-2 text-gray-500 hover:text-red-500 hover:bg-gray-100 rounded-lg transition-colors">
                <LogOut size={18} />
              </button>
            </>
          ) : (
            <>
              <Link to="/login"    className="px-3 py-2 text-sm text-gray-700 hover:text-green-700 font-medium">Log in</Link>
              <Link to="/register" className="px-3 py-2 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700 transition-colors">Sign up</Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
