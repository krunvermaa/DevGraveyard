#!/usr/bin/env node
import fs from 'fs';
import path from 'path';
import readline from 'readline';
import { execSync } from 'child_process';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');
const envLocalPath = path.join(rootDir, '.env.local');
const envExamplePath = path.join(rootDir, '.env.example');
const firebasercPath = path.join(rootDir, '.firebaserc');

// Target account
const TARGET_ACCOUNT = 'karan.verma.gj@gmail.com';

function printHeader() {
  console.log('\n======================================================');
  console.log('   DevGraveyard - Firebase Configuration & Binder     ');
  console.log(`   Target Account: ${TARGET_ACCOUNT}                 `);
  console.log('======================================================\n');
}

function parseConfigSnippet(input) {
  // Extract key-value pairs from either JS object, JSON, or env-style text
  const config = {};
  
  // Clean comments and ignore empty values
  const lines = input.split(/\r?\n/);
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#') || trimmed.startsWith('//')) continue;
    
    // Check VITE_ env format: KEY=VALUE
    const envMatch = trimmed.match(/^VITE_FIREBASE_([A-Z_]+)\s*=\s*(.*)$/);
    if (envMatch) {
      const suffix = envMatch[1];
      const val = envMatch[2].trim().replace(/^["']|["']$/g, '');
      if (val) {
        if (suffix === 'API_KEY') config.apiKey = val;
        else if (suffix === 'AUTH_DOMAIN') config.authDomain = val;
        else if (suffix === 'PROJECT_ID') config.projectId = val;
        else if (suffix === 'STORAGE_BUCKET') config.storageBucket = val;
        else if (suffix === 'MESSAGING_SENDER_ID') config.messagingSenderId = val;
        else if (suffix === 'APP_ID') config.appId = val;
        else if (suffix === 'DATABASE_ID') config.databaseId = val;
      }
      continue;
    }

    // Check JS/JSON format: key: "value"
    const propMatch = trimmed.match(/(?:['"]?)([a-zA-Z0-9_]+)(?:['"]?)\s*[:=]\s*["']?([^"',\s]+)["']?,?/);
    if (propMatch) {
      const key = propMatch[1];
      const val = propMatch[2].trim();
      if (val && !['const', 'let', 'var', 'export'].includes(key)) {
        if (/apiKey/i.test(key)) config.apiKey = val;
        else if (/authDomain/i.test(key)) config.authDomain = val;
        else if (/projectId/i.test(key)) config.projectId = val;
        else if (/storageBucket/i.test(key)) config.storageBucket = val;
        else if (/messagingSenderId/i.test(key)) config.messagingSenderId = val;
        else if (/appId/i.test(key)) config.appId = val;
        else if (/databaseId/i.test(key)) config.databaseId = val;
      }
    }
  }

  return config;
}

function updateEnvLocal(config) {
  let existingContent = '';
  if (fs.existsSync(envLocalPath)) {
    existingContent = fs.readFileSync(envLocalPath, 'utf8');
  }

  const keys = {
    VITE_FIREBASE_API_KEY: config.apiKey || '',
    VITE_FIREBASE_AUTH_DOMAIN: config.authDomain || (config.projectId ? `${config.projectId}.firebaseapp.com` : ''),
    VITE_FIREBASE_PROJECT_ID: config.projectId || '',
    VITE_FIREBASE_STORAGE_BUCKET: config.storageBucket || (config.projectId ? `${config.projectId}.firebasestorage.app` : ''),
    VITE_FIREBASE_MESSAGING_SENDER_ID: config.messagingSenderId || '',
    VITE_FIREBASE_APP_ID: config.appId || '',
    VITE_FIREBASE_DATABASE_ID: config.databaseId || '',
  };

  // Preserve existing Gemini API key if present
  const geminiMatch = existingContent.match(/VITE_GEMINI_API_KEY\s*=\s*(.*)/i);
  const geminiKey = (geminiMatch && geminiMatch[1]) ? geminiMatch[1].trim() : '';

  const newContent = [
    '# ==============================================================================',
    '# DevGraveyard Local Environment Variables',
    `# Account: ${TARGET_ACCOUNT}`,
    `# Bound on: ${new Date().toISOString()}`,
    '# ==============================================================================',
    `VITE_FIREBASE_API_KEY=${keys.VITE_FIREBASE_API_KEY}`,
    `VITE_FIREBASE_AUTH_DOMAIN=${keys.VITE_FIREBASE_AUTH_DOMAIN}`,
    `VITE_FIREBASE_PROJECT_ID=${keys.VITE_FIREBASE_PROJECT_ID}`,
    `VITE_FIREBASE_STORAGE_BUCKET=${keys.VITE_FIREBASE_STORAGE_BUCKET}`,
    `VITE_FIREBASE_MESSAGING_SENDER_ID=${keys.VITE_FIREBASE_MESSAGING_SENDER_ID}`,
    `VITE_FIREBASE_APP_ID=${keys.VITE_FIREBASE_APP_ID}`,
    '',
    '# Optional: Leave blank to use default Firestore database "(default)"',
    `VITE_FIREBASE_DATABASE_ID=${keys.VITE_FIREBASE_DATABASE_ID}`,
    '',
    '# Optional: Google AI Studio Gemini API Key for dynamic AI post-mortems',
    `VITE_GEMINI_API_KEY=${geminiKey}`,
    '',
  ].join('\n');

  fs.writeFileSync(envLocalPath, newContent, 'utf8');
  console.log(`✔ Successfully updated .env.local with Project ID: ${keys.VITE_FIREBASE_PROJECT_ID || '(none)'}`);
}

function updateFirebaseRc(projectId) {
  if (!projectId) return;
  const rcData = {
    projects: {
      default: projectId,
    },
  };
  fs.writeFileSync(firebasercPath, JSON.stringify(rcData, null, 2) + '\n', 'utf8');
  console.log(`✔ Successfully updated .firebaserc default project: ${projectId}`);
}

function printStatus() {
  printHeader();
  console.log('Checking current Firebase configuration status...\n');
  
  if (!fs.existsSync(envLocalPath)) {
    console.log('❌ .env.local does not exist.');
    return;
  }

  const content = fs.readFileSync(envLocalPath, 'utf8');
  const config = parseConfigSnippet(content);

  console.log('Current .env.local configuration:');
  console.log(`  Project ID:           ${config.projectId || '(not set)'}`);
  console.log(`  API Key:              ${config.apiKey ? (config.apiKey.slice(0, 8) + '...') : '(not set)'}`);
  console.log(`  Auth Domain:          ${config.authDomain || '(not set)'}`);
  console.log(`  App ID:               ${config.appId || '(not set)'}`);
  console.log(`  Storage Bucket:       ${config.storageBucket || '(not set)'}`);
  console.log(`  Messaging Sender ID:  ${config.messagingSenderId || '(not set)'}`);
  console.log(`  Database ID:          ${config.databaseId || '(default)'}`);

  const isConfigured = Boolean(
    config.apiKey &&
    config.apiKey !== 'YOUR_FIREBASE_API_KEY' &&
    config.projectId &&
    config.projectId !== 'YOUR_FIREBASE_PROJECT_ID'
  );

  console.log('\nStatus: ' + (isConfigured ? '✔ FULLY CONFIGURED & READY' : '⚠️  CREDENTIALS PENDING'));

  if (fs.existsSync(firebasercPath)) {
    try {
      const rc = JSON.parse(fs.readFileSync(firebasercPath, 'utf8'));
      console.log(`\n.firebaserc default project: ${rc?.projects?.default || '(none)'}`);
    } catch {}
  }
}

async function tryFirebaseCliFetch() {
  console.log('Checking Firebase CLI login and available projects...');
  try {
    const listOutput = execSync('npx firebase-tools projects:list --json 2>/dev/null', { encoding: 'utf8' });
    const parsed = JSON.parse(listOutput);
    const projects = parsed.result || parsed || [];
    
    if (Array.isArray(projects) && projects.length > 0) {
      console.log(`Found ${projects.length} Firebase project(s) under current login:`);
      projects.forEach((p, idx) => {
        console.log(`  [${idx + 1}] ${p.projectId} (${p.displayName || p.projectId})`);
      });
      return projects;
    } else {
      console.log('No existing Firebase projects found in CLI list.');
      return [];
    }
  } catch (err) {
    console.log('Firebase CLI check failed or no projects returned.');
    return [];
  }
}

async function main() {
  const args = process.argv.slice(2);

  if (args.includes('--status') || args.includes('-s')) {
    printStatus();
    return;
  }

  printHeader();

  // Check if JSON or string passed via argument
  const rawInputArg = args.find(a => !a.startsWith('-'));
  if (rawInputArg) {
    let input = rawInputArg;
    if (fs.existsSync(rawInputArg)) {
      input = fs.readFileSync(rawInputArg, 'utf8');
    }
    const config = parseConfigSnippet(input);
    if (config.apiKey || config.projectId) {
      updateEnvLocal(config);
      if (config.projectId) updateFirebaseRc(config.projectId);
      console.log('\n✔ Configuration applied successfully!');
      return;
    }
  }

  // Check if individual flags passed: --projectId=xyz --apiKey=abc
  const flagConfig = {};
  for (const arg of args) {
    if (arg.startsWith('--projectId=')) flagConfig.projectId = arg.split('=')[1];
    if (arg.startsWith('--apiKey=')) flagConfig.apiKey = arg.split('=')[1];
    if (arg.startsWith('--authDomain=')) flagConfig.authDomain = arg.split('=')[1];
    if (arg.startsWith('--storageBucket=')) flagConfig.storageBucket = arg.split('=')[1];
    if (arg.startsWith('--messagingSenderId=')) flagConfig.messagingSenderId = arg.split('=')[1];
    if (arg.startsWith('--appId=')) flagConfig.appId = arg.split('=')[1];
    if (arg.startsWith('--databaseId=')) flagConfig.databaseId = arg.split('=')[1];
  }

  if (flagConfig.projectId || flagConfig.apiKey) {
    updateEnvLocal(flagConfig);
    if (flagConfig.projectId) updateFirebaseRc(flagConfig.projectId);
    console.log('\n✔ Configuration applied successfully via flags!');
    return;
  }

  // Interactive mode
  console.log('Instructions:');
  console.log('1. Go to Firebase Console (https://console.firebase.google.com)');
  console.log(`2. Log in with account: ${TARGET_ACCOUNT}`);
  console.log('3. Open your DevGraveyard project -> Project Settings -> General -> Your apps');
  console.log('4. Copy the "firebaseConfig" JavaScript object or values.\n');

  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  console.log('Paste your firebaseConfig snippet or JSON below (press Enter twice or Ctrl+D when done):');
  let pastedLines = [];

  rl.on('line', (line) => {
    if (line.trim() === '' && pastedLines.length > 0 && pastedLines[pastedLines.length - 1].trim() === '') {
      rl.close();
      return;
    }
    pastedLines.push(line);
  });

  rl.on('close', () => {
    const fullInput = pastedLines.join('\n');
    const config = parseConfigSnippet(fullInput);

    if (config.apiKey || config.projectId) {
      updateEnvLocal(config);
      if (config.projectId) updateFirebaseRc(config.projectId);
      console.log('\n✔ Firebase configuration bound successfully to DevGraveyard!');
      console.log('You can now run:');
      console.log('  npm run dev          # Start local dev server');
      console.log('  npm run firebase:status # Check configuration status\n');
    } else {
      console.log('\n⚠️  No valid Firebase config detected in pasted input.');
      console.log('You can also configure manually by editing .env.local directly, or run:');
      console.log('  node scripts/bind-firebase.mjs --projectId=<id> --apiKey=<key> ...\n');
    }
  });
}

main().catch(console.error);
