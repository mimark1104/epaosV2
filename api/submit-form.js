// /api/submit-form.js

import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client
// IMPORTANT: Get these from your Supabase project's "API Settings"
// Store them as Environment Variables in Vercel, NOT hard-coded like this for production.
const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_SERVICE_KEY; // Use the SERVICE_ROLE key for server-side
const supabase = createClient(supabaseUrl, supabaseKey);

/**
 * Vercel Serverless Function
 * This function handles POST requests to /api/submit-form
 */
export default async function handler(request, response) {
  // We only want to handle POST requests
  if (request.method !== 'POST') {
    response.setHeader('Allow', ['POST']);
    return response.status(405).json({ error: `Method ${request.method} Not Allowed` });
  }

  const formData = request.body;

  // 1. Data Validation (Basic)
  // You should add more robust validation here
  if (!formData.patient_name || !formData.dob) {
    return response.status(400).json({ error: 'Missing required fields' });
  }

  // 2. Insert data into Supabase
  // 'submissions' is the table name we created in the SQL step
  const { data, error } = await supabase
    .from('submissions')
    .insert([
      {
        patient_name: formData.patient_name,
        dob: formData.dob,
        age: formData.age,
        sex: formData.sex,
        attending_physician: formData.attending_physician,
        healthcare_notes: formData.healthcare_notes,
        length_of_stay: formData.length_of_stay,
        medication_review: formData.medication_review,
        monitoring_hours: formData.monitoring_hours,
        patient_diet: formData.patient_diet,
        clinical_pathways: formData.clinical_pathways, // This should be an array
        prepared_by_signature: formData.prepared_by_signature, // This is the Base64 string
      },
    ])
    .select(); // .select() returns the newly created row

  // 3. Handle Errors
  if (error) {
    console.error('Supabase Error:', error);
    return response.status(500).json({ error: 'Error saving to database', details: error.message });
  }

  // 4. Send Success Response
  // Send back the data that was just created
  return response.status(200).json({ success: true, data: data[0] });
}