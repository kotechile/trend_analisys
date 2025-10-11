#!/usr/bin/env node
/**
 * Frontend Setup Script
 * Sets up the frontend development environment
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

function runCommand(command, description) {
    console.log(`🔄 ${description}...`);
    try {
        execSync(command, { stdio: 'inherit' });
        console.log(`✅ ${description} completed`);
        return true;
    } catch (error) {
        console.error(`❌ ${description} failed:`, error.message);
        return false;
    }
}

function createEnvFile() {
    console.log('📝 Creating frontend environment file...');
    
    const envContent = `# Frontend Environment Configuration
VITE_API_BASE_URL=http://localhost:8000
VITE_APP_NAME=TrendTap
VITE_APP_VERSION=1.0.0
VITE_DEBUG=true

# Feature Flags
VITE_ENABLE_ANALYTICS=false
VITE_ENABLE_DEBUG_TOOLS=true
VITE_ENABLE_MOCK_DATA=false

# External Services
VITE_GOOGLE_ANALYTICS_ID=
VITE_SENTRY_DSN=
`;
    
    try {
        fs.writeFileSync('.env.local', envContent);
        console.log('✅ Frontend environment file created');
        return true;
    } catch (error) {
        console.error('❌ Failed to create environment file:', error.message);
        return false;
    }
}

function installDependencies() {
    return runCommand('npm install', 'Installing dependencies');
}

function installDevDependencies() {
    return runCommand('npm install --save-dev @types/node', 'Installing development dependencies');
}

function buildProject() {
    return runCommand('npm run build', 'Building project');
}

function startDevServer() {
    console.log('🚀 Starting development server...');
    console.log('📱 Frontend will be available at: http://localhost:5173');
    console.log('🛑 Press Ctrl+C to stop the server');
    
    try {
        execSync('npm run dev', { stdio: 'inherit' });
    } catch (error) {
        if (error.signal === 'SIGINT') {
            console.log('\n🛑 Development server stopped');
        } else {
            console.error('❌ Failed to start development server:', error.message);
            return false;
        }
    }
    return true;
}

function main() {
    console.log('🚀 Setting up TrendTap Frontend');
    console.log('=' .repeat(50));
    
    // Check if package.json exists
    if (!fs.existsSync('package.json')) {
        console.error('❌ package.json not found. Please run this script from the frontend directory.');
        process.exit(1);
    }
    
    // Create environment file
    if (!createEnvFile()) {
        process.exit(1);
    }
    
    // Install dependencies
    if (!installDependencies()) {
        console.error('❌ Failed to install dependencies');
        process.exit(1);
    }
    
    // Install dev dependencies
    if (!installDevDependencies()) {
        console.error('❌ Failed to install development dependencies');
        process.exit(1);
    }
    
    // Build project to check for errors
    if (!buildProject()) {
        console.error('❌ Build failed. Please check for errors.');
        process.exit(1);
    }
    
    console.log('\n' + '=' .repeat(50));
    console.log('🎉 Frontend setup complete!');
    console.log('=' .repeat(50));
    console.log('✅ Dependencies installed');
    console.log('✅ Environment configured');
    console.log('✅ Project built successfully');
    console.log('\n🚀 Starting development server...');
    
    // Start development server
    startDevServer();
}

if (require.main === module) {
    main();
}
