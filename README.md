# 🎓 Student Portfolio Management System

A full-stack student portfolio and task management application built using **React, Node.js, Express.js, and MongoDB**. The project demonstrates modern frontend development, REST API integration, authentication, database management, caching, event-driven programming, Docker containerization, GitHub Actions CI, and Generative AI integration.

---

## 📌 Project Overview

The Student Portfolio Management System is designed to provide students with a centralized platform to manage their academic portfolio and organize their tasks efficiently.

The application combines a responsive React frontend with a RESTful Express backend and MongoDB database. It includes secure authentication, task management, performance optimization, asynchronous notifications, and AI-powered task description generation.

The project is developed incrementally through practical implementations, with each practical introducing and demonstrating specific full-stack development concepts.

---

## ✨ Features

### 1. Student Portfolio Interface
- Responsive dashboard interface.
- Home, About, Projects, Tasks, and Contact sections.
- Modern dark-themed user interface.
- Interactive navigation.
- Light and dark mode support.

### 2. Authentication and Security
- User registration and login.
- Password hashing using bcryptjs.
- JWT-based authentication.
- Protected application routes.
- Authentication middleware.
- Input validation and error handling.

### 3. Task Management
- Create, read, update, and delete tasks.
- Task title and description management.
- Task priority management.
- Task status tracking.
- User-specific task management.
- Task dashboard with statistics.

### 4. Performance Optimization
- In-memory caching using NodeCache.
- User-specific cache keys.
- Configurable cache expiration.
- Cache invalidation after successful database updates.
- Cached task retrieval.
- Cache statistics endpoint.

### 5. Event-Driven Notifications
- Native Node.js EventEmitter implementation.
- Custom task-created and task-deleted events.
- Asynchronous event processing.
- Custom event error handling.
- Non-blocking notification execution.

### 6. AI-Powered Task Description Generation
- Integration with Google Gemini Generative AI.
- Automatic task description generation from task titles.
- Backend AI service abstraction.
- Protected AI API endpoint.
- Loading and error states in the frontend.
- Configurable Gemini model.
- Optional AI provider fallback support, where configured.

### 7. Docker Containerization
- Dockerized frontend application.
- Dockerized backend application.
- MongoDB container.
- Multi-stage frontend Docker build.
- Nginx reverse proxy.
- Docker Compose orchestration.
- Persistent MongoDB volume.
- Container health checks.

### 8. Continuous Integration
- GitHub Actions automation.
- Automated backend testing.
- Docker Compose configuration validation.
- Automated Docker image builds.
- Container startup and health verification.
- Frontend and backend HTTP endpoint checks.

---

## 🛠️ Technology Stack

| Category | Technologies |
|---|---|
| Frontend | React 19, Vite, JavaScript |
| Styling | CSS, Responsive UI |
| Backend | Node.js, Express.js |
| Database | MongoDB, Mongoose |
| Authentication | JWT, bcryptjs |
| API Communication | REST API, Axios |
| Caching | NodeCache |
| Event Handling | Node.js EventEmitter |
| Artificial Intelligence | Google Gemini API |
| Web Server | Nginx |
| Containerization | Docker, Docker Compose |
| CI/CD | GitHub Actions |
| Testing | Node.js Assert, Custom Integration Tests |
| Version Control | Git, GitHub |

---

## 🏗️ System Architecture

```text
             STUDENT PORTFOLIO APPLICATION
                         |
              +----------+----------+
              |                     |
          FRONTEND                BACKEND
        React + Vite          Node.js + Express
              |                     |
              |              +------+------+
              |              |             |
              |          REST APIs      AI Service
              |              |             |
              |              |          Gemini API
              |              |
              |        Authentication
              |              |
              |        Task Management
              |              |
              |        Cache Layer
              |              |
              |        Event System
              |              |
              |          MongoDB
              |              |
              +--------------+
                     |
                Docker Compose
                     |
              GitHub Actions CI
```

---

## 📂 Project Structure

```text
student-portfolio/
│
├── .github/
│   └── workflows/
│       ├── ci.yml
│       └── docker-ci.yml
│
├── backend/
│   ├── Dockerfile
│   ├── .dockerignore
│   ├── server.js
│   ├── aiService.js
│   ├── cache.js
│   ├── package.json
│   ├── package-lock.json
│   ├── .env.example
│   ├── test-cache.js
│   ├── test-events.js
│   └── test-ai.js
│
├── docs/
│   ├── practical-9.md
│   ├── practical-10.md
│   ├── practical-11.md
│   └── practical-13.md
│
├── src/
│   ├── api.js
│   ├── pages/
│   └── components/
│
├── public/
│
├── Dockerfile
├── docker-compose.yml
├── nginx.conf
├── .dockerignore
├── index.html
├── package.json
└── README.md
```

*Note: This is the documented project structure; additional application files and folders may exist.*

---

## ⚙️ Installation and Setup

### Prerequisites

Install the following tools:

- Node.js (18 or later)
- npm
- MongoDB or Docker
- Git

### 1. Clone the Repository

```bash
git clone https://github.com/Yug-Bhatt/student-portfolio.git
```

```bash
cd student-portfolio
```

### 2. Install Frontend Dependencies

```bash
npm install
```

### 3. Install Backend Dependencies

```bash
cd backend
npm install
```

### 4. Configure Environment Variables

Create a `.env` file inside the `backend` directory.

Use `backend/.env.example` as the reference for the required variable names.

Configure the necessary values for:

- MongoDB connection.
- JWT authentication secret.
- Gemini API key.
- Gemini model configuration.
- Optional AI fallback provider credentials, if enabled.

**Important:** Never commit `.env` files, API keys, passwords, or other sensitive credentials to GitHub.

### 5. Start the Backend

```bash
cd backend
node server.js
```

### 6. Start the Frontend

Open another terminal:

```bash
npm run dev
```

The Vite development server will display its local URL in the terminal.

---

## 🐳 Docker Deployment

The application supports containerized deployment using Docker Compose.

### Services

| Service | Description | Port |
|---|---|---|
| Frontend | React application served through Nginx | 3000 |
| Backend | Express REST API | 5000 |
| MongoDB | Database service | 27017 (internal) |

### Build Docker Images

```bash
docker compose build
```

### Start All Containers

```bash
docker compose up -d
```

### Check Container Status

```bash
docker compose ps
```

### View Container Logs

```bash
docker compose logs
```

### Stop Containers

```bash
docker compose down
```

### Stop Containers and Remove Volumes

```bash
docker compose down -v
```

**Note:** Removing volumes deletes the persisted MongoDB container data.

### Access the Application

- Frontend: http://localhost:3000
- Backend health endpoint: http://localhost:5000/health

Docker Compose manages the frontend, backend, and MongoDB services through a shared network.

---

## 🤖 AI Integration — Google Gemini

The application integrates Google's Gemini Generative AI API to automatically generate task descriptions.

### Workflow

1. The user enters a task title.
2. The frontend sends a request to the backend.
3. The backend validates the request.
4. The AI service communicates with the Gemini API.
5. Gemini generates a relevant task description.
6. The generated description is returned to the frontend.
7. The user can review and edit the generated description before saving the task.

### AI Configuration

The AI integration uses environment-based configuration.

```env
GEMINI_API_KEY=your_api_key
GEMINI_MODEL=gemini-flash-latest
```

The actual API key must remain private and must never be committed to the repository.

---

## ⚡ Performance Optimization

The backend implements in-memory caching using NodeCache.

### Caching Features

- Task retrieval caching.
- User-specific cache isolation.
- Cache expiration using TTL.
- Cache invalidation after successful write operations.
- Individual task caching.
- Cache statistics for monitoring.

The cache reduces repeated database queries and improves response efficiency for frequently requested task data.

---

## 🔔 Event-Driven Architecture

The backend uses Node.js EventEmitter to handle asynchronous task notifications.

### Implemented Events

- `task-created`
- `task-deleted`
- `task-notification-error`

Event processing is separated from the main request-response flow to support non-blocking execution.

---

## 🧪 Testing

The backend includes automated tests for important application functionality.

Run the complete backend test suite:

```bash
cd backend
npm test
```

The test suite covers:

| Test File | Purpose |
|---|---|
| test-cache.js | Cache functionality and invalidation |
| test-events.js | Event-driven task notifications |
| test-ai.js | AI service validation, response handling, and generation |

Live Gemini API tests require valid API credentials and network access.

---

## 🔄 GitHub Actions — Continuous Integration

The repository uses GitHub Actions to automate testing and Docker verification.

### Backend CI

Workflow:

`.github/workflows/ci.yml`

Responsibilities:
- Checkout repository.
- Set up Node.js.
- Install backend dependencies.
- Execute backend automated tests.

### Docker CI

Workflow:

`.github/workflows/docker-ci.yml`

Responsibilities:
- Verify Docker and Docker Compose availability.
- Validate Docker Compose configuration.
- Build frontend and backend Docker images.
- Start application containers.
- Verify MongoDB and backend health checks.
- Verify frontend HTTP response.
- Verify backend health endpoint.
- Display container logs on failure.
- Clean up containers and volumes.

Both workflows run through GitHub Actions on the configured `main` branch events.

---

## 📚 Practical Implementations

The project is developed through a sequence of practical assignments.

| Practical | Implementation |
|---|---|
| Practical 8 | Route-based lazy loading using React.lazy and Suspense |
| Practical 9 | Backend caching and query optimization using NodeCache |
| Practical 10 | Event-driven programming using Node.js EventEmitter |
| Practical 11 | Docker containerization using Docker Compose |
| Practical 12 | GitHub Actions continuous integration |
| Practical 13 | AI API integration using Google Gemini |

Detailed implementation reports are maintained in the `docs/` directory.

---

## 🔐 Security Considerations

- Passwords are hashed before storage.
- JWT authentication protects authorized resources.
- Backend routes use authentication and validation middleware.
- API credentials are stored in environment variables.
- Sensitive `.env` files are excluded from version control.
- AI API credentials are never exposed in frontend code.

---

## 🚀 Future Improvements

- Add more advanced student portfolio management features.
- Introduce analytics and performance dashboards.
- Expand task management and notification functionality.
- Improve automated integration and end-to-end testing.
- Implement production deployment and monitoring.
- Introduce additional AI-powered student productivity tools.

---

## 👨‍💻 Developer

**Yug Bhatt**

B.Tech — Artificial Intelligence and Machine Learning

Charotar University of Science and Technology (CHARUSAT)

- GitHub: https://github.com/Yug-Bhatt
- LinkedIn: https://www.linkedin.com/in/yugbhatt-ai
- Portfolio: https://yug-portfolio-v2.vercel.app/

---

## 📄 License

This project is developed for academic and educational purposes.

---

⭐ If you find this project interesting, feel free to explore the repository and its practical implementations.
