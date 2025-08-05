import type { NextApiRequest, NextApiResponse } from 'next';

// Simple authentication - in production, use proper auth system
const VALID_USERS = [
  { email: 'admin@example.com', password: 'admin123', name: 'Admin User' },
  { email: 'user@example.com', password: 'user123', name: 'Test User' }
];

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  // Add CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    console.log('Login request body:', req.body);
    const { email, password } = req.body;

    console.log('Received credentials:', { email, password });

    // Validate credentials
    const user = VALID_USERS.find(u => u.email === email && u.password === password);

    console.log('Found user:', user);

    if (!user) {
      return res.status(401).json({
        success: false,
        error: 'Invalid credentials'
      });
    }

    // Generate simple token (in production, use JWT)
    const token = `token_${user.email}_${Date.now()}`;

    console.log('Login successful for:', user.email);

    res.status(200).json({
      success: true,
      token,
      user: {
        name: user.name,
        email: user.email
      }
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
}
