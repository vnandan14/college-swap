import { useEffect, useRef, useState } from 'react';
import { Send } from 'lucide-react';
import { authHeader, supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

const API = import.meta.env.VITE_API_URL;

export default function ChatWindow({ offer }) {
  const { user } = useAuth();
  const [messages, setMessages]   = useState([]);
  const [body,     setBody]       = useState('');
  const [loading,  setLoading]    = useState(false);
  const [sending,  setSending]    = useState(false);
  const bottomRef = useRef(null);

  useEffect(() => { loadMessages(); }, [offer.id]);

  // Real-time subscription via Supabase
  useEffect(() => {
    const channel = supabase
      .channel(`offer-${offer.id}`)
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'messages', filter: `offer_id=eq.${offer.id}` },
        payload => {
          setMessages(prev => {
            if (prev.find(m => m.id === payload.new.id)) return prev;
            return [...prev, payload.new];
          });
          bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
        }
      )
      .subscribe();
    return () => supabase.removeChannel(channel);
  }, [offer.id]);

  async function loadMessages() {
    setLoading(true);
    try {
      const headers = await authHeader();
      const res = await fetch(`${API}/messages/offer/${offer.id}`, { headers });
      const data = await res.json();
      if (res.ok) { setMessages(data); setTimeout(() => bottomRef.current?.scrollIntoView(), 100); }
    } finally { setLoading(false); }
  }

  async function send(e) {
    e.preventDefault();
    if (!body.trim()) return;
    setSending(true);
    try {
      const headers = await authHeader();
      const res = await fetch(`${API}/messages/offer/${offer.id}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...headers },
        body: JSON.stringify({ body }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setMessages(prev => prev.find(m => m.id === data.id) ? prev : [...prev, data]);
      setBody('');
      bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    } catch (err) { toast.error(err.message); }
    finally { setSending(false); }
  }

  const isMine = (msg) => msg.sender_id === user?.id;

  return (
    <div className="flex flex-col h-full">
      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {loading && <p className="text-center text-gray-400 text-sm">Loading messages...</p>}
        {!loading && messages.length === 0 && (
          <p className="text-center text-gray-400 text-sm mt-8">No messages yet. Say hello!</p>
        )}
        {messages.map(msg => (
          <div key={msg.id} className={`flex ${isMine(msg) ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[75%] rounded-2xl px-4 py-2.5 text-sm
              ${isMine(msg)
                ? 'bg-green-600 text-white rounded-br-sm'
                : 'bg-gray-100 text-gray-900 rounded-bl-sm'
              }`}>
              <p>{msg.body}</p>
              <p className={`text-xs mt-0.5 ${isMine(msg) ? 'text-green-200' : 'text-gray-400'}`}>
                {new Date(msg.sent_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </p>
            </div>
          </div>
        ))}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <form onSubmit={send} className="border-t border-gray-200 p-3 flex gap-2">
        <input
          type="text"
          value={body}
          onChange={e => setBody(e.target.value)}
          placeholder="Type a message..."
          className="flex-1 px-4 py-2.5 rounded-xl border border-gray-200 bg-gray-50 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
          disabled={sending}
        />
        <button
          type="submit"
          disabled={sending || !body.trim()}
          className="bg-green-600 text-white p-2.5 rounded-xl hover:bg-green-700 disabled:opacity-50 transition-colors"
        >
          <Send size={18} />
        </button>
      </form>
    </div>
  );
}
