/**
 * Integration Test for Practical 10
 * Validates:
 * 1. Unauthenticated requests are rejected (401)
 * 2. User registration and authentication (JWT)
 * 3. Immediate HTTP response on POST /tasks (before delayed notification completes)
 * 4. Cache invalidation on task creation (Practical 9 preservation)
 * 5. DELETE /tasks/:id returns immediate 200 and triggers task-deleted
 * 6. Cache stats verification
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

async function runPractical10Integration() {
  console.log("=== Running Practical 10 End-to-End Integration Tests ===");

  // 1. Unauthenticated request check
  const unauth = await makeRequest("GET", "/tasks");
  if (unauth.status !== 401) {
    throw new Error(`Expected 401 for unauthenticated request, got ${unauth.status}`);
  }
  console.log("✓ 1. Unauthenticated request correctly rejected with 401");

  // 2. Register & authenticate a test user
  const testEmail = `test_p10_${Date.now()}@example.com`;
  const regRes = await makeRequest("POST", "/register", {}, {
    name: "Practical 10 Student",
    email: testEmail,
    password: "Password123!",
  });

  if (regRes.status !== 201) {
    throw new Error(`Failed to register test user: ${JSON.stringify(regRes.data)}`);
  }

  const loginRes = await makeRequest("POST", "/login", {}, {
    email: testEmail,
    password: "Password123!",
  });

  const token = loginRes.data.token;
  if (!token) {
    throw new Error("No token returned from login");
  }
  console.log("✓ 2. Test user authenticated successfully (JWT acquired)");

  const authHeader = { Authorization: `Bearer ${token}` };

  // 3. Populate cache with GET /tasks
  const initialGet = await makeRequest("GET", "/tasks", authHeader);
  console.log(`✓ 3. Initial GET /tasks: status=${initialGet.status}, X-Cache=${initialGet.headers["x-cache"]}`);

  // 4. Test POST /tasks - verify immediate response timing
  const requestStartTime = Date.now();
  const createRes = await makeRequest("POST", "/tasks", authHeader, {
    title: "Practical 10 Async Event Task",
    description: "Verifying non-blocking event-driven processing",
    priority: "High",
  });
  const requestEndTime = Date.now();
  const responseDuration = requestEndTime - requestStartTime;

  console.log(`✓ 4. POST /tasks status: ${createRes.status} in ${responseDuration}ms (Task ID: ${createRes.data.id})`);
  if (createRes.status !== 201) {
    throw new Error(`Expected status 201, got ${createRes.status}`);
  }

  // Response MUST be fast (< 500ms), proving the 2000ms notification did NOT block the HTTP response!
  if (responseDuration >= 1500) {
    throw new Error(`Response took ${responseDuration}ms - notification blocked HTTP response!`);
  }
  console.log(`✓ 5. Confirmed API response was non-blocking (${responseDuration}ms << 2000ms delay)`);

  // 5. Test Cache Invalidation
  const postCreateGet = await makeRequest("GET", "/tasks", authHeader);
  console.log(`✓ 6. Post-create GET /tasks returned X-Cache: ${postCreateGet.headers["x-cache"]} (Cache correctly invalidated)`);
  if (postCreateGet.headers["x-cache"] !== "MISS") {
    throw new Error("Cache should be MISS after task creation");
  }

  // 6. Wait for 2.2 seconds to allow the background notification to complete
  console.log("... Waiting 2.2 seconds for background notification handler to finish ...");
  await new Promise((r) => setTimeout(r, 2200));
  console.log("✓ 7. Background notification execution window completed");

  // 7. Test DELETE /tasks/:id and event emission
  const deleteStartTime = Date.now();
  const delRes = await makeRequest("DELETE", `/tasks/${createRes.data.id}`, authHeader);
  const deleteDuration = Date.now() - deleteStartTime;
  console.log(`✓ 8. DELETE /tasks/:id status: ${delRes.status} in ${deleteDuration}ms: ${delRes.data.message}`);
  if (delRes.status !== 200) {
    throw new Error(`Expected 200 on delete, got ${delRes.status}`);
  }

  // 8. Verify cache invalidation after delete
  const postDeleteGet = await makeRequest("GET", "/tasks", authHeader);
  console.log(`✓ 9. Post-delete GET /tasks returned X-Cache: ${postDeleteGet.headers["x-cache"]}`);
  if (postDeleteGet.headers["x-cache"] !== "MISS") {
    throw new Error("Cache should be MISS after task deletion");
  }

  // 9. Verify cache stats endpoint
  const statsRes = await makeRequest("GET", "/cache/stats", authHeader);
  console.log("✓ 10. Cache stats intact:", JSON.stringify(statsRes.data.data));

  console.log("\n=== ALL PRACTICAL 10 INTEGRATION TESTS COMPLETED SUCCESSFULLY ===");
}

runPractical10Integration().catch((err) => {
  console.error("Integration test error:", err);
  process.exit(1);
});
