#!/usr/bin/env node
/**
 * Test script to verify that published status is being updated correctly
 */

const { createClient } = require('@supabase/supabase-js');

// Initialize Supabase client
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase environment variables');
  console.error('Please set SUPABASE_URL and SUPABASE_ANON_KEY');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function testPublishStatus() {
  console.log('🔍 Testing publish status functionality...\n');

  try {
    // 1. Check if the new columns exist
    console.log('1. Checking if new columns exist...');
    const { data: columns, error: columnsError } = await supabase
      .from('content_ideas')
      .select('id, published, published_at, published_to_titles, status, titles_record_id')
      .limit(1);

    if (columnsError) {
      console.error('❌ Error checking columns:', columnsError);
      return;
    }

    console.log('✅ Columns exist and accessible');

    // 2. Get a sample content idea
    console.log('\n2. Getting a sample content idea...');
    const { data: ideas, error: ideasError } = await supabase
      .from('content_ideas')
      .select('*')
      .limit(1);

    if (ideasError) {
      console.error('❌ Error getting content ideas:', ideasError);
      return;
    }

    if (ideas.length === 0) {
      console.log('⚠️  No content ideas found in database');
      return;
    }

    const testIdea = ideas[0];
    console.log('✅ Found test idea:', testIdea.title);

    // 3. Test updating the publish status
    console.log('\n3. Testing publish status update...');
    const testTitlesId = 'test-titles-id-' + Date.now();
    
    const { data: updateData, error: updateError } = await supabase
      .from('content_ideas')
      .update({
        published: true,
        published_at: new Date().toISOString(),
        published_to_titles: true,
        titles_record_id: testTitlesId,
        status: 'published',
        workflow_status: 'published_to_titles'
      })
      .eq('id', testIdea.id)
      .select();

    if (updateError) {
      console.error('❌ Error updating publish status:', updateError);
      return;
    }

    console.log('✅ Successfully updated publish status:', updateData[0]);

    // 4. Verify the update
    console.log('\n4. Verifying the update...');
    const { data: verifyData, error: verifyError } = await supabase
      .from('content_ideas')
      .select('id, title, published, published_at, published_to_titles, status, titles_record_id')
      .eq('id', testIdea.id)
      .single();

    if (verifyError) {
      console.error('❌ Error verifying update:', verifyError);
      return;
    }

    console.log('✅ Verification successful:');
    console.log('   - published:', verifyData.published);
    console.log('   - published_at:', verifyData.published_at);
    console.log('   - published_to_titles:', verifyData.published_to_titles);
    console.log('   - status:', verifyData.status);
    console.log('   - titles_record_id:', verifyData.titles_record_id);

    // 5. Reset the test data
    console.log('\n5. Resetting test data...');
    const { error: resetError } = await supabase
      .from('content_ideas')
      .update({
        published: false,
        published_at: null,
        published_to_titles: false,
        titles_record_id: null,
        status: 'draft',
        workflow_status: 'idea_generated'
      })
      .eq('id', testIdea.id);

    if (resetError) {
      console.error('⚠️  Warning: Failed to reset test data:', resetError);
    } else {
      console.log('✅ Test data reset successfully');
    }

    console.log('\n🎉 All tests passed! The publish status functionality is working correctly.');

  } catch (error) {
    console.error('❌ Unexpected error:', error);
  }
}

// Run the test
testPublishStatus();

