const express = require("express");
const cors = require("cors");

const app = express();
const PORT = 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Logging Middleware
app.use((req, res, next) => {
  console.log(
    `${req.method} ${req.url} - ${new Date().toLocaleString()}`
  );
  next();
});

// In-memory Task Array
let tasks = [
  {
    id: 1,
    title: "Complete Practical 4",
    description: "Build REST API using Express",
    completed: false,
    rollNo: "24AIML003",
  },
  {
    id: 2,
    title: "Learn Node.js",
    description: "Understand Express middleware",
    completed: false,
    rollNo: "24AIML003",
  },
];

// GET All Tasks
app.get("/tasks", (req, res) => {
  res.status(200).json(tasks);
});

// GET Task by ID
app.get("/tasks/:id", (req, res) => {
  const id = parseInt(req.params.id);

  const task = tasks.find((task) => task.id === id);

  if (!task) {
    return res.status(404).json({
      message: "Task not found",
    });
  }

  res.status(200).json(task);
});

// POST Create Task
app.post("/tasks", (req, res) => {
  const { title, description } = req.body;

  const newTask = {
    id: tasks.length + 1,
    title,
    description,
    completed: false,
    rollNo: "24AIML003",
  };

  tasks.push(newTask);

  res.status(201).json(newTask);
});

// PUT Update Task
app.put("/tasks/:id", (req, res) => {
  const id = parseInt(req.params.id);

  const task = tasks.find((task) => task.id === id);

  if (!task) {
    return res.status(404).json({
      message: "Task not found",
    });
  }

  task.title = req.body.title;
  task.description = req.body.description;
  task.completed = req.body.completed;
  task.rollNo = "24AIML003";

  res.status(200).json(task);
});

// DELETE Task
app.delete("/tasks/:id", (req, res) => {
  const id = parseInt(req.params.id);

  const index = tasks.findIndex((task) => task.id === id);

  if (index === -1) {
    return res.status(404).json({
      message: "Task not found",
    });
  }

  tasks.splice(index, 1);

  res.status(200).json({
    message: "Task deleted successfully",
  });
});

// 404 Handler
app.use((req, res) => {
  res.status(404).json({
    error: "Route Not Found",
  });
});

// Global Error Handler
app.use((err, req, res, next) => {
  console.error(err.stack);

  res.status(500).json({
    error: "Something went wrong",
  });
});

// Start Server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});