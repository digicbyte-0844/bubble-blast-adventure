/**
 * Backend API & Anti-Cheat Validation Suite
 */

import http from 'http';

const BASE_URL = process.env.API_URL || 'http://localhost:5000';

async function request(method, path, body = null, token = null) {
  return new Promise((resolve, reject) => {
    const url = new URL(path, BASE_URL);
    const options = {
      method,
      hostname: url.hostname,
      port: url.port,
      path: url.pathname + url.search,
      headers: {
        'Content-Type': 'application/json'
      }
    };
    if (token) {
      options.headers['Authorization'] = `Bearer ${token}`;
    }

    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => (data += chunk));
      res.on('end', () => {
        try {
          const parsed = JSON.parse(data);
          resolve({ status: res.statusCode, body: parsed });
        } catch (e) {
          resolve({ status: res.statusCode, raw: data });
        }
      });
    });

    req.on('error', reject);
    if (body) {
      req.write(JSON.stringify(body));
    }
    req.end();
  });
}

async function runTests() {
  console.log('🧪 Starting Backend API & Anti-Cheat Suite...');
  const results = [];

  const assert = (name, condition, extra = '') => {
    if (condition) {
      console.log(`  ✅ [PASS] ${name}`);
      results.push({ name, passed: true });
    } else {
      console.error(`  ❌ [FAIL] ${name} ${extra}`);
      results.push({ name, passed: false, extra });
      process.exitCode = 1;
    }
  };

  try {
    // 1. Health check
    const health = await request('GET', '/api/health');
    assert('Health Check (200 OK)', health.status === 200 && health.body.status === 'ONLINE');

    // 2. Register
    const testUsername = `AstralTester_${Date.now()}`;
    const regRes = await request('POST', '/api/auth/register', {
      name: testUsername,
      email: `${testUsername.toLowerCase()}@testgalaxy.io`,
      password: 'SecureSecretPassword123!'
    });
    assert('Auth Register (201 Created)', regRes.status === 201 && regRes.body.token);
    const authToken = regRes.body.token;

    // 3. Login
    const loginRes = await request('POST', '/api/auth/login', {
      email: `${testUsername.toLowerCase()}@testgalaxy.io`,
      password: 'SecureSecretPassword123!'
    });
    assert('Auth Login (200 OK)', loginRes.status === 200 && loginRes.body.token);

    // 4. Levels catalog
    const levelsRes = await request('GET', '/api/levels', null, authToken);
    assert('Levels Catalog (200 OK, 40 handcrafted levels)', levelsRes.status === 200 && levelsRes.body.data.levels.length >= 40);

    // 5. Anti-Cheat: Session Token & Validation
    const startRes = await request('POST', '/api/games/start', { levelId: 1 }, authToken);
    assert('Start Session Token Generated (200 OK)', startRes.status === 200 && startRes.body.sessionToken);

    // 6. Anti-Cheat: Speedrun Rejection
    const fastComplete = await request('POST', '/api/games/complete', {
      sessionToken: startRes.body.sessionToken,
      levelId: 1,
      shotsUsed: 5,
      bubblesPopped: 15,
      score: 3000,
      completed: true,
      elapsedDurationMs: 500 // Sub-second impossible run
    }, authToken);
    assert('Anti-Cheat: Speedrun Rejection (<3.5s -> 400)', fastComplete.status === 400 && fastComplete.body.error === 'ANTI_CHEAT_VIOLATION');

    // 7. Global Leaderboard
    const lbRes = await request('GET', '/api/leaderboard?type=global&limit=10', null, authToken);
    assert('Global Leaderboard Projection (200 OK)', lbRes.status === 200 && Array.isArray(lbRes.body.leaderboard));

    // 8. Achievements
    const achRes = await request('GET', '/api/achievements/me', null, authToken);
    assert('Personal Achievements Status (200 OK)', achRes.status === 200 && Array.isArray(achRes.body.achievements));

    // 9. Visual Level Editor Save
    const saveLvl = await request('POST', '/api/editor/save', {
      name: 'Custom Astral Sector',
      objective: { type: 'CLEAR_ALL', target: 0 },
      maxShots: 25,
      palette: ['CYAN', 'MAGENTA', 'GOLD'],
      matrix: [['CYAN', 'MAGENTA'], ['GOLD', 'CYAN']]
    }, authToken);
    assert('Visual Level Editor Save (201 Created)', saveLvl.status === 201 && saveLvl.body.data.customId);

    console.log(`\n📊 Backend Tests Completed: ${results.filter(r => r.passed).length}/${results.length} passed`);
  } catch (err) {
    console.error('💥 Test suite error:', err.message);
    process.exitCode = 1;
  }
}

runTests();
