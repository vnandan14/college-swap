const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

async function requireAuth(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'No token provided' });
  }
  const token = authHeader.split(' ')[1];
  const { data: { user }, error } = await supabase.auth.getUser(token);
  if (error || !user) {
    const errMsg = error ? error.message : (!user ? 'No user found in response' : 'Unknown token error');
    return res.status(401).json({ 
      error: `Auth Failed: ${errMsg} (Check Railway ENV: URL starts with ${process.env.SUPABASE_URL ? process.env.SUPABASE_URL.substring(0,5) : 'NULL'})` 
    });
  }
  req.user = user;
  req.supabase = supabase;
  next();
}

module.exports = { requireAuth, supabase };
