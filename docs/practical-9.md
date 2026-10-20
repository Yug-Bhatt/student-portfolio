# Practical 9: In-Memory Caching and Query Optimization

**Student Name:** Yug Bhatt  
**Roll Number:** 24AIML003  
**Course:** B.Tech Artificial Intelligence & Machine Learning  
**Project:** Student Portfolio (MERN Stack)  

---

## 1. Objective
To design, implement, and evaluate server-side in-memory caching using `node-cache` in an existing Express and MongoDB backend, analyze its impact on API response latency, ensure secure cache isolation scoped to authenticated users, enforce immediate cache invalidation on write mutations, and observe cache hit/miss statistics.

---

## 2. Existing System Architecture
- **Frontend:** React 19 + Vite with React Router v7, featuring `React.lazy()` and `Suspense` route-based code splitting (Practical 8).
- **Backend:** Node.js + Express 5 running on port `5000` (`http://localhost:5000`).
- **Database:** MongoDB (`student_portfolio`) with Mongoose 9.
- **Authentication:** JSON Web Tokens (JWT) using `jsonwebtoken` and `bcryptjs` password hashing (10 salt rounds), validated by `authMiddleware.js`.
- **Validation:** `validationMiddleware.js` ensuring valid task titles and enum priorities (`Low`, `Medium`, `High`).
- **Data Models:**
  - `User`: Handles identity, credentials, and student roll number (`24AIML003`).
  - `Task`: Stores custom numeric `id`, `title`, `description`, `completed`, `priority`, `rollNo`, and timestamps.

---

## 3. Caching Architecture & Request Flow

```
                      +-----------------------------+
                      |   Client (Postman/Frontend) |
                      +--------------+--------------+
                                     |
                         HTTP GET /tasks (Bearer JWT)
                                     v
                      +-----------------------------+
                      |       authMiddleware        |
                      +--------------+--------------+
                                     | (Authorized)
                                     v
                        Derive User-Scoped Key:
                        "tasks:user:<userId>:all"
                                     |
                                     v
                         +-----------------------+
                         |   In-Memory Cache     |
                         |     (node-cache)      |
                         +-----------+-----------+
                                    / \
                     Cache HIT     /   \   Cache MISS
                   (Key exists)   /     \  (Key absent)
                                 /       \
                                v         v
                     +--------------+  +-------------------+
                     | Return Cached|  | Query MongoDB     |
                     | Payload (0ms)|  | Task.find().sort()|
                     +--------------+  +---------+---------+
                                                 |
                                                 v
                                       +-------------------+
                                       | Store in Cache    |
                                       | (TTL: 60 seconds) |
                                       +---------+---------+
                                                 |
                                                 v
                                       +-------------------+
                                       | Return Response   |
                                       +-------------------+
```

---

## 4. Implementation Details

### A. Dependency Added
- `node-cache` (`^5.1.2`): Lightweight, in-memory, thread-local key-value store with automatic expiration.

### B. Shared Cache Module (`backend/cache.js`)
- Configured with `stdTTL: 60` (60 seconds default expiration).
- `checkperiod: 120` (background garbage collection sweep every 2 minutes).
- `useClones: true` (deep cloning on get/set to prevent reference mutation).

### C. Cache Key Strategy & User Scoping
To strictly adhere to authentication and authorization boundaries and prevent cross-tenant data leakage:
- **All Tasks Key:** `tasks:user:<userId>:all`
- **Single Task Key:** `tasks:user:<userId>:task:<taskId>`

### D. Empty Array Handling
An empty task list (`[]`) is a valid response from the database. The cache lookup evaluates:
```javascript
const cachedTasks = cache.get(cacheKey);
if (cachedTasks !== undefined) {
  // Valid Cache Hit (including empty arrays [])
  recordHit();
  res.set("X-Cache", "HIT");
  return res.status(200).json(cachedTasks);
}
```
Checking `cachedTasks !== undefined` guarantees that empty lists are never falsely treated as misses.

### E. Cache Invalidation Strategy
To prevent serving stale data, cache entries are invalidated **only after successful database write operations**:
- **POST `/tasks`:** After task insertion, `invalidateOnTaskWrite(newTask.id)` removes all-tasks list cache entries (`tasks:user:*:all`).
- **PUT `/tasks/:id`:** After `task.save()`, `invalidateOnTaskWrite(id)` removes all-tasks list cache entries and the specific task entry (`tasks:user:*:task:<id>`).
- **DELETE `/tasks/:id`:** After `Task.findOneAndDelete()`, `invalidateOnTaskWrite(id)` purges both list and single-task caches.
- **Failed Writes (400/404):** Invalidation is skipped if the task is not found or validation fails, preventing unnecessary cache thrashing.

### F. Diagnostic Cache Stats Endpoint (`GET /cache/stats`)
- **Route:** `GET http://localhost:5000/cache/stats`
- **Protection:** Requires `authMiddleware` (Bearer token).
- **Payload Schema:**
  ```json
  {
    "status": "success",
    "data": {
      "hits": 2,
      "misses": 1,
      "totalLookups": 3,
      "hitRatio": "66.67%",
      "hitRatioDecimal": 0.6667,
      "currentKeyCount": 1,
      "ttlSeconds": 60
    }
  }
  ```
- **Safety:** Division by zero is safeguarded (`totalLookups === 0 ? "0.00%" : ...`). No sensitive credentials, JWTs, or task contents are exposed.

---

## 5. Response Time Measurements & Analysis

### A. Uncached Baseline Measurements (Pre-Implementation)
Collected via Postman before server-side caching was enabled:
- **Endpoint:** `GET http://localhost:5000/tasks`
- **Headers:** `Authorization: Bearer <JWT_TOKEN>`

| Request Run | HTTP Status | Response Time (ms) | Cache State |
| :--- | :---: | :---: | :---: |
| Run 1 | 200 OK | 9 ms | Uncached (Database Query) |
| Run 2 | 200 OK | 11 ms | Uncached (Database Query) |
| Run 3 | 200 OK | 11 ms | Uncached (Database Query) |

$$\text{Uncached Average} = \frac{9 + 11 + 11}{3} = 10.33\text{ ms}$$

---

### B. Cached Measurements (Post-Implementation)
Tested with server-side `node-cache` enabled:
- **Endpoint:** `GET http://localhost:5000/tasks`
- **Headers:** `Authorization: Bearer <JWT_TOKEN>`

*(Note: Record your 3 consecutive Postman readings below after sending requests 2, 3, and 4 within the 60-second TTL window)*

| Request Run | HTTP Status | Response Time (ms) | Response Header (`X-Cache`) | Cache State |
| :--- | :---: | :---: | :---: | :---: |
| Run 1 (Warmup) | 200 OK | *e.g., 8 ms* | `X-Cache: MISS` | Miss (Populates Cache) |
| **Run 2 (Timed 1)** | 200 OK | **[ ENTER VALUE ] ms** | `X-Cache: HIT` | In-Memory Hit |
| **Run 3 (Timed 2)** | 200 OK | **[ ENTER VALUE ] ms** | `X-Cache: HIT` | In-Memory Hit |
| **Run 4 (Timed 3)** | 200 OK | **[ ENTER VALUE ] ms** | `X-Cache: HIT` | In-Memory Hit |

$$\text{Cached Average} = \frac{\text{Run 2} + \text{Run 3} + \text{Run 4}}{3}$$

---

### C. Performance Comparison Formula
$$\text{Absolute Time Reduction} = \text{Uncached Average} - \text{Cached Average}$$

$$\text{Percentage Reduction (\%)} = \left(\frac{\text{Uncached Average} - \text{Cached Average}}{\text{Uncached Average}}\right) \times 100$$

*Example Calculation (if cached average is 2.33 ms):*
$$\text{Reduction} = \left(\frac{10.33 - 2.33}{10.33}\right) \times 100 \approx 77.44\%$$

---

## 6. How to Test Cached Performance with Postman

1. **Verify Backend is Running:**
   Ensure `node server.js` is running on port 5000.
2. **Obtain Active JWT Token:**
   - Send `POST http://localhost:5000/login` with registered credentials.
   - Copy the `"token"` value.
3. **Configure the GET Request:**
   - Method: `GET`
   - URL: `http://localhost:5000/tasks`
   - Headers: `Authorization: Bearer <YOUR_TOKEN>`
4. **Trigger Initial Request (Cache Miss & Warmup):**
   - Click **Send**.
   - Inspect Response Headers: `X-Cache: MISS`.
5. **Collect 3 Cached Readings:**
   - Click **Send** (Run 2) $\rightarrow$ Note response time (ms) and verify `X-Cache: HIT`.
   - Click **Send** (Run 3) $\rightarrow$ Note response time (ms) and verify `X-Cache: HIT`.
   - Click **Send** (Run 4) $\rightarrow$ Note response time (ms) and verify `X-Cache: HIT`.
6. **Verify Diagnostics:**
   - Send `GET http://localhost:5000/cache/stats` with the Bearer token.
   - Inspect the `hits` and `misses` count.

---

## 7. Viva & Oral Examination Questions (B.Tech Practical)

### Q1: Why is cache invalidation necessary after writes?
**Answer:** When data is created, modified, or deleted in the database, the cache still holds the old snapshot. Without invalidation, clients querying the cache will receive obsolete, inaccurate data (known as stale reads) instead of the latest database state.

### Q2: What happens if cache invalidation is forgotten?
**Answer:** The system experiences severe data inconsistency. For example, a user who deletes a task or updates its status to "Completed" would still see the deleted or incomplete task until the TTL expires, leading to confused users and corrupted application workflows.

### Q3: Why use a 60-second TTL?
**Answer:** A 60-second Time-To-Live provides a balanced compromise between cache freshness and resource optimization. It shields the database from rapid read storms during traffic spikes while ensuring that any uncaught inconsistency will naturally correct itself within one minute.

### Q4: What trade-off does TTL length represent?
**Answer:** 
- **Longer TTL:** Maximizes cache hit ratio and minimizes database load, but increases the risk and duration of serving stale data if invalidation misses an edge case.
- **Shorter TTL:** Guarantees higher data freshness and lower memory consumption, but causes more frequent cache misses and higher query load on the database.

### Q5: Why is `node-cache` unsuitable as a shared cache across multiple server instances?
**Answer:** `node-cache` stores items inside the RAM of a single Node.js process (process-local heap memory). If an application is scaled horizontally across multiple instances, cluster nodes, or Docker containers behind a load balancer, each instance maintains its own isolated memory space. An invalidation on Server A will not clear the memory of Server B, causing split-brain inconsistency. Distributed caching systems like **Redis** or **Memcached** are required for multi-instance deployments.

### Q6: What is a cache hit?
**Answer:** A cache hit occurs when requested data is found in the cache memory, allowing the server to return the data immediately without querying the underlying primary storage (MongoDB).

### Q7: What is a cache miss?
**Answer:** A cache miss occurs when the requested key is not present in cache (either never stored or expired). The application must fetch the data from MongoDB, populate the cache for future requests, and return the response.

### Q8: Why might response-time improvement be small for a small dataset?
**Answer:** In local development environments with small collections (e.g., 5–10 tasks), MongoDB executes queries in single-digit milliseconds (5–10 ms). Network overhead (TCP loopback latency, HTTP JSON parsing, and Express middleware execution) accounts for a large portion of the total response time, making the percentage drop less pronounced than on large tables with complex joins or millions of documents.

### Q9: Why should cached results respect authentication and authorization?
**Answer:** Caching operates after or alongside authentication. If cache keys are not scoped to the authenticated user ID (or role), User A could access confidential tasks cached by User B. Caching must never bypass access control or act as an authorization surrogate.

---

## 8. Verification & Test Execution Results

- **Unit Tests (`backend/test-cache.js`):**
  - Default TTL = 60s: **PASSED**
  - User-scoped key generation: **PASSED**
  - Zero-lookup metric stability: **PASSED**
  - Hit/miss counter & ratio accuracy: **PASSED**
  - Empty array `[]` preservation: **PASSED**
  - Write invalidation on task write: **PASSED**
- **Live Integration Tests (`backend/test-integration.js`):**
  - 401 Unauthorized enforcement on `/tasks` & `/cache/stats`: **PASSED**
  - First request `X-Cache: MISS`: **PASSED**
  - Consecutive requests `X-Cache: HIT`: **PASSED**
  - Single-task caching (`/tasks/:id`): **PASSED**
  - Invalidation on POST `/tasks` & DELETE `/tasks/:id`: **PASSED**
  - Metric counters tracking in `/cache/stats`: **PASSED**
- **Frontend Production Build (`vite build`):**
  - Build status: **SUCCESS** (All chunks generated cleanly, Practical 8 lazy loading intact).
