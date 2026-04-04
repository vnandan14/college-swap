// ─── routes/offers.js ────────────────────────────────────────
const express = require('express');
const router  = express.Router();
const { requireAuth, supabase } = require('../middleware/auth');

// Make an offer
router.post('/', requireAuth, async (req, res) => {
  const { listing_id, offered_price, message } = req.body;

  const { data: listing } = await supabase.from('listings').select('user_id, status').eq('id', listing_id).single();
  if (!listing) return res.status(404).json({ error: 'Listing not found' });
  if (listing.status !== 'active') return res.status(400).json({ error: 'Listing is no longer active' });
  if (listing.user_id === req.user.id) return res.status(400).json({ error: 'Cannot offer on your own listing' });

  const { data, error } = await supabase.from('offers').insert({
    listing_id, buyer_id: req.user.id,
    seller_id: listing.user_id,
    offered_price: parseFloat(offered_price),
    message, status: 'pending'
  }).select(`*, listings(title, image_urls, price), buyer:users!offers_buyer_id_fkey(name, avatar_url)`).single();

  if (error) return res.status(400).json({ error: error.message });
  res.status(201).json(data);
});

// Get all offers for current user (as buyer or seller)
router.get('/mine', requireAuth, async (req, res) => {
  const { data, error } = await supabase.from('offers')
    .select(`*, listings(id, title, image_urls, price), buyer:users!offers_buyer_id_fkey(id, name, avatar_url), seller:users!offers_seller_id_fkey(id, name, avatar_url)`)
    .or(`buyer_id.eq.${req.user.id},seller_id.eq.${req.user.id}`)
    .order('created_at', { ascending: false });

  if (error) return res.status(400).json({ error: error.message });
  res.json(data);
});

// Accept / reject / cancel offer (seller or buyer)
router.patch('/:id/status', requireAuth, async (req, res) => {
  const { status } = req.body;
  const allowed = ['accepted', 'rejected', 'cancelled', 'completed'];
  if (!allowed.includes(status)) return res.status(400).json({ error: 'Invalid status' });

  const { data: offer } = await supabase.from('offers').select('*').eq('id', req.params.id).single();
  if (!offer) return res.status(404).json({ error: 'Offer not found' });

  // Only seller can accept/reject, only buyer can cancel
  if (['accepted', 'rejected'].includes(status) && offer.seller_id !== req.user.id)
    return res.status(403).json({ error: 'Only the seller can accept/reject' });
  if (status === 'cancelled' && offer.buyer_id !== req.user.id)
    return res.status(403).json({ error: 'Only the buyer can cancel' });

  const { data, error } = await supabase.from('offers').update({ status }).eq('id', req.params.id).select().single();
  if (error) return res.status(400).json({ error: error.message });

  // If accepted, mark listing as reserved
  if (status === 'accepted') {
    await supabase.from('listings').update({ status: 'reserved' }).eq('id', offer.listing_id);
  }
  res.json(data);
});

// Post a rating after completion
router.post('/:id/rate', requireAuth, async (req, res) => {
  const { score, comment } = req.body;
  const { data: offer } = await supabase.from('offers').select('*').eq('id', req.params.id).eq('status', 'completed').single();
  if (!offer) return res.status(404).json({ error: 'Completed offer not found' });

  const rated_id = req.user.id === offer.buyer_id ? offer.seller_id : offer.buyer_id;
  const { data, error } = await supabase.from('ratings').insert({ offer_id: req.params.id, rater_id: req.user.id, rated_id, score, comment }).select().single();
  if (error) return res.status(400).json({ error: error.message });
  res.status(201).json(data);
});

module.exports = router;
