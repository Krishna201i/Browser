#!/usr/bin/env node

/**
 * Setup script for Kruger Browser Backend
 * Run with: node scripts/setup.js
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.join(__dirname, '..');

console.log('🚀 Setting up Kruger Browser Backend...\n');

// Create necessary directories
const directories = [
  'logs',
  'uploads',
  'temp',
  'backups',
];

directories.forEach(dir => {
  const dirPath = path.join(rootDir, dir);
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
    console.log(`📁 Created directory: ${dir}`);
  } else {
    console.log(`✅ Directory exists: ${dir}`);
  }
});

// Check environment variables
console.log('\n🔧 Checking environment configuration...');

const requiredEnvVars = [
  'JWT_SECRET',
  'NODE_ENV',
  'PORT',
];

const optionalEnvVars = [
  'DB_HOST',
  'DB_PORT', 
  'DB_NAME',
  'DB_USER',
  'DB_PASSWORD',
  'GOOGLE_SEARCH_API_KEY',
  'BING_SEARCH_API_KEY',
];

let envIssues = 0;

requiredEnvVars.forEach(envVar => {
  if (!process.env[envVar]) {
    console.log(`❌ Missing required environment variable: ${envVar}`);
    envIssues++;
  } else {
    console.log(`✅ ${envVar} is set`);
  }
});

optionalEnvVars.forEach(envVar => {
  if (!process.env[envVar]) {
    console.log(`⚠️  Optional environment variable not set: ${envVar}`);
  } else {
    console.log(`✅ ${envVar} is set`);
  }
});

if (envIssues > 0) {
  console.log(`\n❌ Found ${envIssues} environment configuration issues.`);
  console.log('Please check your .env file and ensure all required variables are set.');
} else {
  console.log('\n✅ Environment configuration looks good!');
}

// Check Node.js version
console.log('\n🔍 Checking Node.js version...');
const nodeVersion = process.version;
const majorVersion = parseInt(nodeVersion.slice(1).split('.')[0]);

if (majorVersion >= 18) {
  console.log(`✅ Node.js version ${nodeVersion} is supported`);
} else {
  console.log(`❌ Node.js version ${nodeVersion} is not supported. Please upgrade to Node.js 18 or higher.`);
  envIssues++;
}

// Final status
console.log('\n' + '='.repeat(50));
if (envIssues === 0) {
  console.log('🎉 Setup completed successfully!');
  console.log('🚀 You can now run: npm run dev');
} else {
  console.log(`❌ Setup completed with ${envIssues} issues.`);
  console.log('Please resolve the issues above before running the application.');
}
console.log('='.repeat(50));