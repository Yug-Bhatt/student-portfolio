# Student Portfolio

A simple student portfolio website built using **React** and **Vite** as part of a college practical.

## Features

- Single-page portfolio
- Reusable React components
- Header, About, Education, Skills, Projects, Certifications, Contact, and Footer sections
- Props used to pass data between components
- Clean and responsive layout

## Technologies Used

- React
- Vite
- JavaScript
- CSS

## Project Structure

```
student-portfolio/
│── public/
│── src/
│   ├── components/
│   │   ├── Header.jsx
│   │   ├── About.jsx
│   │   ├── Education.jsx
│   │   ├── Skills.jsx
│   │   ├── Projects.jsx
│   │   ├── Certificates.jsx
│   │   ├── Contact.jsx
│   │   └── Footer.jsx
│   ├── App.jsx
│   ├── App.css
│   ├── index.css
│   └── main.jsx
│── package.json
│── vite.config.js
│── README.md
```

## Practical 7: Authentication & Middleware Pipeline

Practical 7 extends the portfolio with a secure authentication and middleware pipeline:

- **Bcrypt Password Hashing**: Passwords are never stored in plain text; hashed using `bcryptjs` (salt rounds: 10).
- **User Registration (`POST /register`)**: Validates input, checks for unique email, hashes password, saves user with default `rollNo: "24AIML003"`, and returns HTTP 201.
- **User Login (`POST /login`)**: Authenticates credentials and returns a signed JSON Web Token (JWT) expiring in 1 hour.
- **Authentication Middleware (`authMiddleware.js`)**: Intercepts requests, validates `Authorization: Bearer <token>`, decodes payload safely with try/catch, attaches `req.user`, and rejects invalid/missing tokens with HTTP 401.
- **Input Validation Middleware (`validationMiddleware.js`)**: Validates task inputs (title required, valid priority levels), returning HTTP 400 for invalid inputs.
- **Protected Task API Routes**: All task endpoints (`GET /tasks`, `GET /tasks/:id`, `POST /tasks`, `PUT /tasks/:id`, `DELETE /tasks/:id`) require authentication.
- **Frontend Authentication**:
  - `RegisterPage.jsx` (`/register`) and `LoginPage.jsx` (`/login`) integrated with portfolio blue theme.
  - `ProtectedRoute.jsx` redirects unauthenticated access from `/tasks` to `/login`.
  - Visible Logout option and `🔐 Authenticated` status badge.
  - Global HTTP 401 handling to automatically clear invalid/expired sessions and redirect to login.
- **MongoDB Collections**: `student_portfolio` database contains:
  - `tasks`: Existing task collection preserving all Practical 6 CRUD functionality.
  - `users`: User credentials collection storing bcrypt password hashes and roll number `24AIML003`.

## Getting Started

### 1. Backend Setup

```bash
cd backend
npm install
node server.js
```

Backend runs on `http://localhost:5000`.

### 2. Frontend Setup

```bash
npm install
npm run dev
```

Frontend runs on `http://localhost:5173`.

## Author

**Yug Bhatt**  
Roll Number: **24AIML003**  
B.Tech Artificial Intelligence & Machine Learning  
CHARUSAT University