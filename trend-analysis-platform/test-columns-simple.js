#!/usr/bin/env node
/**
 * Simple test to check if the published columns exist
 */

const { createClient } = require('@supabase/supabase-js');

// Use the correct Supabase project from frontend
const supabaseUrl = 'https://dgcsqiaciyqvprtpopxg.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRnY3NxaWFjaXlxdnBydHBvcHhnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MTU0NzU5OTMsImV4cCI6MjAzMTA1MTk5M30.wXVY743o8sX2waD03EenpvTjAdmrwT4eEt6lgWIMaC0';

const supabase = createClient(supabaseUrl, supabaseKey);

async function testColumns() {
  console.log('🔍 Testing if published columns exist...\n');
  console.log('Supabase URL:', supabaseUrl);
  console.log('Using anon key (first 20 chars):', supabaseKey.substring(0, 20) + '...');

  try {
    // Try to select just the published columns
    const { data, error } = await supabase
      .from('content_ideas')
      .select('id, published, published_at, published_to_titles, status')
      .limit(1);

    if (error) {
      console.log('❌ Error:', error.message);
      console.log('Error code:', error.code);
      console.log('Error details:', error.details);
      console.log('Error hint:', error.hint);
    } else {
      console.log('✅ Success! Published columns exist');
      console.log('Data:', data);
      console.log('Columns found:', Object.keys(data[0] || {}));
    }
  } catch (err) {
    console.log('❌ Unexpected error:', err.message);
  }
}

testColumns();





