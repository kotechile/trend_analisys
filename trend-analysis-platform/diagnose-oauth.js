#!/usr/bin/env node

const https = require('https');

console.log('🔍 Diagnosing Google OAuth Configuration...\n');

// Test Supabase configuration
const options = {
  hostname: 'bvsqnmkvbbvtrcomtvnc.supabase.co',
  port: 443,
  path: '/auth/v1/settings',
  method: 'GET',
  headers: {
    'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJ2c3FubWt2YmJ2dHJjb210dm5jIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTk1MDYyMTQsImV4cCI6MjA3NTA4MjIxNH0.Vg6_r6djVh9vhwP6QNvg3HS5X4AI6Ic3EGp1BlHOeig'
  }
};

const req = https.request(options, (res) => {
  let data = '';
  
  res.on('data', (chunk) => {
    data += chunk;
  });
  
  res.on('end', () => {
    try {
      const config = JSON.parse(data);
      console.log('📊 Supabase Configuration:');
      console.log('   Status:', res.statusCode);
      console.log('   Google Enabled:', config.external?.google || 'Not found');
      
      if (config.external?.google) {
        const google = config.external.google;
        console.log('   Google Details:');
        console.log('     - Enabled:', google.enabled);
        console.log('     - Client ID:', google.client_id ? 'Set (' + google.client_id.substring(0, 20) + '...)' : 'Not Set');
        console.log('     - Redirect URI:', google.redirect_uri || 'Not Set');
        
        if (google.enabled && google.client_id) {
          console.log('\n🎉 Google OAuth appears to be properly configured!');
          console.log('\n✅ Next Steps:');
          console.log('1. Open http://localhost:3000 in your browser');
          console.log('2. Look for the "Continue with Google" button');
          console.log('3. Click it to test the OAuth flow');
          console.log('4. Complete the Google authentication');
          console.log('5. You should be redirected back to TrendTap dashboard');
        } else {
          console.log('\n⚠️  Google OAuth configuration incomplete:');
          if (!google.enabled) console.log('   - Google provider is not enabled');
          if (!google.client_id) console.log('   - Client ID is not set');
          if (!google.redirect_uri) console.log('   - Redirect URI is not set');
          
          console.log('\n🔧 To fix:');
          console.log('1. Go to Supabase Dashboard → Authentication → Providers');
          console.log('2. Enable Google provider');
          console.log('3. Add your Google Client ID and Secret');
          console.log('4. Set callback URL: https://bvsqnmkvbbvtrcomtvnc.supabase.co/auth/v1/callback');
        }
      } else {
        console.log('\n❌ Google OAuth configuration not found in Supabase');
      }
    } catch (error) {
      console.log('❌ Error parsing Supabase response:', error.message);
      console.log('Raw response:', data);
    }
  });
});

req.on('error', (error) => {
  console.log('❌ Error connecting to Supabase:', error.message);
});

req.end();


