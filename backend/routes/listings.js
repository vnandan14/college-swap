const express = require('express');
const router  = express.Router();
const { requireAuth, supabase } = require('../middleware/auth');

// ─── GET /api/listings — browse with filters ─────────────────
router.get('/', async (req, res) => {
  const { category, college, condition, min_price, max_price, q, page = 1, limit = 20 } = req.query;
  const offset = (page - 1) * limit;

  let query = supabase
    .from('listings')
    .select(`*, users!listings_user_id_fkey(id, name, college, avatar_url, rating), categories(name, icon)`)
    .eq('status', 'active')
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1);

  if (category)  query = query.eq('category_id', category);
  if (college)   query = query.eq('college', college);
  if (condition) query = query.eq('condition', condition);
  if (min_price) query = query.gte('price', min_price);
  if (max_price) query = query.lte('price', max_price);
  if (q)         query = query.ilike('title', `%${q}%`);

  const { data, error, count } = await query;
  if (error) return res.status(400).json({ error: error.message });
  res.json({ listings: data, page: +page, limit: +limit });
});

// ─── GET /api/listings/:id — single listing ──────────────────
router.get('/:id', async (req, res) => {
  const { data, error } = await supabase
    .from('listings')
    .select(`*, users!listings_user_id_fkey(id, name, college, avatar_url, rating, rating_count, bio), categories(name, icon)`)
    .eq('id', req.params.id)
    .single();

  if (error) return res.status(404).json({ error: 'Listing not found' });

  // Increment view count
  await supabase.from('listings').update({ view_count: (data.view_count || 0) + 1 }).eq('id', req.params.id);

  res.json(data);
});

// ─── POST /api/listings — create listing ─────────────────────
router.post('/', requireAuth, async (req, res) => {
  const { title, description, price, is_negotiable, category_id, condition, image_urls } = req.body;

  if (!title || !description || !price) {
    return res.status(400).json({ error: 'title, description and price are required' });
  }

  // Get user's college from their profile
  const { data: profile } = await supabase.from('users').select('college').eq('id', req.user.id).single();

  const { data, error } = await supabase.from('listings').insert({
    user_id: req.user.id,
    title, description,
    price: parseFloat(price),
    is_negotiable: is_negotiable ?? true,
    category_id, condition,
    image_urls: image_urls || [],
    college: profile?.college || 'Unknown',
    status: 'active'
  }).select().single();

  if (error) return res.status(400).json({ error: error.message });
  res.status(201).json(data);
});

// ─── PATCH /api/listings/:id — update listing ────────────────
router.patch('/:id', requireAuth, async (req, res) => {
  const allowed = ['title', 'description', 'price', 'is_negotiable', 'category_id', 'condition', 'image_urls', 'status'];
  const updates = {};
  for (const key of allowed) {
    if (req.body[key] !== undefined) updates[key] = req.body[key];
  }

  const { data, error } = await supabase.from('listings')
    .update(updates)
    .eq('id', req.params.id)
    .eq('user_id', req.user.id)   // only owner can update
    .select().single();

  if (error) return res.status(400).json({ error: error.message });
  if (!data)  return res.status(403).json({ error: 'Not authorized or listing not found' });
  res.json(data);
});

// ─── DELETE /api/listings/:id — soft delete ──────────────────
router.delete('/:id', requireAuth, async (req, res) => {
  const { data, error } = await supabase.from('listings')
    .update({ status: 'deleted' })
    .eq('id', req.params.id)
    .eq('user_id', req.user.id)
    .select().single();

  if (error || !data) return res.status(403).json({ error: 'Not authorized or not found' });
  res.json({ message: 'Listing deleted' });
});

// ─── GET /api/listings/user/:userId — user's listings ────────
router.get('/user/:userId', async (req, res) => {
  const { data, error } = await supabase.from('listings')
    .select('*, categories(name, icon)')
    .eq('user_id', req.params.userId)
    .neq('status', 'deleted')
    .order('created_at', { ascending: false });

  if (error) return res.status(400).json({ error: error.message });
  res.json(data);
});

// ─── POST /api/listings/:id/save — save a listing ────────────
router.post('/:id/save', requireAuth, async (req, res) => {
  const { error } = await supabase.from('saved_listings').upsert({ user_id: req.user.id, listing_id: req.params.id });
  if (error) return res.status(400).json({ error: error.message });
  res.json({ saved: true });
});

// ─── DELETE /api/listings/:id/save — unsave ──────────────────
router.delete('/:id/save', requireAuth, async (req, res) => {
  await supabase.from('saved_listings').delete().eq('user_id', req.user.id).eq('listing_id', req.params.id);
  res.json({ saved: false });
});

module.exports = router;
