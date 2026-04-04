import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Star, MapPin, Calendar, Edit2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { authHeader, uploadImage } from '../lib/supabase';
import ListingCard from '../components/ListingCard';
import toast from 'react-hot-toast';

const API = import.meta.env.VITE_API_URL;

export default function Profile() {
  const { id }      = useParams();
  const { user, profile: myProfile, refreshProfile } = useAuth();
  const [profile,   setProfile]   = useState(null);
  const [listings,  setListings]  = useState([]);
  const [loading,   setLoading]   = useState(true);
  const [editing,   setEditing]   = useState(false);
  const [editForm,  setEditForm]  = useState({});

  const isMe = user?.id === id;

  useEffect(() => { load(); }, [id]);

  async function load() {
    setLoading(true);
    const [pRes, lRes] = await Promise.all([
      fetch(`${API}/auth/profile/${id}`),
      fetch(`${API}/listings/user/${id}`),
    ]);
    if (pRes.ok) { const p = await pRes.json(); setProfile(p); setEditForm({ name: p.name, bio: p.bio || '', whatsapp: p.whatsapp || '' }); }
    if (lRes.ok) setListings(await lRes.json());
    setLoading(false);
  }

  async function saveProfile(e) {
    e.preventDefault();
    const headers = await authHeader();
    const res  = await fetch(`${API}/auth/me`, { method: 'PATCH', headers: { 'Content-Type': 'application/json', ...headers }, body: JSON.stringify(editForm) });
    const data = await res.json();
    if (res.ok) { setProfile(p => ({ ...p, ...data })); setEditing(false); toast.success('Profile updated'); refreshProfile?.(); }
    else toast.error(data.error);
  }

  async function uploadAvatar(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const url = await uploadImage(file, 'avatars');
      const headers = await authHeader();
      await fetch(`${API}/auth/me`, { method: 'PATCH', headers: { 'Content-Type': 'application/json', ...headers }, body: JSON.stringify({ avatar_url: url }) });
      setProfile(p => ({ ...p, avatar_url: url }));
      toast.success('Avatar updated');
      refreshProfile?.();
    } catch (err) { toast.error('Upload failed'); }
  }

  if (loading) return <div className="flex justify-center py-20"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600" /></div>;
  if (!profile) return <div className="text-center py-20 text-gray-500">User not found</div>;

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Profile header */}
      <div className="bg-white rounded-2xl border border-gray-200 p-6 mb-6">
        <div className="flex gap-5 items-start">
          {/* Avatar */}
          <div className="relative shrink-0">
            <div className="w-20 h-20 rounded-2xl overflow-hidden bg-green-100 flex items-center justify-center text-green-700 text-3xl font-bold">
              {profile.avatar_url
                ? <img src={profile.avatar_url} className="w-full h-full object-cover" alt="" />
                : profile.name?.[0]?.toUpperCase()
              }
            </div>
            {isMe && (
              <label className="absolute -bottom-1 -right-1 bg-white border border-gray-200 rounded-full p-1 cursor-pointer hover:bg-gray-50 shadow-sm">
                <Edit2 size={12} className="text-gray-500" />
                <input type="file" accept="image/*" className="hidden" onChange={uploadAvatar} />
              </label>
            )}
          </div>

          <div className="flex-1 min-w-0">
            {editing ? (
              <form onSubmit={saveProfile} className="space-y-3">
                <input value={editForm.name} onChange={e => setEditForm(f => ({ ...f, name: e.target.value }))} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500" placeholder="Name" />
                <textarea value={editForm.bio} onChange={e => setEditForm(f => ({ ...f, bio: e.target.value }))} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500 resize-none" placeholder="Bio" rows={2} />
                <input value={editForm.whatsapp} onChange={e => setEditForm(f => ({ ...f, whatsapp: e.target.value }))} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500" placeholder="WhatsApp number (with country code)" />
                <div className="flex gap-2">
                  <button type="submit" className="px-4 py-1.5 bg-green-600 text-white text-sm font-medium rounded-lg hover:bg-green-700 transition-colors">Save</button>
                  <button type="button" onClick={() => setEditing(false)} className="px-4 py-1.5 bg-gray-100 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-200 transition-colors">Cancel</button>
                </div>
              </form>
            ) : (
              <>
                <div className="flex items-center justify-between gap-2">
                  <h1 className="text-xl font-bold text-gray-900">{profile.name}</h1>
                  {isMe && (
                    <button onClick={() => setEditing(true)} className="flex items-center gap-1 text-xs text-gray-500 hover:text-green-700 transition-colors px-2 py-1 hover:bg-gray-100 rounded-lg">
                      <Edit2 size={13} /> Edit
                    </button>
                  )}
                </div>
                {profile.bio && <p className="text-gray-600 text-sm mt-1">{profile.bio}</p>}
                <div className="flex flex-wrap gap-4 mt-3 text-sm text-gray-500">
                  <span className="flex items-center gap-1"><MapPin size={14} className="text-green-600" /> {profile.college}</span>
                  <span className="flex items-center gap-1"><Star size={14} className="text-amber-500" fill="currentColor" /> {profile.rating?.toFixed(1)} ({profile.rating_count} ratings)</span>
                  <span className="flex items-center gap-1"><Calendar size={14} /> Joined {new Date(profile.created_at).toLocaleDateString('en-IN', { month: 'long', year: 'numeric' })}</span>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Listings */}
      <h2 className="text-lg font-bold text-gray-900 mb-4">{isMe ? 'My Listings' : `${profile.name}'s Listings`} ({listings.length})</h2>
      {listings.length === 0
        ? <p className="text-gray-500 text-sm">No active listings.</p>
        : <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {listings.map(l => <ListingCard key={l.id} listing={l} />)}
          </div>
      }
    </div>
  );
}
