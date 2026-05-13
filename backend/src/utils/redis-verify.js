const { initializeRedis, getRedisClient, closeRedis } = require('../config/redis');
const cache = require('./cache');
const queue = require('./queue');

const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
};

const log = {
  info: (msg) => console.log(`${colors.blue}ℹ${colors.reset}  ${msg}`),
  success: (msg) => console.log(`${colors.green}✓${colors.reset}  ${msg}`),
  error: (msg) => console.log(`${colors.red}✗${colors.reset}  ${msg}`),
  warn: (msg) => console.log(`${colors.yellow}⚠${colors.reset}  ${msg}`),
  test: (msg) => console.log(`\n${colors.cyan}📋 ${msg}${colors.reset}`),
};

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function testConnection() {
  log.test('Testing Redis Connection');
  
  try {
    await initializeRedis();
    const client = getRedisClient();
    const pong = await client.ping();
    
    if (pong === 'PONG') {
      log.success('Connected to Redis');
      return true;
    }
  } catch (error) {
    log.error(`Connection failed: ${error.message}`);
    return false;
  }
}

async function testCacheOperations() {
  log.test('Testing Cache Operations');
  
  try {
    const testData = { id: 1, name: 'Test User', email: 'test@example.com' };
    const key = 'test:user:1';
    
    // Test SET
    const setResult = await cache.set(key, testData, 60);
    if (setResult) {
      log.success(`SET - Cached data with key: ${key}`);
    } else {
      log.error('SET - Failed to cache data');
      return false;
    }

    // Small delay
    await sleep(100);

    // Test GET
    const cachedData = await cache.get(key);
    if (cachedData && cachedData.id === testData.id) {
      log.success(`GET - Retrieved cached data: ${JSON.stringify(cachedData)}`);
    } else {
      log.error('GET - Failed to retrieve cached data');
      return false;
    }

    // Test EXISTS
    const exists = await cache.exists(key);
    if (exists) {
      log.success(`EXISTS - Key exists: ${key}`);
    } else {
      log.error('EXISTS - Key not found');
      return false;
    }

    // Test TTL
    const ttl = await cache.ttl(key);
    if (ttl > 0 && ttl <= 60) {
      log.success(`TTL - Key expires in ${ttl} seconds`);
    } else {
      log.warn(`TTL - Unexpected TTL value: ${ttl}`);
    }

    // Test EXPIRE
    const expireResult = await cache.expire(key, 120);
    if (expireResult) {
      log.success('EXPIRE - Updated key expiration to 120 seconds');
    } else {
      log.warn('EXPIRE - Failed to set expiration');
    }

    // Test DEL
    const delResult = await cache.del(key);
    if (delResult > 0) {
      log.success(`DEL - Deleted key: ${key}`);
    } else {
      log.error('DEL - Failed to delete key');
      return false;
    }

    return true;
  } catch (error) {
    log.error(`Cache operations failed: ${error.message}`);
    return false;
  }
}

async function testPatternOperations() {
  log.test('Testing Pattern-Based Operations');
  
  try {
    // Set multiple keys with pattern
    const keys = ['user:1', 'user:2', 'user:3', 'user:4', 'user:5'];
    
    for (const key of keys) {
      await cache.set(key, { id: key }, 60);
    }
    log.success(`SET - Created ${keys.length} keys with pattern "user:*"`);

    // Test delPattern
    const deletedCount = await cache.delPattern('user:*');
    if (deletedCount > 0) {
      log.success(`DEL PATTERN - Deleted ${deletedCount} keys matching "user:*"`);
    } else {
      log.error('DEL PATTERN - No keys deleted');
      return false;
    }

    return true;
  } catch (error) {
    log.error(`Pattern operations failed: ${error.message}`);
    return false;
  }
}

async function testQueueOperations() {
  log.test('Testing Queue Operations');
  
  try {
    const queueName = 'test-queue';
    
    // Test ENQUEUE
    const tasks = [
      { id: 1, type: 'email', recipient: 'user1@test.com' },
      { id: 2, type: 'notification', userId: 123 },
      { id: 3, type: 'report', reportType: 'daily' },
    ];

    for (const task of tasks) {
      await queue.enqueue(queueName, task);
    }
    log.success(`ENQUEUE - Added ${tasks.length} tasks to queue`);

    // Test QUEUE LENGTH
    const length = await queue.getQueueLength(queueName);
    if (length === tasks.length) {
      log.success(`QUEUE LENGTH - Queue has ${length} items`);
    } else {
      log.error(`QUEUE LENGTH - Expected ${tasks.length}, got ${length}`);
      return false;
    }

    // Test GET QUEUE ITEMS
    const allItems = await queue.getQueueItems(queueName);
    if (allItems.length === tasks.length) {
      log.success(`GET ITEMS - Retrieved ${allItems.length} items from queue`);
    } else {
      log.error(`GET ITEMS - Expected ${tasks.length}, got ${allItems.length}`);
      return false;
    }

    // Test DEQUEUE
    const firstTask = await queue.dequeue(queueName);
    if (firstTask && firstTask.id === 1) {
      log.success(`DEQUEUE - Got task: ${JSON.stringify(firstTask)}`);
    } else {
      log.error('DEQUEUE - Failed to dequeue task');
      return false;
    }

    // Test QUEUE LENGTH after dequeue
    const newLength = await queue.getQueueLength(queueName);
    if (newLength === length - 1) {
      log.success(`QUEUE LENGTH - After dequeue: ${newLength} items`);
    } else {
      log.error(`QUEUE LENGTH - Expected ${length - 1}, got ${newLength}`);
      return false;
    }

    // Test CLEAR QUEUE
    await queue.clearQueue(queueName);
    const finalLength = await queue.getQueueLength(queueName);
    if (finalLength === 0) {
      log.success('CLEAR QUEUE - Queue cleared successfully');
    } else {
      log.error(`CLEAR QUEUE - Expected 0 items, got ${finalLength}`);
      return false;
    }

    return true;
  } catch (error) {
    log.error(`Queue operations failed: ${error.message}`);
    return false;
  }
}

async function testClearAll() {
  log.test('Testing Cache Clear');
  
  try {
    await cache.set('cleanup:test1', { data: 1 });
    await cache.set('cleanup:test2', { data: 2 });
    
    await cache.clear();
    log.success('CLEAR - All cache cleared');
    
    return true;
  } catch (error) {
    log.error(`Clear failed: ${error.message}`);
    return false;
  }
}

async function printRedisInfo() {
  log.test('Redis Server Information');
  
  try {
    const client = getRedisClient();
    const info = await client.info();
    
    // Parse info response
    const lines = info.split('\r\n');
    const sections = {};
    let currentSection = null;
    
    for (const line of lines) {
      if (line.startsWith('#')) {
        currentSection = line.substring(2);
        sections[currentSection] = {};
      } else if (line && !line.startsWith('#')) {
        const [key, value] = line.split(':');
        if (key && value && currentSection) {
          sections[currentSection][key] = value;
        }
      }
    }

    // Print key info
    if (sections.Server) {
      console.log(`${colors.cyan}Server:${colors.reset}`);
      console.log(`  Redis Version: ${sections.Server.redis_version}`);
      console.log(`  Port: ${sections.Server.tcp_port}`);
      console.log(`  Uptime: ${sections.Server.uptime_in_seconds}s`);
    }

    if (sections.Clients) {
      console.log(`${colors.cyan}Clients:${colors.reset}`);
      console.log(`  Connected Clients: ${sections.Clients.connected_clients}`);
    }

    if (sections.Memory) {
      console.log(`${colors.cyan}Memory:${colors.reset}`);
      console.log(`  Used Memory: ${sections.Memory.used_memory_human}`);
      console.log(`  Max Memory: ${sections.Memory.maxmemory_human || 'Unlimited'}`);
    }

    if (sections.Stats) {
      console.log(`${colors.cyan}Stats:${colors.reset}`);
      console.log(`  Total Commands: ${sections.Stats.total_commands_processed}`);
      console.log(`  Commands/sec: ${sections.Stats.instantaneous_ops_per_sec}`);
    }

    if (sections.Keyspace) {
      console.log(`${colors.cyan}Keyspace:${colors.reset}`);
      for (const [key, value] of Object.entries(sections.Keyspace)) {
        if (key.startsWith('db')) {
          console.log(`  ${key}: ${value}`);
        }
      }
    }

    log.success('Retrieved server information');
    return true;
  } catch (error) {
    log.error(`Failed to get server info: ${error.message}`);
    return false;
  }
}

async function runAllTests() {
  console.log(`\n${colors.cyan}╔════════════════════════════════════════╗${colors.reset}`);
  console.log(`${colors.cyan}║  Redis Verification Test Suite         ║${colors.reset}`);
  console.log(`${colors.cyan}╚════════════════════════════════════════╝${colors.reset}\n`);

  const tests = [
    { name: 'Connection', fn: testConnection },
    { name: 'Cache Operations', fn: testCacheOperations },
    { name: 'Pattern Operations', fn: testPatternOperations },
    { name: 'Queue Operations', fn: testQueueOperations },
    { name: 'Clear All', fn: testClearAll },
    { name: 'Server Info', fn: printRedisInfo },
  ];

  const results = [];

  for (const test of tests) {
    try {
      const result = await test.fn();
      results.push({ name: test.name, passed: result });
    } catch (error) {
      log.error(`Unexpected error in ${test.name}: ${error.message}`);
      results.push({ name: test.name, passed: false });
    }
  }

  // Summary
  console.log(`\n${colors.cyan}╔════════════════════════════════════════╗${colors.reset}`);
  console.log(`${colors.cyan}║  Test Summary                          ║${colors.reset}`);
  console.log(`${colors.cyan}╚════════════════════════════════════════╝${colors.reset}\n`);

  const passed = results.filter((r) => r.passed).length;
  const total = results.length;

  for (const result of results) {
    const status = result.passed ? `${colors.green}PASS${colors.reset}` : `${colors.red}FAIL${colors.reset}`;
    console.log(`${status}  ${result.name}`);
  }

  console.log(`\n${passed}/${total} tests passed`);

  if (passed === total) {
    console.log(`${colors.green}✓ All tests passed!${colors.reset}\n`);
  } else {
    console.log(`${colors.red}✗ Some tests failed${colors.reset}\n`);
  }

  await closeRedis();
  process.exit(passed === total ? 0 : 1);
}

// Run tests
runAllTests().catch((error) => {
  log.error(`Fatal error: ${error.message}`);
  closeRedis().then(() => process.exit(1));
});
