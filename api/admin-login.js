// /api/admin-login.js

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_SERVICE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

export default async function handler(request, response) {
  if (request.method !== 'POST') {
    return response.status(405).json({ error: 'Method Not Allowed' });
  }

  const { email, password } = request.body;

  if (!email || !password) {
    return response.status(400).json({ error: 'Email and password are required' });
  }

  try {
    // Use Supabase Auth to sign in the user
    const { data, error } = await supabase.auth.signInWithPassword({
      email: email,
      password: password,
    });

    if (error) {
      console.error('Supabase Login Error:', error.message);
      // Send a generic error to avoid giving away info
      return response.status(401).json({ error: 'Invalid credentials' });
    }

    // IMPORTANT: In a real app, you would set an HTTP-only cookie
    // with the user's session token here for security.
    // For this project, we're just confirming the login was successful.

    return response.status(200).json({ success: true, userId: data.user.id });

  } catch (error) {
    console.error('Server Error:', error);
    return response.status(500).json({ error: 'Internal server error' });
  }
}