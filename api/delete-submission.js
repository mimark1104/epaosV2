import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client
const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_SERVICE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

export default async function handler(request, response) {
  // We only want to handle DELETE requests
  // Note: Vercel converts DELETE requests with query params,
  // but we'll also allow POST for flexibility.
  if (request.method !== 'DELETE' && request.method !== 'POST') {
    response.setHeader('Allow', ['DELETE', 'POST']);
    return response.status(405).json({ error: `Method ${request.method} Not Allowed` });
  }

  // Get the ID from the query string (e.g., /api/delete-submission?id=...)
  // Or from the body if it's a POST
  const { id } = request.method === 'DELETE' ? request.query : request.body;

  if (!id) {
    return response.status(400).json({ error: 'Submission ID is required' });
  }

  // TODO: Add admin authentication check here

  try {
    // Delete the row from Supabase where the 'id' matches
    const { error } = await supabase
      .from('submissions')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Supabase Delete Error:', error);
      throw error;
    }

    // Send a success response
    return response.status(200).json({ success: true, message: 'Submission deleted' });

  } catch (error) {
    return response.status(500).json({ error: 'Error deleting submission', details: error.message });
  }
}