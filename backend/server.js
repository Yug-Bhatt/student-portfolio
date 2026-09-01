require("dotenv").config();

const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const User = require("./models/User");
const Task = require("./models/Task");
const authMiddleware = require("./middleware/authMiddleware");
const { validateTaskInput } = require("./middleware/validationMiddleware");

const app = express();
const PORT = process.env.PORT || 5000;
const MONGODB_URI =
  process.env.MONGODB_URI || "mongodb://localhost:27017/student_portfolio";

// =========================
// MongoDB Connection
// =========================

mongoose
  .connect(MONGODB_URI)
  .then(() => {
    console.log("MongoDB connected successfully to student_portfolio");
  })
  .catch((error) => {
    console.error("MongoDB connection error:", error);
  });

// =========================
// Middleware
// =========================

app.use(cors());
app.use(express.json());

// Logging Middleware
app.use((req, res, next) => {
  console.log(`${req.method} ${req.url} - ${new Date().toLocaleString()}`);
  next();
});

// =========================
// Authentication Routes
// =========================

// POST /register - User Registration
app.post("/register", async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // Validate name
    if (!name || typeof name !== "string" || name.trim() === "") {
      return res.status(400).json({
        error: "Validation failed",
        message: "Name is required",
      });
    }

    // Validate email
    if (!email || typeof email !== "string" || email.trim() === "") {
      return res.status(400).json({
        error: "Validation failed",
        message: "Email is required",
      });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const normalizedEmail = email.trim().toLowerCase();
    if (!emailRegex.test(normalizedEmail)) {
      return res.status(400).json({
        error: "Validation failed",
        message: "Invalid email format",
      });
    }

    // Validate password
    if (!password || typeof password !== "string") {
      return res.status(400).json({
        error: "Validation failed",
        message: "Password is required",
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        error: "Validation failed",
        message: "Password must be at least 6 characters long",
      });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email: normalizedEmail });
    if (existingUser) {
      return res.status(409).json({
        error: "Conflict",
        message: "User with this email already exists",
      });
    }

    // Hash password with bcrypt (10 rounds)
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Create user in MongoDB
    const newUser = await User.create({
      name: name.trim(),
      email: normalizedEmail,
      password: hashedPassword,
      rollNo: "24AIML003",
    });

    // Return 201 Created without returning password or password hash
    return res.status(201).json({
      message: "User registered successfully",
      user: {
        id: newUser._id,
        name: newUser.name,
        email: newUser.email,
        rollNo: newUser.rollNo,
      },
    });
  } catch (error) {
    console.error("Registration error:", error);
    return res.status(500).json({
      error: "Internal Server Error",
      message: "Failed to register user",
    });
  }
});

// POST /login - User Login
app.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        error: "Validation failed",
        message: "Email and password are required",
      });
    }

    const normalizedEmail = email.trim().toLowerCase();

    // 1. Find user by email
    const user = await User.findOne({ email: normalizedEmail });
    if (!user) {
      return res.status(401).json({
        error: "Unauthorized",
        message: "Invalid email or password",
      });
    }

    // 2. Compare password using bcrypt.compare()
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({
        error: "Unauthorized",
        message: "Invalid email or password",
      });
    }

    // 3. Generate JWT with 1 hour expiration
    const secret = process.env.JWT_SECRET;
    if (!secret) {
      console.error("JWT_SECRET is not configured");
      return res.status(500).json({
        error: "Server configuration error",
        message: "JWT_SECRET is missing in environment variables",
      });
    }

    const payload = {
      userId: user._id,
      email: user.email,
      rollNo: user.rollNo || "24AIML003",
    };

    const token = jwt.sign(payload, secret, { expiresIn: "1h" });

    // 4. Return success response with token and sanitized user details
    return res.status(200).json({
      message: "Login successful",
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        rollNo: user.rollNo || "24AIML003",
      },
    });
  } catch (error) {
    console.error("Login error:", error);
    return res.status(500).json({
      error: "Internal Server Error",
      message: "Failed to login",
    });
  }
});

// =========================
// Protected Task Routes
// =========================

// GET /tasks - Fetch all tasks (Protected)
app.get("/tasks", authMiddleware, async (req, res) => {
  try {
    const tasks = await Task.find().sort({ id: 1 });
    res.status(200).json(tasks);
  } catch (error) {
    console.error("Error fetching tasks:", error);
    res.status(500).json({
      error: "Failed to fetch tasks",
    });
  }
});

// GET /tasks/:id - Fetch task by ID (Protected)
app.get("/tasks/:id", authMiddleware, async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);

    const task = await Task.findOne({ id: id });

    if (!task) {
      return res.status(404).json({
        message: "Task not found",
      });
    }

    res.status(200).json(task);
  } catch (error) {
    console.error("Error fetching task by ID:", error);
    res.status(500).json({
      error: "Failed to fetch task",
    });
  }
});

// POST /tasks - Create task (Protected + Input Validated)
app.post("/tasks", authMiddleware, validateTaskInput, async (req, res) => {
  try {
    const { title, description, priority } = req.body;

    const validPriorities = ["Low", "Medium", "High"];
    const selectedPriority = validPriorities.includes(priority)
      ? priority
      : "Medium";

    // Find highest existing ID
    const lastTask = await Task.findOne().sort({ id: -1 });
    const newId = lastTask ? lastTask.id + 1 : 1;

    const newTask = await Task.create({
      id: newId,
      title: title.trim(),
      description: description || "",
      completed: false,
      priority: selectedPriority,
      rollNo: "24AIML003",
    });

    res.status(201).json(newTask);
  } catch (error) {
    console.error("Error creating task:", error);
    res.status(500).json({
      error: "Failed to create task",
    });
  }
});

// PUT /tasks/:id - Update task (Protected + Input Validated)
app.put("/tasks/:id", authMiddleware, validateTaskInput, async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);

    const task = await Task.findOne({ id: id });

    if (!task) {
      return res.status(404).json({
        message: "Task not found",
      });
    }

    const validPriorities = ["Low", "Medium", "High"];

    if (req.body.title !== undefined) {
      task.title = req.body.title.trim();
    }

    if (req.body.description !== undefined) {
      task.description = req.body.description || "";
    }

    if (typeof req.body.completed === "boolean") {
      task.completed = req.body.completed;
    }

    if (validPriorities.includes(req.body.priority)) {
      task.priority = req.body.priority;
    }

    task.rollNo = "24AIML003";

    await task.save();

    res.status(200).json(task);
  } catch (error) {
    console.error("Error updating task:", error);
    res.status(500).json({
      error: "Failed to update task",
    });
  }
});

// DELETE /tasks/:id - Delete task (Protected)
app.delete("/tasks/:id", authMiddleware, async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);

    const task = await Task.findOneAndDelete({ id: id });

    if (!task) {
      return res.status(404).json({
        message: "Task not found",
      });
    }

    res.status(200).json({
      message: "Task deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting task:", error);
    res.status(500).json({
      error: "Failed to delete task",
    });
  }
});

// =========================
// 404 Handler
// =========================

app.use((req, res) => {
  res.status(404).json({
    error: "Route Not Found",
  });
});

// =========================
// Global Error Handler
// =========================

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    error: "Something went wrong",
  });
});

// =========================
// Start Server
// =========================

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});