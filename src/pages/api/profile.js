import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY
);

export default async function handler(req, res) {
  // Set CORS headers
  const origin = req.headers.origin || '*';
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', origin);
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,POST');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  
  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    // Check for token in query parameter (for extension)
    const { token } = req.query;
    let userId = null;

    if (token) {
      // Verify token from query parameter
      try {
        const decoded = JSON.parse(Buffer.from(token, 'base64').toString('utf-8'));
        if (decoded.userId && decoded.exp > Date.now()) {
          userId = decoded.userId;
        } else {
          console.error('Token expired or invalid:', decoded);
        }
      } catch (e) {
        console.error('Token decode error:', e);
      }
    } else {
      // Regular web authentication via session
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        userId = session.user.id;
      }
    }

    if (!userId) {
      return res.status(401).json({
        error: 'not_authenticated',
        description: 'The user does not have an active session or is not authenticated',
      });
    }

    // Get user profile data
    const { data: profile, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', userId)
      .single();

    if (error) {
      console.error('Profile fetch error:', error);
      return res.status(500).json({ error: 'Failed to fetch profile data' });
    }

    // Return the profile data
    return res.status(200).json({
      ...profile,
      authenticated: true
    });
  } catch (error) {
    console.error('Server error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}