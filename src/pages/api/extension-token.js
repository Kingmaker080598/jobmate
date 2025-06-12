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
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  
  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    console.log('Extension token request received');
    
    // Get session from cookies/headers
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();

    if (sessionError) {
      console.error('Session error:', sessionError);
      return res.status(500).json({ error: 'Session validation failed' });
    }

    if (!session || !session.user) {
      console.log('No active session found');
      return res.status(401).json({
        error: 'not_authenticated',
        description: 'No active session found',
      });
    }

    console.log('Active session found for user:', session.user.id);

    // Create a token with user ID and expiration (24 hours)
    const tokenData = {
      userId: session.user.id,
      email: session.user.email,
      exp: Date.now() + (24 * 60 * 60 * 1000) // 24 hours
    };

    // Encode token as base64
    const token = Buffer.from(JSON.stringify(tokenData)).toString('base64');

    console.log('Token generated successfully for user:', session.user.id);

    // Return the token
    return res.status(200).json({ 
      token,
      expiresAt: tokenData.exp,
      userId: session.user.id
    });
  } catch (error) {
    console.error('Token generation error:', error);
    return res.status(500).json({ 
      error: 'Failed to generate token',
      details: error.message
    });
  }
}