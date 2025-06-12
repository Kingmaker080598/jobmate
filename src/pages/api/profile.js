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

    console.log('Profile API called with token:', token ? 'present' : 'missing');

    if (token) {
      // Verify token from query parameter
      try {
        // Decode the base64 token
        let decodedToken;
        try {
          decodedToken = JSON.parse(Buffer.from(token, 'base64').toString('utf-8'));
        } catch (decodeError) {
          // Try with padding
          const paddedToken = token.padEnd(token.length + (4 - (token.length % 4)) % 4, '=');
          decodedToken = JSON.parse(Buffer.from(paddedToken, 'base64').toString('utf-8'));
        }
        
        console.log('Decoded token:', { userId: decodedToken.userId, hasExp: !!decodedToken.exp });
        
        if (decodedToken.userId && decodedToken.exp > Date.now()) {
          userId = decodedToken.userId;
          console.log('Valid userId from token:', userId);
        } else {
          console.error('Token expired or invalid:', { exp: decodedToken.exp, now: Date.now() });
          return res.status(401).json({ error: 'Token expired or invalid' });
        }
      } catch (e) {
        console.error('Token decode error:', e.message);
        return res.status(400).json({ error: 'Invalid token format', details: e.message });
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

    console.log('Fetching profile for user ID:', userId);

    // Fetch user data from users table
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('*')
      .eq('id', userId)
      .single();
    
    if (userError && userError.code !== 'PGRST116') {
      console.error('User fetch error:', userError);
    }
    
    // Fetch detailed profile from application_profile table
    const { data: profile, error: profileError } = await supabase
      .from('application_profile')
      .select('*')
      .eq('user_id', userId)
      .single();
    
    if (profileError && profileError.code !== 'PGRST116') {
      console.error('Profile fetch error:', profileError);
    }

    // Combine the data from both tables
    const combinedProfile = {
      ...(user || {}),
      ...(profile || {}),
      authenticated: true,
      user_id: userId // Ensure user_id is always present for extension
    };

    // Ensure we have at least basic user data
    if (!user && !profile) {
      return res.status(404).json({ 
        error: 'Profile not found',
        suggestion: 'Please complete your profile setup in JobMate'
      });
    }

    console.log('Profile fetch successful:', {
      hasUser: !!user,
      hasProfile: !!profile,
      combinedKeys: Object.keys(combinedProfile)
    });

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