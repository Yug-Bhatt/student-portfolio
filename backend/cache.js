/**
 * Shared In-Memory Cache Module (Practical 9)
 * 
 * Implements server-side in-memory caching using node-cache.
 * Configured with a default TTL of 60 seconds.
 * 
 * Provides:
 * - Thread/process-local cache instance
 * - Stable, user-scoped cache keys for user isolation & security
 * - Application-level hit / miss tracking counters
 * - Centralized invalidation on write (POST, PUT, DELETE)
 * - Safe statistics formatting with division-by-zero protection
 */

const NodeCache = require("node-cache");

// Default Time-To-Live: 60 seconds as per Practical 9 requirements
const DEFAULT_TTL = 60;

// Initialize node-cache with automatic expiration check interval
const cache = new NodeCache({
  stdTTL: DEFAULT_TTL,
  checkperiod: 120, // Check for expired keys every 120 seconds
  useClones: true,  // Prevent in-memory mutation of cached references
});

// Application-level performance metric counters
let hits = 0;
let misses = 0;

/**
 * Increment cache hit counter
 */
function recordHit() {
  hits++;
}

/**
 * Increment cache miss counter
 */
function recordMiss() {
  misses++;
}

/**
 * Reset metric counters (primarily used during automated test suites)
 */
function resetStats() {
  hits = 0;
  misses = 0;
}

/**
 * Generate a stable, user-scoped key for the all-tasks collection.
 * Scoping by authenticated user guarantees cross-user isolation.
 *
 * @param {string} userId - Authenticated user identifier
 * @returns {string} - Cache key (e.g., 'tasks:user:660a...:all')
 */
function getAllTasksKey(userId) {
  const safeId = userId || "default";
  return `tasks:user:${safeId}:all`;
}

/**
 * Generate a stable, user-scoped key for an individual task.
 *
 * @param {string} userId - Authenticated user identifier
 * @param {number|string} taskId - Numeric or string task ID
 * @returns {string} - Cache key (e.g., 'tasks:user:660a...:task:1')
 */
function getSingleTaskKey(userId, taskId) {
  const safeId = userId || "default";
  return `tasks:user:${safeId}:task:${taskId}`;
}

/**
 * Invalidate all cached task lists across all users.
 * Required when any task is created, updated, or deleted so task lists remain fresh.
 */
function invalidateAllTasks() {
  const keys = cache.keys();
  const taskListKeys = keys.filter(
    (key) => key.startsWith("tasks:") && key.endsWith(":all")
  );
  if (taskListKeys.length > 0) {
    cache.del(taskListKeys);
  }
}

/**
 * Invalidate single-task cache entries for a specific task ID.
 *
 * @param {number|string} taskId - The ID of the affected task
 */
function invalidateSingleTask(taskId) {
  if (taskId === undefined || taskId === null) return;
  const targetSuffix = `:task:${taskId}`;
  const keys = cache.keys();
  const taskKeys = keys.filter((key) => key.endsWith(targetSuffix));
  if (taskKeys.length > 0) {
    cache.del(taskKeys);
  }
}

/**
 * Centralized invalidation function triggered ONLY after successful DB writes.
 * Ensures stale tasks cannot be served after create, update, or delete.
 *
 * @param {number|string} [taskId] - The task ID affected (if known)
 */
function invalidateOnTaskWrite(taskId) {
  invalidateAllTasks();
  if (taskId !== undefined && taskId !== null) {
    invalidateSingleTask(taskId);
  }
}

/**
 * Retrieve cache diagnostic metrics.
 * Safely handles division by zero when no requests have occurred yet.
 * Exposes non-sensitive performance indicators only.
 *
 * @returns {object} - Safe metric payload
 */
function getStats() {
  const total = hits + misses;
  const hitRatio =
    total === 0 ? "0.00%" : `${((hits / total) * 100).toFixed(2)}%`;
  const hitRatioDecimal =
    total === 0 ? 0 : parseFloat((hits / total).toFixed(4));

  return {
    hits,
    misses,
    totalLookups: total,
    hitRatio,
    hitRatioDecimal,
    currentKeyCount: cache.keys().length,
    ttlSeconds: DEFAULT_TTL,
  };
}

module.exports = {
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
};
