/**
 * Focused Unit Test for Cache Module (Practical 9)
 * Tests core cache functionality without external network or database dependencies.
 */

const assert = require("assert");
const {
  cache,
  DEFAULT_TTL,
  recordHit,
  recordMiss,
  resetStats,
  getAllTasksKey,
  getSingleTaskKey,
  invalidateAllTasks,
  invalidateSingleTask,
  invalidateOnTaskWrite,
  getStats,
} = require("./cache");

console.log("--- Starting Practical 9 Cache Module Unit Tests ---");

// Test 1: TTL Verification
assert.strictEqual(DEFAULT_TTL, 60, "Default TTL must be 60 seconds");
console.log("✓ Test 1 Passed: Default TTL is 60s");

// Test 2: Stable, Scoped Key Generation
const keyAll = getAllTasksKey("user123");
const keySingle = getSingleTaskKey("user123", 5);
assert.strictEqual(keyAll, "tasks:user:user123:all");
assert.strictEqual(keySingle, "tasks:user:user123:task:5");
console.log("✓ Test 2 Passed: Key generation is stable and user-scoped");

// Test 3: Hit / Miss Metrics & Division-by-Zero Handling
resetStats();
const initialStats = getStats();
assert.strictEqual(initialStats.hits, 0);
assert.strictEqual(initialStats.misses, 0);
assert.strictEqual(initialStats.totalLookups, 0);
assert.strictEqual(initialStats.hitRatio, "0.00%");
assert.strictEqual(initialStats.hitRatioDecimal, 0);
console.log("✓ Test 3 Passed: Initial metrics safe with 0 lookups");

recordMiss();
recordHit();
recordHit();
recordHit();
const updatedStats = getStats();
assert.strictEqual(updatedStats.misses, 1);
assert.strictEqual(updatedStats.hits, 3);
assert.strictEqual(updatedStats.totalLookups, 4);
assert.strictEqual(updatedStats.hitRatio, "75.00%");
assert.strictEqual(updatedStats.hitRatioDecimal, 0.75);
console.log("✓ Test 4 Passed: Hit and miss counters calculate accurately");

// Test 5: Empty Array is a Valid Cache Hit
cache.flushAll();
cache.set(keyAll, [], DEFAULT_TTL);
const cachedEmpty = cache.get(keyAll);
assert.ok(cachedEmpty !== undefined, "Cached value must not be undefined");
assert.ok(Array.isArray(cachedEmpty) && cachedEmpty.length === 0, "Empty array must be preserved");
console.log("✓ Test 5 Passed: Empty array [] is treated as a valid cached value");

// Test 6: Invalidation of All-Tasks on Create / Update
cache.set(getAllTasksKey("userA"), [{ id: 1, title: "Task 1" }], DEFAULT_TTL);
cache.set(getAllTasksKey("userB"), [{ id: 2, title: "Task 2" }], DEFAULT_TTL);
cache.set(getSingleTaskKey("userA", 1), { id: 1, title: "Task 1" }, DEFAULT_TTL);
assert.ok(cache.get(getAllTasksKey("userA")) !== undefined);
assert.ok(cache.get(getAllTasksKey("userB")) !== undefined);
assert.ok(cache.get(getSingleTaskKey("userA", 1)) !== undefined);

invalidateOnTaskWrite(1); // Simulating update or delete of task 1
assert.strictEqual(cache.get(getAllTasksKey("userA")), undefined, "User A list cache should be cleared");
assert.strictEqual(cache.get(getAllTasksKey("userB")), undefined, "User B list cache should be cleared");
assert.strictEqual(cache.get(getSingleTaskKey("userA", 1)), undefined, "Single task 1 cache should be cleared");
console.log("✓ Test 6 Passed: Invalidation on task write clears task lists and specific task cache");

// Clean up
cache.flushAll();
resetStats();

console.log("--- All Cache Module Unit Tests Passed Successfully! ---");
