# Practical 13: AI API Integration – Gemini AI Task Description Generation

**Student Name:** Yug Bhatt  
**Roll Number:** 24AIML003  
**Course:** B.Tech Artificial Intelligence & Machine Learning  
**Project:** Student Portfolio (MERN Stack)  

---

## 1. Practical Aim
To integrate Google Gemini Generative AI API (`v1beta`) into the existing full-stack student portfolio web application to automatically generate clear, professional, and actionable task descriptions from task titles, while strictly preserving backend credential security, structured error handling, OpenAI fallback capabilities, and responsive React frontend interactions.

---

## 2. Objectives
1. **Design a Dedicated Backend AI Service Layer:** Implement `backend/aiService.js` to decouple prompt construction, HTTP payload formatting, and response parsing from Express route handlers.
2. **Configure Supported Generative AI Models:** Integrate the official Google Gemini `v1beta` API using the currently active and supported `gemini-flash-latest` model.
3. **Secure API Key and Configuration Management:** Isolate AI secrets strictly in backend environment variables (`GEMINI_API_KEY`, `GEMINI_MODEL`), ensuring no credentials leak into client bundles, browser networks, or version control.
4. **Implement a Protected API Endpoint:** Expose `POST /tasks/generate-description` in `backend/server.js`, guarded by JWT authentication (`authMiddleware`) and strict request payload validation.
5. **Implement Resilient Error Handling & Fallbacks:** Provide clear HTTP status codes (`400`, `401`, `502`, `503`) and maintain an OpenAI provider fallback (`gpt-4o-mini`) should the Gemini API key be absent or secondary AI providers be required.
6. **Integrate Seamless UI Workflow in React:** Add an interactive `"✨ Auto-Generate with AI"` trigger in `src/pages/TasksPage.jsx` with loading states, inline error feedback, and editable text insertion.
7. **Verify via Automated Unit and Live Integration Testing:** Create and execute `backend/test-ai.js` to validate input checks, mock payload parsing, upstream failure handling, and live API generation.

---

## 3. Technologies Used
- **Frontend:**
  - React 19 (Hooks: `useState`, `useEffect`)
  - Vite 8 (Modern build tool & local development server)
  - Vanilla CSS Design System with responsive UI components
- **Backend:**
  - Node.js (CommonJS module system)
  - Express 5 (REST API routing & middleware pipeline)
  - `dotenv` (v17+ environment variable isolation)
  - Native Node.js `fetch` (HTTP client for upstream AI services)
- **AI & Cloud APIs:**
  - **Primary Provider:** Google Gemini API (`v1beta`, model `gemini-flash-latest`, endpoint `:generateContent`)
  - **Fallback Provider:** OpenAI Chat Completions API (`gpt-4o-mini`)
- **Security & Authentication:**
  - JSON Web Tokens (`jsonwebtoken`) via `authMiddleware.js`
  - Request body sanitization and input validation
- **Testing:**
  - Node.js native `assert` module
  - Custom mock fetch harnesses and live environment test runner

---

## 4. Overview of AI Integration

The AI integration enables users to quickly draft meaningful, actionable task descriptions directly from a concise task title (e.g., *"Deploy student portfolio to Docker container"*). 

### Architectural Data Flow:

```
+--------------------------------------------------------------------------+
|                       React 19 Frontend (Vite)                           |
|                                                                          |
|  1. User enters task title in TasksPage.jsx                              |
|  2. User clicks "✨ Auto-Generate with AI" button                         |
|  3. generateTaskDescription(title) called with JWT Authorization header  |
+------------------------------------+-------------------------------------+
                                     | HTTP POST /tasks/generate-description
                                     v
+--------------------------------------------------------------------------+
|                      Node.js / Express 5 Backend                         |
|                                                                          |
|  4. authMiddleware verifies Bearer JWT token                             |
|  5. server.js validates non-empty title string                           |
|  6. Calls aiService.generateDescription(title)                           |
|                                                                          |
|     +-------------------------------------------------------------+      |
|     |                     backend/aiService.js                    |      |
|     |  - Reads GEMINI_API_KEY & GEMINI_MODEL from process.env     |      |
|     |  - Constructs tailored system prompt                        |      |
|     |  - Formats v1beta generateContent JSON payload              |      |
|     +------------------------------+------------------------------+      |
+------------------------------------|-------------------------------------+
                                     | HTTPS POST :generateContent?key=...
                                     v
+--------------------------------------------------------------------------+
|                 Google Gemini Generative AI (Cloud API)                  |
|                                                                          |
|  Endpoint: https://generativelanguage.googleapis.com/v1beta/             |
|            models/gemini-flash-latest:generateContent                    |
|                                                                          |
|  7. Executes inference (temperature: 0.7, maxOutputTokens: 250)          |
|  8. Returns candidate JSON with generated description text               |
+------------------------------------+-------------------------------------+
                                     |
                                     v
+--------------------------------------------------------------------------+
|                      Response Propagation & UI Update                    |
|                                                                          |
|  9. aiService extracts text from candidates[0].content.parts[0].text     |
| 10. Backend responds with 200 OK: { description, provider, model }       |
| 11. Frontend populates Description textarea for in-place user review     |
+--------------------------------------------------------------------------+
```

---

## 5. Gemini API Configuration

### 5.1 Environment Variables
All sensitive credentials and model configuration values are maintained exclusively in `backend/.env`. A corresponding template is maintained in `backend/.env.example` without exposing private keys.

```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/student_portfolio
JWT_SECRET=your_secure_secret_key_here
GEMINI_API_KEY=your_gemini_api_key_here
GEMINI_MODEL=gemini-flash-latest
```

| Variable Name | Required | Description | Default Fallback |
| :--- | :---: | :--- | :--- |
| `GEMINI_API_KEY` | Yes (for Gemini) | Google AI Studio API key authorized for `v1beta` models | None (`MISSING_API_KEY` error) |
| `GEMINI_MODEL` | No | Target Gemini model identifier | `gemini-flash-latest` |
| `OPENAI_API_KEY` | No (Optional fallback) | OpenAI API key for secondary fallback provider | None |
| `OPENAI_MODEL` | No | Fallback OpenAI model identifier | `gpt-4o-mini` |

### 5.2 Model Selection Rationale
- During initial inspection, the deprecated `gemini-1.5-flash` model returned:
  `models/gemini-1.5-flash is not found for API version v1beta, or is not supported for generateContent.`
- Querying the live Models API (`GET https://generativelanguage.googleapis.com/v1beta/models`) confirmed that **`gemini-flash-latest`** is active, officially supported, and includes `generateContent` in its `supportedGenerationMethods`.
- `aiService.js` defaults to `gemini-flash-latest`, ensuring high performance, fast turnaround, and full operational stability.

### 5.3 Credential Isolation & Security Best Practices
- **Never Injected into Client Code:** Vite client files only communicate with the local backend endpoint (`/tasks/generate-description`). The Gemini API key is never exposed via `VITE_` variables or shipped in browser bundles.
- **Git Exclusions:** `backend/.env` is strictly matched in `.gitignore`. Only `backend/.env.example` is tracked.

---

## 6. Backend Implementation and API Endpoint

### 6.1 AI Service Layer (`backend/aiService.js`)
The `aiService.js` module encapsulates prompt construction, HTTP communication, response extraction, and provider selection.

#### Prompt Design:
```text
You are a helpful software assistant. Given this task title:
"${title.trim()}"

Generate a clear, professional, and actionable task description (2-3 concise sentences or a short bulleted list). Provide ONLY the description text without markdown headings, surrounding quotes, or preamble.
```

#### Gemini API Request Structure:
- **URL:** `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${geminiApiKey}`
- **Method:** `POST`
- **Headers:** `Content-Type: application/json`
- **Request Body:**
  ```json
  {
    "contents": [
      {
        "parts": [{ "text": "You are a helpful software assistant..." }]
      }
    ],
    "generationConfig": {
      "temperature": 0.7,
      "maxOutputTokens": 250
    }
  }
  ```

#### Response Extraction:
The service navigates Google's structured candidate schema:
```javascript
const candidate = data.candidates?.[0];
const text = candidate?.content?.parts?.[0]?.text?.trim();
```

#### OpenAI Fallback:
If `GEMINI_API_KEY` is not provided but `OPENAI_API_KEY` is present, the service automatically routes the prompt to `https://api.openai.com/v1/chat/completions` using the `gpt-4o-mini` model.

### 6.2 Express Route (`POST /tasks/generate-description`)
Configured in `backend/server.js`:

```javascript
app.post("/tasks/generate-description", authMiddleware, async (req, res) => {
  try {
    const { title } = req.body;

    if (!title || typeof title !== "string" || !title.trim()) {
      return res.status(400).json({
        error: "Validation failed",
        message: "Task title is required to generate description",
      });
    }

    const result = await generateDescription(title);
    return res.status(200).json(result);
  } catch (error) {
    if (error.code === "MISSING_API_KEY") {
      return res.status(503).json({
        error: "AI_SERVICE_UNAVAILABLE",
        message: error.message,
      });
    }

    console.error("AI Generation error:", error);
    return res.status(502).json({
      error: "AI_GENERATION_FAILED",
      message: error.message || "Failed to generate task description with AI",
    });
  }
});
```

#### Request/Response Contract:
- **Endpoint:** `POST /tasks/generate-description`
- **Authentication:** `Authorization: Bearer <jwt_token>`
- **Request Body:**
  ```json
  {
    "title": "Configure Nginx Reverse Proxy"
  }
  ```
- **Success Response (`200 OK`):**
  ```json
  {
    "description": "Configure Docker Compose network and Nginx reverse proxy.",
    "provider": "gemini",
    "model": "gemini-flash-latest"
  }
  ```

---

## 7. Frontend Integration and User Workflow

### 7.1 API Client (`src/api.js`)
The frontend helper attaches JWT authorization headers and handles error messages:

```javascript
export const generateTaskDescription = async (title) => {
  const response = await fetch(`${API_URL}/tasks/generate-description`, {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify({ title }),
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    handleAuthError(response);
    throw new Error(data.message || "Failed to generate AI description");
  }

  return data;
};
```

### 7.2 Component Integration (`src/pages/TasksPage.jsx`)
In the task creation/editing form:
1. **Title Validation:** Before dispatching the request, the frontend verifies that the user has entered a task title. If empty, an error message is immediately displayed:
   `"Please enter a task title first to generate an AI description."`
2. **Interactive UI State:**
   - The button text changes to `"✨ Generating..."`.
   - The button is disabled (`aiLoading === true`) to prevent duplicate submissions.
3. **In-Place Insertion & Editable Result:**
   - When the AI response arrives, `setDescription(result.description)` automatically populates the `<textarea>`.
   - A success banner announces: `"✨ AI description generated! You can edit it before saving."`
   - The user maintains complete control to modify, append to, or approve the generated text before saving.

---

## 8. Error Handling

The implementation enforces multi-tiered error boundaries:

| Scenario | Trigger / Cause | Error Code | HTTP Status | User-Facing Handling |
| :--- | :--- | :--- | :---: | :--- |
| **Missing / Empty Title** | Client submits whitespace or empty title | `INVALID_TITLE` | `400 Bad Request` | Form shows inline validation error |
| **Unauthenticated Request** | Missing or expired JWT token | `UNAUTHORIZED` | `401 Unauthorized` | Frontend redirects to `/login` |
| **Missing API Key** | Neither `GEMINI_API_KEY` nor `OPENAI_API_KEY` set in `.env` | `MISSING_API_KEY` | `503 Service Unavailable` | Descriptive message instructing admin to configure `.env` |
| **Upstream Provider Error** | Rate limit, quota exceeded, or invalid key from Gemini | `AI_API_ERROR` | `502 Bad Gateway` | Trapped gracefully without crashing Express server |
| **Empty AI Response** | AI response candidate contains no text parts | `EMPTY_AI_RESPONSE` | `502 Bad Gateway` | Clear notification that model returned an empty string |

---

## 9. Testing and Results

### 9.1 Test Suite Structure (`backend/test-ai.js`)
The test script verifies all facets of the AI service layer:

- **Test 1: Input Validation**  
  Asserts that calling `generateDescription("")` throws `INVALID_TITLE`.
- **Test 2: Missing API Key Handling**  
  Temporarily purges `process.env` keys and verifies `MISSING_API_KEY` is thrown.
- **Test 3: Gemini Mock Payload Parsing**  
  Mocks a successful Gemini `v1beta` payload and verifies accurate text extraction and provider tagging (`provider: "gemini"`).
- **Test 4: Upstream HTTP Error Handling**  
  Mocks a 403 Forbidden response and verifies that `AI_API_ERROR` is thrown with the upstream message preserved.
- **Test 5: OpenAI Fallback Provider**  
  Mocks OpenAI chat completion response and confirms parsing of `choices[0].message.content` when configured.
- **Test 6: Live Gemini API Verification**  
  Executes an end-to-end call against Google Gemini using the active backend key, confirming live generation with `gemini-flash-latest`.

### 9.2 Test Execution Output
Running `npm test` inside `backend/` validates the entire backend test suite:

```bash
> backend@1.0.0 test
> node test-cache.js && node test-events.js && node test-ai.js

--- Starting Practical 9 Cache Module Unit Tests ---
✓ Test 1 Passed: Default TTL is 60s
✓ Test 2 Passed: Key generation is stable and user-scoped
✓ Test 3 Passed: Initial metrics safe with 0 lookups
✓ Test 4 Passed: Hit and miss counters calculate accurately
✓ Test 5 Passed: Empty array [] is treated as a valid cached value
✓ Test 6 Passed: Invalidation on task write clears task lists and specific task cache
--- All Cache Module Unit Tests Passed Successfully! ---

--- Starting Practical 10 Event-Driven Unit Tests ---
✓ Test 1 Passed: taskEvents is an instance of native EventEmitter
✓ Test 2 Passed: All required event listeners registered
✓ Test 3 Passed: Listener registration is idempotent
[Notification] Task deleted at 2026-10-30T06:56:22.401Z
[Notification] Deleted Task: Test Task for Deletion (ID: 999)
✓ Test 4 Passed: task-deleted handler executed and logged successfully
[Notification Error] 2026-10-30T06:56:22.401Z - Simulated background error
[Notification] Started: 2026-10-30T06:56:22.401Z
[Notification Error] 2026-10-30T06:56:22.401Z - Cannot read properties of null (reading 'title')
✓ Test 5 Passed: Custom task-notification-error handles errors without process termination
[Notification] Started: 2026-10-30T06:56:22.402Z
[Notification] Task: Asynchronous Timing Test Task
[Notification] Assigned user: 24AIML003
[Notification] Completed: 2026-10-30T06:56:24.416Z
✓ Test 6 Passed: Notification completed in 2014ms (~2000ms asynchronous delay verified)
--- All Practical 10 Unit Tests Passed Successfully! ---

--- Starting Practical 13 AI API Integration Unit Tests ---
✓ Test 1 Passed: Empty title input validation handled safely
✓ Test 2 Passed: Missing API key handled gracefully with code MISSING_API_KEY
✓ Test 3 Passed: Gemini response extracted correctly
✓ Test 4 Passed: AI API HTTP errors trapped and surfaced gracefully
✓ Test 5 Passed: OpenAI fallback provider parsed correctly
Testing live AI API call with configured environment key...
✓ Test 6 Passed: Live generation succeeded via gemini (gemini-flash-latest):
  "Containerize the student portfolio web application by deploying frontend and backend services."
--- All Practical 13 AI Unit Tests Passed Successfully! ---
```

---

## 10. Steps to Run the Feature

### Step 1: Configure Environment Variables
Ensure `backend/.env` exists and contains the required keys:
```bash
PORT=5000
MONGODB_URI=mongodb://localhost:27017/student_portfolio
JWT_SECRET=your_jwt_secret_key
GEMINI_API_KEY=your_actual_google_gemini_api_key
GEMINI_MODEL=gemini-flash-latest
```

### Step 2: Start the Backend Server
In the `backend/` directory:
```bash
cd backend
npm install
node server.js
```
The server will bind to `http://0.0.0.0:5000` and establish a connection to MongoDB.

### Step 3: Run the Unit & Integration Tests
In a separate terminal:
```bash
cd backend
npm test
# Or run specifically the AI tests:
npm run test:ai
```

### Step 4: Start the Frontend Application
In the project root directory:
```bash
npm install
npm run dev
```
Open `http://localhost:5173` in your browser.

### Step 5: Test via the Web Application UI
1. Navigate to the **Login** page and sign in (or register a new user).
2. Go to the **Tasks** management page (`/tasks`).
3. In the Task form, type a concise title in the **Task Title** field (e.g., *"Set up Prometheus Metrics"*).
4. Click the **"✨ Auto-Generate with AI"** button.
5. Watch the button change to `"✨ Generating..."` while the request is in flight.
6. Observe the generated description appear directly inside the **Description** textarea.
7. Edit or add any extra notes, select priority, and click **"Create Task"** to persist to MongoDB.

---

## 11. Conclusion
In Practical 13, Google Gemini Generative AI was successfully integrated into the Student Portfolio application. By decoupling the generation logic into `backend/aiService.js`, selecting the supported `gemini-flash-latest` model, isolating credentials strictly in backend environment variables, and establishing comprehensive unit tests, the system delivers an intelligent, user-centric feature with enterprise-grade security and reliability.
