/**
 * Shared Task Events Module (Practical 10)
 * 
 * Provides an EventEmitter instance using Node.js's native `events` module.
 * Used for decoupled, event-driven background notifications in Express.
 */

const EventEmitter = require("events");

class TaskEvents extends EventEmitter {}

module.exports = new TaskEvents();
