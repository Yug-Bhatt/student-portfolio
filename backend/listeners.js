/**
 * Event Listeners Module (Practical 10)
 * 
 * Registers event listeners on the shared TaskEvents emitter.
 * Implements decoupled, non-blocking notification handling with:
 * - task-created (simulating a 2-second asynchronous processing delay)
 * - task-deleted (immediate notification on task deletion)
 * - task-notification-error (safe custom error handling preventing server crash)
 */

const taskEvents = require("./events");

let listenersRegistered = false;

function registerListeners(events = taskEvents) {
  if (listenersRegistered) {
    return events;
  }
  listenersRegistered = true;

  // 1. Task Created Listener (Simulating non-blocking 2-second notification)
  events.on("task-created", (task) => {
    try {
      const startedAt = new Date().toISOString();
      console.log(`[Notification] Started: ${startedAt}`);
      console.log(`[Notification] Task: ${task.title}`);
      console.log(`[Notification] Assigned user: ${task.rollNo || "24AIML003"}`);

      setTimeout(() => {
        try {
          const completedAt = new Date().toISOString();
          console.log(`[Notification] Completed: ${completedAt}`);
        } catch (asyncErr) {
          events.emit("task-notification-error", asyncErr);
        }
      }, 2000);
    } catch (syncErr) {
      events.emit("task-notification-error", syncErr);
    }
  });

  // 2. Task Deleted Listener
  events.on("task-deleted", (task) => {
    try {
      const timestamp = new Date().toISOString();
      console.log(`[Notification] Task deleted at ${timestamp}`);
      console.log(`[Notification] Deleted Task: ${task.title} (ID: ${task.id})`);
    } catch (syncErr) {
      events.emit("task-notification-error", syncErr);
    }
  });

  // 3. Custom Error Listener for Background Notification Failures
  events.on("task-notification-error", (err) => {
    const timestamp = new Date().toISOString();
    const safeMessage = err && err.message ? err.message : String(err);
    console.error(`[Notification Error] ${timestamp} - ${safeMessage}`);
  });

  return events;
}

// Automatically register once when required during server startup
registerListeners(taskEvents);

module.exports = {
  registerListeners,
};
