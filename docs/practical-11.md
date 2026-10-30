# Practical 11: Containerization with Docker and Docker Compose

**Student Name:** Yug Bhatt  
**Roll Number:** 24AIML003  
**Course:** B.Tech Artificial Intelligence & Machine Learning  
**Project:** Student Portfolio (MERN Stack)  

---

## 1. Objective
To containerize the existing multi-tier student portfolio web application (React + Vite frontend, Node.js + Express backend, and MongoDB database) using Docker and Docker Compose. The objective is to achieve environment parity, isolated bridge networking, automated service healthchecks, optimized multi-stage image builds, and persistent database storage via named Docker volumes without breaking existing features (authentication, caching, and event-driven notifications).

---

## 2. Containerized Architecture & Networking Topology

```
+-------------------------------------------------------------------------+
|                              Host Machine                               |
|                                                                         |
|  Browser -> http://localhost:3000 (Frontend)                            |
|  API Client -> http://localhost:5000 (Backend API)                      |
|                                                                         |
|  +-------------------------------------------------------------------+  |
|  |                 Docker Bridge Network: app-network                |  |
|  |                                                                   |  |
|  |  +------------------------------+                                 |  |
|  |  |   student-portfolio-frontend |                                 |  |
|  |  |   Image: nginx:alpine        |                                 |  |
|  |  |   Port: 3000:80              |                                 |  |
|  |  |   - Serves React SPA static  |                                 |  |
|  |  |   - /health endpoint         |                                 |  |
|  |  |   - /api/ reverse proxy      |                                 |  |
|  |  +--------------+---------------+                                 |  |
|  |                 | (depends_on: backend healthy)                   |  |
|  |                 v                                                 |  |
|  |  +------------------------------+                                 |  |
|  |  |   student-portfolio-backend  |                                 |  |
|  |  |   Image: node:18-alpine      |                                 |  |
|  |  |   Port: 5000:5000            |                                 |  |
|  |  |   - Express API Server       |                                 |  |
|  |  |   - /health endpoint         |                                 |  |
|  |  +--------------+---------------+                                 |  |
|  |                 | (depends_on: mongo healthy)                     |  |
|  |                 | MONGODB_URI=mongodb://mongo:27017/...           |  |
|  |                 v                                                 |  |
|  |  +------------------------------+                                 |  |
|  |  |   student-portfolio-mongo    |                                 |  |
|  |  |   Image: mongo:6             |                                 |  |
|  |  |   Internal Port: 27017       |                                 |  |
|  |  |   Healthcheck: mongosh ping  |                                 |  |
|  |  +--------------+---------------+                                 |  |
|  |                 |                                                 |  |
|  +-----------------|-------------------------------------------------+  |
|                    v                                                    |
|           +-------------------+                                         |
|           | Named Volume:     |                                         |
|           | mongo-data        | (Mounted at /data/db)                   |
|           +-------------------+                                         |
+-------------------------------------------------------------------------+
```

---

## 3. Files Created and Modified

| File Path | Action | Description |
| :--- | :---: | :--- |
| `backend/Dockerfile` | **Created** | Production Dockerfile based on `node:18-alpine` with layer caching, production dependencies (`npm ci --only=production`), and healthcheck. |
| `backend/.dockerignore` | **Created** | Prevents copying `node_modules`, `.env`, logs, and `.git` into backend image. |
| `backend/server.js` | **Modified** | Added `GET /health` endpoint, bound listener to `0.0.0.0`, and added Node 18 `globalThis.crypto` polyfill for Mongoose 9. |
| `nginx.conf` | **Created** | Nginx reverse proxy configuration supporting SPA fallback routing (`try_files $uri $uri/ /index.html;`), `/health`, and `/api/` routing. |
| `Dockerfile` (Root) | **Created** | Multi-stage Dockerfile compiling React + Vite in Node build stage and serving compiled static bundle in Nginx Alpine. |
| `.dockerignore` (Root) | **Created** | Excludes `node_modules`, `dist`, `.git`, `.env*`, and backend code from frontend Docker context. |
| `src/api.js` | **Modified** | Updated `API_URL` to support `import.meta.env.VITE_API_URL` with default fallback to `http://localhost:5000`. |
| `docker-compose.yml` | **Created** | Orchestrates `mongo`, `backend`, and `frontend` services with bridge networking, healthchecks, and `mongo-data` volume. |
| `docs/practical-11.md` | **Created** | Complete Practical 11 technical documentation and evidence guide. |

---

## 4. Key Implementation Features

### A. Backend Containerization (`backend/Dockerfile`)
- **Base Image:** `node:18-alpine` ensures minimum image attack surface and compact footprint.
- **Layer Caching:** Package manifests (`package*.json`) are copied prior to copying the application source code, allowing Docker to skip `npm ci` unless dependencies change.
- **Security:** `.env` files are excluded via `.dockerignore`. Environment variables (`PORT`, `MONGODB_URI`, `JWT_SECRET`) are injected declaratively at container runtime via Compose.
- **Docker Healthcheck:**
  ```dockerfile
  HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
    CMD node -e "require('http').get('http://127.0.0.1:' + (process.env.PORT || 5000) + '/health', (r) => process.exit(r.statusCode === 200 ? 0 : 1))"
  ```
- **Node 18 Mongoose Compatibility:** Mongoose 9 relies on `globalThis.crypto`. Added safe initialization in `server.js` ensuring compatibility across Node 18 Alpine runtimes.

### B. Frontend Multi-Stage Build (`Dockerfile` & `nginx.conf`)
- **Multi-Stage Architecture:**
  - **Stage 1 (Builder):** Uses Node Alpine to install dependencies and execute `npm run build` with Vite.
  - **Stage 2 (Production):** Discards Node.js runtime, build tools, and `node_modules`. Only the compiled static files (`dist/`) are copied into a lightweight `nginx:alpine` image.
- **SPA Fallback Routing:** Nginx handles client-side routing by redirecting unknown URLs back to `/index.html`:
  ```nginx
  location / {
      root /usr/share/nginx/html;
      index index.html index.htm;
      try_files $uri $uri/ /index.html;
  }
  ```
- **Nginx Healthcheck:** Configured `/health` endpoint returning `200 "healthy\n"`.

### C. Docker Compose Orchestration (`docker-compose.yml`)
- **Isolated Bridge Network (`app-network`):** Services communicate securely using service names (`backend:5000`, `mongo:27017`).
- **Dependency Graph with Health Checks:**
  - `mongo` must be healthy (`mongosh --eval "db.adminCommand('ping')"`) before `backend` starts.
  - `backend` must be healthy (`/health`) before `frontend` starts.
- **Data Persistence:** Mounted named volume `mongo-data` at `/data/db`. Database state survives container teardowns and recreations.
- **Port Conflict Protection:**
  - `frontend` maps host `3000 -> 80`
  - `backend` maps host `5000 -> 5000`
  - `mongo` port 27017 is internal only within `app-network`, completely preventing conflicts with any existing local MongoDB instance.

---

## 5. Verification & Test Execution Results

### A. Docker Compose Status (`docker compose ps`)
```text
NAME                         IMAGE                        COMMAND                  SERVICE    CREATED          STATUS                    PORTS
student-portfolio-backend    student-portfolio-backend    "docker-entrypoint.s…"   backend    31 seconds ago   Up 25 seconds (healthy)   0.0.0.0:5000->5000/tcp, [::]:5000->5000/tcp
student-portfolio-frontend   student-portfolio-frontend   "/docker-entrypoint.…"   frontend   31 seconds ago   Up 19 seconds (healthy)   0.0.0.0:3000->80/tcp, [::]:3000->80/tcp
student-portfolio-mongo      mongo:6                      "docker-entrypoint.s…"   mongo      31 seconds ago   Up 31 seconds (healthy)   27017/tcp
```
*Result: All 3 containers started and reached `healthy` status.*

### B. Real Docker Image Sizes (`docker images`)
| Repository | Tag | Content Size | Disk Usage | Base Image |
| :--- | :---: | :---: | :---: | :--- |
| `student-portfolio-frontend` | `latest` | **26.4 MB** | 94.1 MB | `nginx:alpine` (multi-stage) |
| `student-portfolio-backend` | `latest` | **50.7 MB** | 211 MB | `node:18-alpine` |
| `mongo` | `6` | **282 MB** | 1.1 GB | `mongo:6` |

*Result: Both application images are under 55 MB content size.*

### C. Live Backend Healthcheck Test
```powershell
Invoke-RestMethod -Uri "http://localhost:5000/health"
```
*Observed Output:*
```text
status timestamp                     uptime
------ ---------                     ------
ok     2026-10-23T06:53:30.105Z 29.26219034
```

### D. Live Frontend Healthcheck & Static Asset Test
```powershell
curl.exe -i http://localhost:3000/health
# Returns: HTTP/1.1 200 OK -> "healthy"

curl.exe -i http://localhost:3000/tasks
# Returns: HTTP/1.1 200 OK (SPA fallback correctly delivers index.html)
```

### E. End-to-End API & Event Integration Test on Docker Stack
Executed `node test-events-integration.js` and `node test-integration.js` against the containerized stack:
```text
=== Running Practical 10 End-to-End Integration Tests ===
✓ 1. Unauthenticated request correctly rejected with 401
✓ 2. Test user authenticated successfully (JWT acquired)
✓ 3. Initial GET /tasks: status=200, X-Cache=MISS
✓ 4. POST /tasks status: 201 in 9ms (Task ID: 1)
✓ 5. Confirmed API response was non-blocking (9ms << 2000ms delay)
✓ 6. Post-create GET /tasks returned X-Cache: MISS (Cache correctly invalidated)
✓ 7. Background notification execution window completed
✓ 8. DELETE /tasks/:id status: 200 in 5ms: Task deleted successfully
✓ 9. Post-delete GET /tasks returned X-Cache: MISS
✓ 10. Cache stats intact: {"hits":0,"misses":3,"totalLookups":3,"hitRatio":"0.00%","hitRatioDecimal":0,"currentKeyCount":1,"ttlSeconds":60}

=== ALL PRACTICAL 10 INTEGRATION TESTS COMPLETED SUCCESSFULLY ===
```

### F. MongoDB Volume Persistence Verification
1. Created task in running stack: `"Persistent Volume Verification Task"` (ID: 1).
2. Completely tore down containers and network:
   ```powershell
   docker compose down
   ```
3. Recreated containers from scratch without removing named volume:
   ```powershell
   docker compose up -d
   ```
4. Authenticated and retrieved tasks from new container:
   ```text
   Found persisted tasks count: 1
   Persisted task details: {
     _id: '6adb0505a1e739990160c7bf',
     id: 1,
     title: 'Persistent Volume Verification Task',
     priority: 'High',
     rollNo: '24AIML003'
   }
   ```
*Result: MongoDB data persisted across container teardown.*

---

## 6. Screenshot Evidence Instructions (Exactly Two Figures)

### Fig. 1: Application Running in Docker
1. Open your browser to:
   ```
   http://localhost:3000
   ```
2. Navigate to the **Tasks** or **Home** page to display the live application.
3. Keep your terminal showing `docker compose ps` (or Docker Desktop) visible alongside the browser window where practical.
4. **📸 Capture Screenshot for Fig. 1.**

### Fig. 2: Docker Compose Container Verification
1. In your terminal at `C:\Users\yugbh\Desktop\student-portfolio`:
   ```powershell
   docker compose ps
   docker images | Select-String "student-portfolio|mongo"
   ```
2. The output displays:
   - `student-portfolio-mongo` $\rightarrow$ `Up (healthy)`
   - `student-portfolio-backend` $\rightarrow$ `Up (healthy)`
   - `student-portfolio-frontend` $\rightarrow$ `Up (healthy)`
   - Port mappings (`3000->80`, `5000->5000`, `27017/tcp`).
   - Image content sizes.
3. **📸 Capture Screenshot for Fig. 2.**

---

## 7. Limitations of Local Containerization vs. Production Orchestrators

1. **Single-Host vs. Multi-Node:** Docker Compose runs all containers on a single host daemon. In production, enterprise applications use orchestrators like **Kubernetes (K8s)**, **Amazon ECS**, or **Docker Swarm** to manage container replication, load balancing, and fault tolerance across a cluster of virtual machines.
2. **Local Volume vs. Cloud Storage:** The `mongo-data` volume is bound to the local host's disk. Production databases use managed database services (e.g., MongoDB Atlas, AWS DocumentDB) or distributed network-attached storage (CSI drivers, AWS EBS/EFS) with automated replication and snapshot backups.
3. **Zero-Downtime Deployment & Rolling Updates:** Docker Compose terminates and recreates containers with slight interruption. Production orchestrators provide declarative rolling updates, canary releases, and automatic rollback on healthcheck failure.
