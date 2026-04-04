// ─── routes/messages.js ──────────────────────────────────────
const express = require('express');
const router  = express.Router();
const { requireAuth, supabase } = require('../middleware/auth');

// Get all messages for an offer thread
router.get('/offer/:offerId', requireAuth, async (req, res) => {
  // Verify user is part of the offer
  const { data: offer } = await supabase.from('offers')
    .select('buyer_id, seller_id')
    .eq('id', req.params.offerId)
    .single();

  if (!offer || ![offer.buyer_id, offer.seller_id].includes(req.user.id))
    return res.status(403).json({ error: 'Not authorized' });

  const { data, error } = await supabase.from('messages')
    .select('*, sender:users!messages_sender_id_fkey(id, name, avatar_url)')
    .eq('offer_id', req.params.offerId)
    .order('sent_at', { ascending: true });

  // Mark messages as read
  await supabase.from('messages').update({ is_read: true })
    .eq('offer_id', req.params.offerId)
    .neq('sender_id', req.user.id);

  if (error) return res.status(400).json({ error: error.message });
  res.json(data);
});

// Send a message in an offer thread
router.post('/offer/:offerId', requireAuth, async (req, res) => {
  const { body } = req.body;
  if (!body?.trim()) return res.status(400).json({ error: 'Message cannot be empty' });

  const { data: offer } = await supabase.from('offers')
    .select('buyer_id, seller_id, status')
    .eq('id', req.params.offerId)
    .single();

  if (!offer || ![offer.buyer_id, offer.seller_id].includes(req.user.id))
    return res.status(403).json({ error: 'Not authorized' });
  if (['cancelled', 'rejected', 'completed'].includes(offer.status))
    return res.status(400).json({ error: 'Cannot message on a closed offer' });

  const { data, error } = await supabase.from('messages').insert({
    offer_id: req.params.offerId,
    sender_id: req.user.id,
    body: body.trim()
  }).select('*, sender:users!messages_sender_id_fkey(id, name, avatar_url)').single();

  if (error) return res.status(400).json({ error: error.message });
  res.status(201).json(data);
});

// Get unread message count
router.get('/unread-count', requireAuth, async (req, res) => {
  const { count } = await supabase.from('messages')
    .select('*', { count: 'exact', head: true })
    .eq('is_read', false)
    .neq('sender_id', req.user.id);
  res.json({ count: count || 0 });
});

module.exports = router;
