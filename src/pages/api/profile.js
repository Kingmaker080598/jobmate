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
        console.log('Decoded token:', decoded); // Add logging
        
        if (decoded.userId && decoded.exp > Date.now()) {
          userId = decoded.userId;
        } else {
          console.error('Token expired or invalid:', decoded);
          return res.status(401).json({ error: 'Token expired or invalid' });
        }
      } catch (e) {
        console.error('Token decode error:', e);
        return res.status(400).json({ error: 'Invalid token format' });
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

    console.log('Fetching profile for user ID:', userId); // Add logging

    // First, get basic user info from the users table
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('*')
      .eq('id', userId)
      .single();

    if (userError) {
      console.error('User fetch error:', userError);
      // Continue anyway, as we might still have application profile data
    }

    // Then, get detailed profile from application_profile table
    const { data: profile, error: profileError } = await supabase
      .from('application_profile')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (profileError && profileError.code !== 'PGRST116') { // PGRST116 is "no rows returned"
      console.error('Profile fetch error:', profileError);
      
      // If both queries failed, return an error
      if (userError) {
        return res.status(500).json({ 
          error: 'Failed to fetch user data',
          details: userError.message,
          code: userError.code
        });
      }
    }

    // Combine the data from both tables
    const combinedProfile = {
      ...(user || {}),
      ...(profile || {}),
      authenticated: true
    };

    // If we have no data at all, return an error
    if (Object.keys(combinedProfile).length <= 1) { // Only has 'authenticated' property
      return res.status(404).json({ error: 'Profile not found' });
    }

    // Return the combined profile data
    return res.status(200).json(combinedProfile);
  } catch (error) {
    console.error('Server error:', error);
    return res.status(500).json({ 
      error: 'Internal server error',
      details: error.message
    });
  }
}