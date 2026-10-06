import { BrowserRouter, Routes, Route } from "react-router-dom";
import { useState, useEffect, lazy, Suspense } from "react";
import "./App.css";

import Header from "./components/Header";
import Footer from "./components/Footer";
import ProtectedRoute from "./components/ProtectedRoute";
import Loading from "./components/Loading";

// Eagerly loaded for initial application shell & critical first render
import Home from "./pages/Home";

/**
 * Route-based Code Splitting with React.lazy():
 * Instead of bundling all pages into a single monolithic JavaScript file,
 * React.lazy() dynamically imports each route component only when the user navigates to it.
 * This decreases initial bundle download time, accelerates Time to Interactive (TTI),
 * and saves network bandwidth on devices with limited connectivity.
 */
const AboutPage = lazy(() => import("./pages/AboutPage"));
const ProjectsPage = lazy(() => import("./pages/ProjectsPage"));
const TasksPage = lazy(() => import("./pages/TasksPage"));
const ContactPage = lazy(() => import("./pages/ContactPage"));
const LoginPage = lazy(() => import("./pages/LoginPage"));
const RegisterPage = lazy(() => import("./pages/RegisterPage"));

function App() {
  const [darkMode, setDarkMode] = useState(false);

  useEffect(() => {
    if (darkMode) {
      document.body.classList.add("dark-mode");
    } else {
      document.body.classList.remove("dark-mode");
    }
  }, [darkMode]);

  return (
    <BrowserRouter>
      <div className={darkMode ? "dark" : "light"}>
        <div className="container app-container">
          <Header
            name="Yug Bhatt"
            course="B.Tech Artificial Intelligence & Machine Learning"
          />

          <div className="toggle">
            <button
              className="dark-mode-btn"
              onClick={() => setDarkMode(!darkMode)}
            >
              {darkMode ? "☀ Light Mode" : "🌙 Dark Mode"}
            </button>
          </div>

          {/*
            React.Suspense:
            Wraps lazy-loaded components and renders a fallback UI (custom spinner)
            while the asynchronous bundle chunk is being downloaded across the network.
          */}
          <Suspense fallback={<Loading message="Loading page..." />}>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/about" element={<AboutPage />} />
              <Route path="/projects" element={<ProjectsPage />} />
              <Route
                path="/tasks"
                element={
                  <ProtectedRoute>
                    <TasksPage />
                  </ProtectedRoute>
                }
              />
              <Route path="/contact" element={<ContactPage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />
            </Routes>
          </Suspense>

          <Footer email="yugbhatt75@gmail.com" />
        </div>
      </div>
    </BrowserRouter>
  );
}

export default App;