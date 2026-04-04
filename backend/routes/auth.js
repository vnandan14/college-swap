// ─── routes/auth.js ──────────────────────────────────────────
const express = require('express');
const router  = express.Router();
const { requireAuth, supabase } = require('../middleware/auth');

// Register — create Supabase auth user + profile row
router.post('/register', async (req, res) => {
  const { email, password, name, college } = req.body;
  if (!email || !password || !name || !college)
    return res.status(400).json({ error: 'All fields required' });

  // Create auth user
  const { data: authData, error: authError } = await supabase.auth.admin.createUser({
    email, password, email_confirm: true
  });
  if (authError) return res.status(400).json({ error: authError.message });

  // Create profile
  const { data: profile, error: profileError } = await supabase.from('users').insert({
    id: authData.user.id, email, name, college
  }).select().single();
  if (profileError) return res.status(400).json({ error: profileError.message });

  res.status(201).json({ message: 'Account created. Please check your email to verify.', user: profile });
});

// Get current user's profile
router.get('/me', requireAuth, async (req, res) => {
  const { data, error } = await supabase.from('users').select('*').eq('id', req.user.id).single();
  if (error) return res.status(404).json({ error: 'Profile not found' });
  res.json(data);
});

// Update profile
router.patch('/me', requireAuth, async (req, res) => {
  const allowed = ['name', 'bio', 'avatar_url', 'whatsapp', 'college'];
  const updates = {};
  for (const key of allowed) {
    if (req.body[key] !== undefined) updates[key] = req.body[key];
  }
  const { data, error } = await supabase.from('users').update(updates).eq('id', req.user.id).select().single();
  if (error) return res.status(400).json({ error: error.message });
  res.json(data);
});

// Get public profile
router.get('/profile/:userId', async (req, res) => {
  const { data, error } = await supabase.from('users')
    .select('id, name, college, avatar_url, rating, rating_count, bio, created_at')
    .eq('id', req.params.userId).single();
  if (error) return res.status(404).json({ error: 'User not found' });
  res.json(data);
});

module.exports = router;
