import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client
const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_SERVICE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

export default async function handler(request, response) {
  if (request.method !== 'POST') {
    response.setHeader('Allow', ['POST']);
    return response.status(405).json({ error: `Method ${request.method} Not Allowed` });
  }

  const formData = request.body;
  
  // The ID of the submission to update
  const { id, ...updateData } = formData;

  if (!id) {
    return response.status(400).json({ error: 'Submission ID is required' });
  }

  // TODO: Add admin authentication check here

  try {
    // Update the row in Supabase where the 'id' matches
    const { data, error } = await supabase
      .from('submissions')
      .update(updateData) // updateData contains all fields *except* id
      .eq('id', id)
      .select(); // .select() returns the updated row

    if (error) {
      console.error('Supabase Update Error:', error);
      throw error;
    }

    // Send a success response with the updated data
    return response.status(200).json({ success: true, data: data[0] });

  } catch (error) {
    return response.status(500).json({ error: 'Error updating submission', details: error.message });
  }
}