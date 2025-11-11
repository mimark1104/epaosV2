// /api/get-submissions.js

import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client
const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_SERVICE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

export default async function handler(request, response) {
  if (request.method !== 'GET') {
    response.setHeader('Allow', ['GET']);
    return response.status(405).json({ error: `Method ${request.method} Not Allowed` });
  }

  // TODO: Add authentication check here
  // Right now, anyone can call this endpoint.
  // We'll secure this later.

  try {
    // Fetch all submissions from the table
    // Order by 'created_at' so the newest are first
    const { data, error } = await supabase
      .from('submissions')
      .select('*') // Get all columns
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Supabase Error:', error);
      throw error;
    }

    // Send the data back as JSON
    return response.status(200).json({ submissions: data });

  } catch (error) {
    return response.status(500).json({ error: 'Error fetching submissions', details: error.message });
  }
}