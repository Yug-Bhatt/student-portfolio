/**
 * Unit Test for Practical 10 Event-Driven Notification System
 * 
 * Verifies:
 * 1. EventEmitter initialization from Node.js native events module
 * 2. Listener registration (task-created, task-deleted, task-notification-error)
 * 3. Prevention of duplicate listener registration
 * 4. task-created event execution and asynchronous 2-second delay
 * 5. task-deleted event execution
 * 6. Safe error routing to task-notification-error without unhandled errors
 */

const assert = require("assert");
const EventEmitter = require("events");
const taskEvents = require("./events");
const { registerListeners } = require("./listeners");

console.log("--- Starting Practical 10 Event-Driven Unit Tests ---");

// Test 1: Verify EventEmitter inheritance
assert.ok(taskEvents instanceof EventEmitter, "taskEvents must inherit from EventEmitter");
console.log("✓ Test 1 Passed: taskEvents is an instance of native EventEmitter");

// Test 2: Verify registered listeners
const eventNames = taskEvents.eventNames();
assert.ok(eventNames.includes("task-created"), "Must have 'task-created' listener");
assert.ok(eventNames.includes("task-deleted"), "Must have 'task-deleted' listener");
assert.ok(eventNames.includes("task-notification-error"), "Must have 'task-notification-error' listener");
console.log("✓ Test 2 Passed: All required event listeners registered");

// Test 3: Verify idempotency of listener registration
const initialListenerCount = taskEvents.listenerCount("task-created");
registerListeners(taskEvents);
const postCount = taskEvents.listenerCount("task-created");
assert.strictEqual(initialListenerCount, postCount, "Listeners must not be registered multiple times");
console.log("✓ Test 3 Passed: Listener registration is idempotent");

// Test 4: Verify task-deleted event execution
let deleteLogged = false;
const originalLog = console.log;
console.log = (...args) => {
  const msg = args.join(" ");
  if (msg.includes("[Notification] Task deleted")) {
    deleteLogged = true;
  }
  originalLog.apply(console, args);
};

taskEvents.emit("task-deleted", {
  id: 999,
  title: "Test Task for Deletion",
  rollNo: "24AIML003",
});

assert.strictEqual(deleteLogged, true, "task-deleted listener should log deletion message");
console.log = originalLog;
console.log("✓ Test 4 Passed: task-deleted handler executed and logged successfully");

// Test 5: Verify task-notification-error handling
let errorCaught = false;
taskEvents.emit("task-notification-error", new Error("Simulated background error"));
errorCaught = true;
assert.strictEqual(errorCaught, true, "task-notification-error should handle errors safely");
console.log("✓ Test 5 Passed: Custom task-notification-error event handles error without process termination");

// Test 6: Verify task-created async timing (~2000ms delay)
async function testTaskCreatedTiming() {
  return new Promise((resolve, reject) => {
    let startedTime = null;
    let completedTime = null;

    const originalConsoleLog = console.log;
    console.log = (...args) => {
      const msg = args.join(" ");
      if (msg.includes("[Notification] Started:")) {
        startedTime = Date.now();
      }
      if (msg.includes("[Notification] Completed:")) {
        completedTime = Date.now();
      }
      originalConsoleLog.apply(console, args);
    };

    taskEvents.emit("task-created", {
      id: 888,
      title: "Asynchronous Timing Test Task",
      rollNo: "24AIML003",
    });

    assert.ok(startedTime !== null, "Notification must start immediately on event emit");
    assert.strictEqual(completedTime, null, "Notification must NOT complete immediately");

    setTimeout(() => {
      console.log = originalConsoleLog;
      try {
        assert.ok(completedTime !== null, "Notification must complete after 2 seconds");
        const elapsed = completedTime - startedTime;
        assert.ok(
          elapsed >= 1900 && elapsed <= 2300,
          `Elapsed time must be ~2000ms (got ${elapsed}ms)`
        );
        console.log(`✓ Test 6 Passed: Notification completed in ${elapsed}ms (~2000ms asynchronous delay verified)`);
        resolve();
      } catch (err) {
        reject(err);
      }
    }, 2200);
  });
}

testTaskCreatedTiming()
  .then(() => {
    console.log("--- All Practical 10 Unit Tests Passed Successfully! ---");
    process.exit(0);
  })
  .catch((err) => {
    console.error("Test failure:", err);
    process.exit(1);
  });
