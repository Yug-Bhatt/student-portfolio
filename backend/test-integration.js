/**
 * End-to-End Integration Test for Practical 9
 * Verifies live HTTP endpoints:
 * 1. Authentication enforcement on /tasks and /cache/stats
 * 2. Cache MISS on initial request
 * 3. Cache HIT on subsequent identical request
 * 4. Single-task caching (/tasks/:id)
 * 5. Cache invalidation on task write
 * 6. /cache/stats endpoint reporting accurate metrics
 */

const http = require("http");

const BASE_URL = "http://localhost:5000";

function makeRequest(method, path, headers = {}, body = null) {
  return new Promise((resolve, reject) => {
    const url = new URL(path, BASE_URL);
    const options = {
      hostname: url.hostname,
      port: url.port,
      path: url.pathname + url.search,
      method: method,
      headers: {
        "Content-Type": "application/json",
        ...headers,
      },
    };

    const req = http.request(options, (res) => {
      let data = "";
      res.on("data", (chunk) => {
        data += chunk;
      });
      res.on("end", () => {
        let json = null;
        try {
          json = JSON.parse(data);
        } catch {
          json = data;
        }
        resolve({
          status: res.statusCode,
          headers: res.headers,
          data: json,
        });
      });
    });

    req.on("error", (err) => reject(err));

    if (body) {
      req.write(JSON.stringify(body));
    }
    req.end();
  });
}

async function runIntegrationTests() {
  console.log("=== Practical 9 Integration Tests ===");

  // 1. Verify Unauthenticated Requests are Rejected
  const unauthTasks = await makeRequest("GET", "/tasks");
  if (unauthTasks.status !== 401) {
    throw new Error(`Expected 401 for unauthenticated /tasks, got ${unauthTasks.status}`);
  }
  console.log("✓ 1. Unauthenticated /tasks correctly rejected with 401");

  const unauthStats = await makeRequest("GET", "/cache/stats");
  if (unauthStats.status !== 401) {
    throw new Error(`Expected 401 for unauthenticated /cache/stats, got ${unauthStats.status}`);
  }
  console.log("✓ 2. Unauthenticated /cache/stats correctly rejected with 401");

  // 2. Generate a valid token using test login or register
  const testEmail = `test_p9_${Date.now()}@example.com`;
  const regRes = await makeRequest("POST", "/register", {}, {
    name: "Test Runner",
    email: testEmail,
    password: "Password123!",
  });

  let token = null;
  if (regRes.status === 201) {
    const loginRes = await makeRequest("POST", "/login", {}, {
      email: testEmail,
      password: "Password123!",
    });
    token = loginRes.data.token;
  } else {
    throw new Error(`Failed to create test user: ${JSON.stringify(regRes.data)}`);
  }
  console.log("✓ 3. Authenticated test session established");

  const authHeader = { Authorization: `Bearer ${token}` };

  // 3. First GET /tasks -> Expect Cache MISS
  const res1 = await makeRequest("GET", "/tasks", authHeader);
  console.log(`✓ 4. First GET /tasks returned ${res1.status}, X-Cache: ${res1.headers["x-cache"]}`);
  if (res1.headers["x-cache"] !== "MISS") {
    throw new Error(`Expected X-Cache: MISS on first request, got ${res1.headers["x-cache"]}`);
  }

  // 4. Second GET /tasks -> Expect Cache HIT
  const res2 = await makeRequest("GET", "/tasks", authHeader);
  console.log(`✓ 5. Second GET /tasks returned ${res2.status}, X-Cache: ${res2.headers["x-cache"]}`);
  if (res2.headers["x-cache"] !== "HIT") {
    throw new Error(`Expected X-Cache: HIT on second request, got ${res2.headers["x-cache"]}`);
  }

  // 5. Third GET /tasks -> Expect Cache HIT
  const res3 = await makeRequest("GET", "/tasks", authHeader);
  console.log(`✓ 6. Third GET /tasks returned ${res3.status}, X-Cache: ${res3.headers["x-cache"]}`);
  if (res3.headers["x-cache"] !== "HIT") {
    throw new Error(`Expected X-Cache: HIT on third request, got ${res3.headers["x-cache"]}`);
  }

  // 6. Check /cache/stats endpoint
  const statsRes = await makeRequest("GET", "/cache/stats", authHeader);
  console.log("✓ 7. /cache/stats response:", JSON.stringify(statsRes.data));
  if (statsRes.status !== 200 || !statsRes.data.data) {
    throw new Error(`Invalid stats response: ${JSON.stringify(statsRes.data)}`);
  }
  if (statsRes.data.data.hits < 2 || statsRes.data.data.misses < 1) {
    throw new Error("Stats counters do not match recorded operations");
  }

  // 7. Verify Invalidation on Create Task
  const createRes = await makeRequest("POST", "/tasks", authHeader, {
    title: "Integration Test Task",
    description: "Temporary task to verify cache invalidation",
    priority: "Low",
  });
  console.log(`✓ 8. Created test task ID: ${createRes.data.id}`);

  // Query /tasks again -> Must be a MISS because cache was invalidated
  const resAfterCreate = await makeRequest("GET", "/tasks", authHeader);
  console.log(`✓ 9. Post-create GET /tasks returned X-Cache: ${resAfterCreate.headers["x-cache"]}`);
  if (resAfterCreate.headers["x-cache"] !== "MISS") {
    throw new Error("Expected cache MISS after task creation invalidation");
  }

  // 8. Single-task caching test
  const singleTask1 = await makeRequest("GET", `/tasks/${createRes.data.id}`, authHeader);
  console.log(`✓ 10. First GET /tasks/:id returned X-Cache: ${singleTask1.headers["x-cache"]}`);
  const singleTask2 = await makeRequest("GET", `/tasks/${createRes.data.id}`, authHeader);
  console.log(`✓ 11. Second GET /tasks/:id returned X-Cache: ${singleTask2.headers["x-cache"]}`);
  if (singleTask2.headers["x-cache"] !== "HIT") {
    throw new Error("Expected single-task cache HIT on second request");
  }

  // 9. Clean up: Delete the created test task (also tests delete invalidation)
  const delRes = await makeRequest("DELETE", `/tasks/${createRes.data.id}`, authHeader);
  console.log(`✓ 12. Deleted test task: ${delRes.data.message}`);

  // Query /tasks again -> Must be a MISS because deletion invalidated the cache
  const resAfterDelete = await makeRequest("GET", "/tasks", authHeader);
  console.log(`✓ 13. Post-delete GET /tasks returned X-Cache: ${resAfterDelete.headers["x-cache"]}`);
  if (resAfterDelete.headers["x-cache"] !== "MISS") {
    throw new Error("Expected cache MISS after task deletion invalidation");
  }

  console.log("\n=== ALL INTEGRATION TESTS PASSED SUCCESSFULLY! ===");
}

runIntegrationTests().catch((err) => {
  console.error("Test failure:", err.message);
  process.exit(1);
});
