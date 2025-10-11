#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

console.log('🚀 Setting up Google OAuth for TrendTap...\n');

// Frontend environment variables
const frontendEnv = `# Supabase Configuration
VITE_SUPABASE_URL=https://bvsqnmkvbbvtrcomtvnc.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJ2c3FubWt2YmJ2dHJjb210dm5jIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTk1MDYyMTQsImV4cCI6MjA3NTA4MjIxNH0.Vg6_r6djVh9vhwP6QNvg3HS5X4AI6Ic3EGp1BlHOeig

# API Configuration
VITE_API_BASE_URL=http://localhost:8000
VITE_APP_NAME=TrendTap
VITE_DEBUG=true`;

// Write frontend .env file
const frontendEnvPath = path.join(__dirname, 'frontend', '.env');
fs.writeFileSync(frontendEnvPath, frontendEnv);
console.log('✅ Created frontend/.env file');

// Update main.tsx to use the authenticated app
const mainTsxPath = path.join(__dirname, 'frontend', 'src', 'main.tsx');
const mainTsxContent = `import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.withAuth'
import './index.css'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)`;

fs.writeFileSync(mainTsxPath, mainTsxContent);
console.log('✅ Updated main.tsx to use authenticated app');

console.log('\n🎉 Google OAuth setup complete!');
console.log('\n📋 Next steps:');
console.log('1. Configure Google OAuth in Supabase Dashboard:');
console.log('   - Go to Authentication → Providers');
console.log('   - Enable Google provider');
console.log('   - Add your Google Client ID and Secret');
console.log('   - Set callback URL: https://bvsqnmkvbbvtrcomtvnc.supabase.co/auth/v1/callback');
console.log('\n2. Start the application:');
console.log('   docker-compose -f docker-compose-local.yml up');
console.log('\n3. Visit http://localhost:3000 and test Google sign-in!');
console.log('\n📖 See docs/GOOGLE_OAUTH_SETUP_COMPLETE.md for detailed instructions');


