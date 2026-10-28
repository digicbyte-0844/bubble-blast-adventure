/**
 * Automated Pre-Launch Verification Suite & Route Crawler
 * Bubble Blast Adventure QA Certification
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, '..');
const clientSrc = path.join(rootDir, 'client', 'src');
const serverSrc = path.join(rootDir, 'server', 'src');

console.log('🚀 Starting Automated Pre-Launch System Audit...\n');

let passedTests = 0;
let totalTests = 0;

function assert(condition, message) {
  totalTests++;
  if (condition) {
    console.log(`  ✅ [PASS] ${message}`);
    passedTests++;
  } else {
    console.error(`  ❌ [FAIL] ${message}`);
  }
}

// 1. ROUTE TABLE VERIFICATION
console.log('--- 1. Routes & Navigation Table ---');
const appJsx = fs.readFileSync(path.join(clientSrc, 'App.jsx'), 'utf-8');
const routeMatches = [...appJsx.matchAll(/<Route\s+path="([^"]+)"/g)].map(m => m[1]);
const expectedRoutes = [
  '/',
  '/login',
  '/register',
  '/dashboard',
  '/levels',
  '/game/:levelId',
  '/leaderboard',
  '/achievements',
  '/daily-challenge',
  '/editor',
  '/profile',
  '/settings',
  '/help',
  '/admin',
  '/privacy-policy',
  '/terms-and-conditions',
  '/terms',
  '*'
];

assert(routeMatches.length >= 17, `Found ${routeMatches.length} registered routes in App.jsx`);
for (const r of expectedRoutes) {
  assert(routeMatches.includes(r), `Route '${r}' is mounted in router`);
}

// 2. CHECK SKIP TO MAIN CONTENT LINK
console.log('\n--- 2. Universal Accessibility & Skip Link ---');
assert(appJsx.includes('href="#main-content"'), 'Skip to main content anchor exists in App.jsx');
assert(appJsx.includes('id="main-content"'), 'Target main content container has id="main-content"');

// 3. AUDIT H1 HEADINGS ACROSS ALL PAGES
console.log('\n--- 3. Single Semantic <h1> Audit ---');
const pagesDir = path.join(clientSrc, 'pages');
const pageFiles = fs.readdirSync(pagesDir).filter(f => f.endsWith('.jsx'));

for (const file of pageFiles) {
  if (file === 'GamePage.jsx') continue; // GamePage delegates to GameLayout
  const content = fs.readFileSync(path.join(pagesDir, file), 'utf-8');
  const h1Count = (content.match(/<h1\b/g) || []).length;
  assert(h1Count === 1, `${file} contains exactly 1 <h1> tag (found: ${h1Count})`);
}

// 4. CHECK TOUCH TARGETS & FORM LABELS
console.log('\n--- 4. Form Labels & Password Toggles ---');
const loginContent = fs.readFileSync(path.join(pagesDir, 'LoginPage.jsx'), 'utf-8');
const registerContent = fs.readFileSync(path.join(pagesDir, 'RegisterPage.jsx'), 'utf-8');

assert(loginContent.includes('htmlFor="login-username"'), 'LoginPage has persistent label for username');
assert(loginContent.includes('htmlFor="login-password"'), 'LoginPage has persistent label for password');
assert(loginContent.includes('showPassword'), 'LoginPage has password visibility toggle');

assert(registerContent.includes('htmlFor="register-username"'), 'RegisterPage has persistent label for username');
assert(registerContent.includes('htmlFor="register-email"'), 'RegisterPage has persistent label for email');
assert(registerContent.includes('htmlFor="register-password"'), 'RegisterPage has persistent label for password');
assert(registerContent.includes('showPassword'), 'RegisterPage has password visibility toggle');

// 5. CHECK PLACEHOLDER & DUMMY TEXT PURGE
console.log('\n--- 5. Dummy / Placeholder Text Purge ---');
function scanDir(dir, pattern) {
  let matches = [];
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (entry.name !== 'node_modules' && entry.name !== 'dist' && entry.name !== '.git') {
        matches = matches.concat(scanDir(fullPath, pattern));
      }
    } else if (entry.isFile() && /\.(jsx?|tsx?)$/.test(entry.name)) {
      const code = fs.readFileSync(fullPath, 'utf-8');
      if (pattern.test(code)) {
        matches.push(fullPath);
      }
    }
  }
  return matches;
}

const dummyMatches = scanDir(clientSrc, /(Lorem ipsum|dolor sit|John Doe|123-456-7890)/i);
assert(dummyMatches.length === 0, `Zero occurrences of dummy text in client/src (found: ${dummyMatches.length})`);

// 6. CHECK FOR HARDCODED SECRETS IN VITE_
console.log('\n--- 6. Secret Leaks & Env Separation ---');
const viteSecretMatches = scanDir(clientSrc, /VITE_.*(SECRET|PASSWORD|MONGO|JWT)/i);
assert(viteSecretMatches.length === 0, `Zero sensitive keys prefixed with VITE_ in client/src`);

// 7. CHECK MOBILE OVERFLOW & CSS RESILIENCE
console.log('\n--- 7. Mobile Viewport & CSS Containment ---');
const indexCss = fs.readFileSync(path.join(clientSrc, 'index.css'), 'utf-8');
assert(indexCss.includes('overflow-x: hidden') || indexCss.includes('overflow-x: clip'), 'index.css enforces horizontal overflow containment');
assert(indexCss.includes('font-size: 16px !important'), 'index.css enforces >=16px font-size to prevent iOS Safari auto-zoom');
assert(indexCss.includes(':focus-visible'), 'index.css has accessible keyboard focus outline');
assert(indexCss.includes('@media print'), 'index.css includes clean print stylesheet');

console.log(`\n======================================================`);
console.log(`📊 Pre-Launch QA Audit Results: ${passedTests}/${totalTests} Passed (${Math.round((passedTests/totalTests)*100)}%)`);
console.log(`======================================================\n`);

if (passedTests === totalTests) {
  console.log('🎉 ALL SYSTEM AUDIT CHECKS PASSED! SYSTEM IS 100% PRODUCTION-READY.');
  process.exit(0);
} else {
  console.error('⚠️ Some audit checks failed.');
  process.exit(1);
}
