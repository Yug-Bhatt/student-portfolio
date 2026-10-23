# Practical 10: Asynchronous Processing with Event-Driven Architecture

**Student Name:** Yug Bhatt  
**Roll Number:** 24AIML003  
**Course:** B.Tech Artificial Intelligence & Machine Learning  
**Project:** Student Portfolio (MERN Stack)  

---

## 1. Objective
To design and implement an asynchronous, decoupled background notification system using Node.js's native `EventEmitter` module within an existing Express and MongoDB backend. The system demonstrates non-blocking execution where client HTTP responses are dispatched immediately upon database persistence, while background notifications (simulating a 2-second processing delay) execute independently on subsequent ticks of the event loop. The implementation includes supplementary task deletion notifications, centralized error isolation via a custom error event, and complete preservation of JWT authentication, input validation, and Practical 9 in-memory caching.

---

## 2. Existing System Architecture
- **Frontend:** React 19 + Vite with React Router v7, featuring code splitting with `React.lazy()` and `Suspense` (Practical 8).
- **Backend:** Node.js + Express 5 running on port `5000` (`http://localhost:5000`).
- **Database:** MongoDB (`student_portfolio`) via Mongoose 9 models (`User`, `Task`).
- **Security & Authentication:** 
  - Password hashing with `bcryptjs` (10 rounds).
  - Stateless JSON Web Tokens (`jsonwebtoken`, 1-hour expiration) enforced via `authMiddleware.js`.
  - Input validation via `validationMiddleware.js` enforcing non-empty task titles and enum priorities (`Low`, `Medium`, `High`).
- **Data Persistence (`Task` Schema):**
  - Fields: `id` (numeric, unique), `title`, `description`, `completed`, `priority`, `rollNo` (`"24AIML003"`), `createdAt`, `updatedAt`.
- **Caching Layer (Practical 9):**
  - Thread-local `node-cache` instance with 60s TTL.
  - User-scoped cache keys (`tasks:user:<userId>:all` and `tasks:user:<userId>:task:<id>`).
  - Strict invalidation on writes (`invalidateOnTaskWrite`).
  - Diagnostic metrics endpoint (`GET /cache/stats`).

---

## 3. Core EventEmitter Concepts & Architecture

### What is Node.js `EventEmitter`?
Node.js is architected around an asynchronous event-driven architecture in which certain objects ("emitters") emit named events that cause `Function` objects ("listeners") to be called. The `events` module is built directly into the Node.js runtime, requiring zero external dependencies, message brokers, or background services.

### Decoupling Producers from Consumers
In traditional request-response handlers, logging, third-party webhook dispatches, email delivery, or auditing are performed sequentially before sending the HTTP response. This forces clients to wait for secondary operations to complete.
By introducing an `EventEmitter`:
1. **Producer (`POST /tasks`):** Persists the document, invalidates caches, logs response dispatch, flushes the HTTP 201 response immediately, and schedules event emission via `setImmediate()`.
2. **Consumer (`listeners.js`):** Receives the event payload independently, logs notification metadata, and manages its own asynchronous delay via `setTimeout()` without delaying or altering the HTTP response already received by the client.

### Synchronous Invocation vs. Event Loop Scheduling
By default in Node.js, `eventEmitter.emit()` invokes all registered listeners **synchronously** in the order they were registered on the current stack. 
To ensure true non-blocking decoupling from the HTTP response:
- The route handler invokes `res.status(201).json(newTask)` first.
- Event emission is deferred to the next event loop iteration using `setImmediate(() => { taskEvents.emit('task-created', newTask); })`.
- Within the listener, the simulated workload is scheduled via `setTimeout(() => { ... }, 2000)`, allowing the Node.js event loop to process other incoming HTTP requests concurrently while the 2-second timer elapses.

---

## 4. Event Flow Diagram

```
[ Client: Postman / Browser ]
           |
           | HTTP POST /tasks (Bearer JWT)
           v
+----------------------------------------------------+
| 1. authMiddleware (Validate JWT)                   |
+----------------------------------------------------+
           |
           v
+----------------------------------------------------+
| 2. validationMiddleware (Validate Title/Priority)  |
+----------------------------------------------------+
           |
           v
+----------------------------------------------------+
| 3. MongoDB Persistence: await Task.create(...)     |
+----------------------------------------------------+
           |
           v
+----------------------------------------------------+
| 4. Cache Invalidation: invalidateOnTaskWrite(id)   |
+----------------------------------------------------+
           |
           v
+----------------------------------------------------+
| 5. Log [API] Response sent at <timestamp>          |
|    Send HTTP 201 Created (Immediate Response: ~17ms|
+----------------------------------------------------+
           |
           | [res.status(201).json(...) returned to Client]
           |
           v
+----------------------------------------------------+
| 6. setImmediate() - Defer to Next Event Loop Tick  |
+----------------------------------------------------+
           |
           v
+----------------------------------------------------+
| 7. taskEvents.emit('task-created', newTask)        |
+----------------------------------------------------+
           |
           v
+----------------------------------------------------+
| 8. Listener: [Notification] Started at <timestamp> |
|    Log Task Title & Assigned User (24AIML003)      |
+----------------------------------------------------+
           |
           | setTimeout(..., 2000ms) [Non-blocking timer]
           v
+----------------------------------------------------+
| 9. [Notification] Completed at <timestamp + 2.0s>  |
+----------------------------------------------------+
```

---

## 5. Files Created and Modified

| File Path | Action | Description |
| :--- | :---: | :--- |
| `backend/events.js` | **Created** | Instantiates and exports a singleton instance of `TaskEvents` extending Node.js native `EventEmitter`. |
| `backend/listeners.js` | **Created** | Defines and registers event listeners for `task-created`, `task-deleted`, and `task-notification-error`. Includes idempotency guard to prevent duplicate registrations. |
| `backend/server.js` | **Modified** | Imports `taskEvents` and loads `listeners.js` at startup; updates `POST /tasks` and `DELETE /tasks/:id` to emit events asynchronously after response dispatch. |
| `backend/test-events.js` | **Created** | Unit test suite verifying emitter inheritance, listener registration, idempotent initialization, 2-second async delay, and error routing. |
| `backend/test-events-integration.js` | **Created** | End-to-end integration test validating HTTP response latency, cache invalidation, asynchronous background execution, and deletion events. |
| `backend/package.json` | **Modified** | Added `test:events` and `test:integration` scripts; updated `npm test` to run all unit tests. |
| `docs/practical-10.md` | **Created** | Comprehensive practical documentation, viva questions, and verification results. |

---

## 6. Implementation Details

### A. Shared Event Emitter Singleton (`backend/events.js`)
```javascript
const EventEmitter = require("events");

class TaskEvents extends EventEmitter {}

module.exports = new TaskEvents();
```
Uses CommonJS module exports to provide a single, shared event bus across the Express application.

### B. Event Listeners & Idempotent Setup (`backend/listeners.js`)
```javascript
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

module.exports = { registerListeners };
```

### C. Server Integration (`backend/server.js`)
1. **Module Initialization:** Loaded once at top of `server.js`:
   ```javascript
   const taskEvents = require("./events");
   require("./listeners");
   ```
2. **POST `/tasks` Handler:**
   ```javascript
   // Invalidate relevant cache only after successful database write
   invalidateOnTaskWrite(newTask.id);

   // Log API response timestamp and send immediate response
   console.log(`[API] Response sent at ${new Date().toISOString()}`);
   res.status(201).json(newTask);

   // Emit task-created asynchronously on next event loop tick
   setImmediate(() => {
     try {
       taskEvents.emit("task-created", newTask);
     } catch (err) {
       taskEvents.emit("task-notification-error", err);
     }
   });
   ```
3. **DELETE `/tasks/:id` Handler:**
   ```javascript
   invalidateOnTaskWrite(id);

   console.log(`[API] Delete response sent at ${new Date().toISOString()}`);
   res.status(200).json({
     message: "Task deleted successfully",
   });

   setImmediate(() => {
     try {
       taskEvents.emit("task-deleted", task);
     } catch (err) {
       taskEvents.emit("task-notification-error", err);
     }
   });
   ```

### D. Safe Error Handling
- **No Unhandled `'error'` Events:** In Node.js, emitting an unhandled event named `'error'` causes Node.js to print a stack trace and terminate the process. Practical 10 uses the dedicated event name `'task-notification-error'`, ensuring that background listener errors are logged safely without crashing the backend.
- **Synchronous & Asynchronous Boundary Wrapping:** Both the synchronous listener body and the asynchronous `setTimeout` callback are guarded with `try...catch` blocks that route any runtime errors to `'task-notification-error'`.
- **Response Immutability:** Because the HTTP response is already sent (`res.status(201).json(...)`), subsequent notification errors cannot alter the client's HTTP status or response body.
- **Privacy Protection:** No passwords, JWTs, or environment variables are logged.

---

## 7. Observed Execution Output & Timing Analysis

The following timestamps were captured directly from a live test run against the running server on port 5000:

```text
Server running on http://localhost:5000
MongoDB connected successfully to student_portfolio
POST /register - 23/10/2026, 11:25:11 am
POST /login - 23/10/2026, 11:25:11 am
GET /tasks - 23/10/2026, 11:25:11 am
POST /tasks - 23/10/2026, 11:25:11 am
[API] Response sent at 2026-10-23T05:55:11.678Z
[Notification] Started: 2026-10-23T05:55:11.680Z
[Notification] Task: Practical 10 Async Event Task
[Notification] Assigned user: 24AIML003
GET /tasks - 23/10/2026, 11:25:11 am
[Notification] Completed: 2026-10-23T05:55:13.694Z
DELETE /tasks/4 - 23/10/2026, 11:25:13 am
[API] Delete response sent at 2026-10-23T05:55:13.918Z
[Notification] Task deleted at 2026-10-23T05:55:13.920Z
[Notification] Deleted Task: Practical 10 Async Event Task (ID: 4)
GET /tasks - 23/10/2026, 11:25:13 am
GET /cache/stats - 23/10/2026, 11:25:13 am
```

### Detailed Timing Comparison
| Event | Timestamp (ISO 8601) | Offset from Response | Explanation |
| :--- | :---: | :---: | :--- |
| **API Response Sent** | `2026-10-23T05:55:11.678Z` | $+0\text{ ms}$ | HTTP 201 response dispatched to client immediately |
| **Notification Started** | `2026-10-23T05:55:11.680Z` | $+2\text{ ms}$ | `setImmediate` triggered listener on next loop tick |
| **Concurrent Request** | `23/10/2026, 11:25:11 am` | $\sim +5\text{ ms}$ | Server handled incoming `GET /tasks` while timer ran |
| **Notification Completed** | `2026-10-23T05:55:13.694Z` | $+2016\text{ ms}$ | `setTimeout(2000)` resolved asynchronously |

$$\text{Time Difference} = 13.694 - 11.678 = 2.016\text{ seconds}$$

**Key Proof of Asynchronous Non-Blocking Execution:**
1. The client received its HTTP 201 response in just **17 ms** after initiating `POST /tasks`.
2. The `[Notification] Completed` log appeared **2.016 seconds later**.
3. During those 2 seconds, the server continued serving other client requests (e.g., `GET /tasks`).

---

## 8. Postman Testing Guide & Screenshot Evidence Instructions

To capture evidence for your submission, follow these exact steps:

### Step 1: Start MongoDB and Backend
Open a terminal in `C:\Users\yugbh\Desktop\student-portfolio\backend`:
```powershell
node server.js
```
*Expected Console Output:*
```text
Server running on http://localhost:5000
MongoDB connected successfully to student_portfolio
```

### Step 2: Obtain an Active Bearer Token
1. Open Postman.
2. Send request:
   - **Method:** `POST`
   - **URL:** `http://localhost:5000/login`
   - **Headers:** `Content-Type: application/json`
   - **Body (raw JSON):**
     ```json
     {
       "email": "your_registered_email@example.com",
       "password": "your_password"
     }
     ```
3. Copy the `"token"` value from the response.

### Step 3: Send POST `/tasks` Request (Screenshot 1: Postman Response)
1. In Postman, open a new tab.
2. Configure:
   - **Method:** `POST`
   - **URL:** `http://localhost:5000/tasks`
   - **Headers:**
     - `Authorization`: `Bearer <PASTE_YOUR_TOKEN>`
     - `Content-Type`: `application/json`
   - **Body (raw JSON):**
     ```json
     {
       "title": "Complete Practical 10 Submission",
       "description": "Event-driven asynchronous background notification testing",
       "priority": "High"
     }
     ```
3. Click **Send**.
4. Observe the response:
   - **Status:** `201 Created`
   - **Time:** Typically `< 50 ms`
   - **Body:** Shows created task with `id`, `title`, `rollNo: "24AIML003"`.
5. **📸 Capture Screenshot 1:** Postman showing the `201 Created` response and response time.

### Step 4: Observe Backend Console Output (Screenshot 2: Terminal Timestamps)
Look at your backend terminal. You will see:
```text
POST /tasks - ...
[API] Response sent at 2026-10-23T...
[Notification] Started: 2026-10-23T...
[Notification] Task: Complete Practical 10 Submission
[Notification] Assigned user: 24AIML003
[Notification] Completed: 2026-10-23T...
```
- Compare the `[API] Response sent` timestamp with `[Notification] Completed`.
- Notice that `[Notification] Completed` printed exactly ~2 seconds later.
- **📸 Capture Screenshot 2:** Terminal showing the `[API]` response log and `[Notification]` logs with matching timestamps.

### Step 5: Test DELETE `/tasks/:id` (Screenshot 3: Deletion Notification)
1. In Postman:
   - **Method:** `DELETE`
   - **URL:** `http://localhost:5000/tasks/<TASK_ID>` (replace `<TASK_ID>` with numeric ID from Step 3)
   - **Headers:** `Authorization: Bearer <PASTE_YOUR_TOKEN>`
2. Click **Send**.
   - **Status:** `200 OK`
   - **Body:** `{"message": "Task deleted successfully"}`
3. Inspect your terminal:
   ```text
   DELETE /tasks/...
   [API] Delete response sent at 2026-10-23T...
   [Notification] Task deleted at 2026-10-23T...
   [Notification] Deleted Task: Complete Practical 10 Submission (ID: ...)
   ```
4. **📸 Capture Screenshot 3:** Postman showing `200 OK` and terminal showing `[Notification] Task deleted`.

---

## 9. Verification & Test Suite Results

All tests were executed directly in the project environment and observed:

### A. Unit Tests (`backend/test-events.js`)
- Test 1: Native `EventEmitter` inheritance $\rightarrow$ **PASSED**
- Test 2: Event listener registration (`task-created`, `task-deleted`, `task-notification-error`) $\rightarrow$ **PASSED**
- Test 3: Idempotent listener registration guard $\rightarrow$ **PASSED**
- Test 4: `task-deleted` event execution $\rightarrow$ **PASSED**
- Test 5: Safe custom error routing via `task-notification-error` $\rightarrow$ **PASSED**
- Test 6: Asynchronous timing delay verification ($2009\text{ ms} \approx 2000\text{ ms}$) $\rightarrow$ **PASSED**

### B. Practical 9 Cache Unit Tests (`backend/test-cache.js`)
- Default TTL (60s), User-Scoped Keys, Hit/Miss Metrics, Empty Array Preservation, Cache Invalidation $\rightarrow$ **ALL 6 PASSED**

### C. Live End-to-End Integration Tests (`backend/test-events-integration.js`)
- Unauthenticated rejection (401) $\rightarrow$ **PASSED**
- User registration and JWT authentication $\rightarrow$ **PASSED**
- `POST /tasks` response time ($17\text{ ms} \ll 2000\text{ ms}$) $\rightarrow$ **PASSED**
- Non-blocking execution verified $\rightarrow$ **PASSED**
- Cache invalidation on task create $\rightarrow$ **PASSED**
- `DELETE /tasks/:id` immediate response ($23\text{ ms}$) & event emission $\rightarrow$ **PASSED**
- Cache invalidation on task delete $\rightarrow$ **PASSED**
- Diagnostic cache statistics endpoint $\rightarrow$ **PASSED**

### D. Frontend Build Check (`npm run build`)
- React 19 + Vite production bundle build: **SUCCESS** in 1.14s (Practical 8 lazy routing intact).

---

## 10. Limitations of EventEmitter in Production Systems

While `EventEmitter` is ideal for lightweight, single-process applications, it has notable limitations for production-scale distributed systems:

1. **Process-Local Memory:** `EventEmitter` instances reside entirely inside the V8 heap of a single Node.js process. In horizontally scaled deployments (e.g., Kubernetes pods, PM2 clusters, multiple Docker containers behind an NGINX load balancer), an event emitted on Server A is invisible to Server B.
2. **Volatile & Ephemeral (Non-Durable):** If the Node.js process crashes, terminates, or restarts while a `setTimeout` callback or event is queued, pending background jobs are permanently lost. There is no disk persistence, retry mechanism, or dead-letter queue.
3. **Single-Threaded CPU Blocking:** `EventEmitter` does **not** move work to another thread or worker process. If a listener performs heavy computation (e.g., image resizing, encryption, PDF generation), it will block Node.js's main event loop, stalling all concurrent HTTP requests.
4. **No Backpressure or Rate Limiting:** Rapidly emitting events with slow asynchronous listeners can lead to unbounded memory consumption as callbacks accumulate in memory.
5. **Production Alternatives:** Enterprise systems use distributed message brokers and task queues such as **BullMQ with Redis**, **RabbitMQ**, or **Apache Kafka** to achieve persistence, horizontal worker scaling, retries, and rate limiting.

---

## 11. Viva & Oral Examination Questions (B.Tech Practical)

### Q1: What is an EventEmitter in Node.js?
**Answer:** `EventEmitter` is a core Node.js class in the native `events` module that facilitates communication between objects. It allows publishers to emit named events with payload data, and subscribers (listeners) to handle those events asynchronously or synchronously without tightly coupling the components.

### Q2: Why did we emit `task-created` inside `setImmediate()` instead of calling it synchronously?
**Answer:** `EventEmitter.emit()` calls registered listeners synchronously by default. Wrapping the emit call in `setImmediate()` defers its execution to the check phase of the next event loop iteration. This guarantees that the HTTP response has already been flushed and sent to the client before the listener logic starts executing.

### Q3: How does the 2-second `setTimeout` prove asynchronous processing?
**Answer:** The client receives an HTTP 201 response almost instantly (in ~17 ms), whereas the notification completion log appears 2 seconds later (`2016 ms`). If the notification were synchronous/blocking, the client would have experienced a 2000+ ms request latency.

### Q4: Why is emitting an unhandled event named `'error'` dangerous in Node.js?
**Answer:** In Node.js, the event name `'error'` is treated as a special case. If an `EventEmitter` emits `'error'` and no listener is registered for `'error'`, Node.js prints the stack trace, throws an unhandled exception, and terminates the entire Node.js process. Using a dedicated name like `'task-notification-error'` prevents accidental application crashes.

### Q5: Does `EventEmitter` run listener functions in a separate thread?
**Answer:** No. Node.js executes JavaScript on a single thread. `EventEmitter` listeners run on the exact same thread and event loop as the Express route handlers. Heavy CPU-bound code in a listener will block the event loop; only I/O and timer-based work yield to the event loop.

### Q6: What happens to background notifications if the server crashes during the 2-second timeout?
**Answer:** Because `EventEmitter` and `setTimeout` are stored in process-local RAM (heap memory), any pending events or delayed timers are lost when the process terminates. Distributed queues with persistent storage (like BullMQ + Redis) are required if guaranteed execution is necessary.

### Q7: How does Practical 10 interact with Practical 9's caching?
**Answer:** When `POST /tasks` or `DELETE /tasks/:id` is called, `invalidateOnTaskWrite()` is executed immediately after the database operation succeeds. This purges stale cache keys before the HTTP response is sent and before the event is emitted, ensuring that subsequent client requests always fetch fresh data from MongoDB.

### Q8: What is the purpose of the `task-deleted` event?
**Answer:** It provides decoupled notification handling when a task is removed. It logs the deletion timestamp and task details without altering or delaying the existing `200 OK` delete response contract, and is emitted only if the task was found and deleted in MongoDB.
