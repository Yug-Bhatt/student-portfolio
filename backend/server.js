const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");

const app = express();
const PORT = 5000;

// =========================
// MongoDB Connection
// =========================

mongoose
  .connect("mongodb://localhost:27017/student_portfolio")
  .then(() => {
    console.log("MongoDB connected successfully");
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
  console.log(
    `${req.method} ${req.url} - ${new Date().toLocaleString()}`
  );
  next();
});

// =========================
// Task Schema
// =========================

const taskSchema = new mongoose.Schema(
  {
    id: {
      type: Number,
      unique: true,
    },

    title: {
      type: String,
      required: true,
    },

    description: {
      type: String,
      default: "",
    },

    completed: {
      type: Boolean,
      default: false,
    },

    priority: {
      type: String,
      enum: ["Low", "Medium", "High"],
      default: "Medium",
    },

    rollNo: {
      type: String,
      default: "24AIML003",
    },
  },
  {
    timestamps: true,
  }
);

// =========================
// Task Model
// =========================

const Task = mongoose.model("Task", taskSchema);

// =========================
// GET All Tasks
// =========================

app.get("/tasks", async (req, res) => {
  try {
    const tasks = await Task.find().sort({ id: 1 });

    res.status(200).json(tasks);
  } catch (error) {
    console.error(error);

    res.status(500).json({
      error: "Failed to fetch tasks",
    });
  }
});

// =========================
// GET Task by ID
// =========================

app.get("/tasks/:id", async (req, res) => {
  try {
    const id = parseInt(req.params.id);

    const task = await Task.findOne({ id: id });

    if (!task) {
      return res.status(404).json({
        message: "Task not found",
      });
    }

    res.status(200).json(task);
  } catch (error) {
    console.error(error);

    res.status(500).json({
      error: "Failed to fetch task",
    });
  }
});

// =========================
// POST Create Task
// =========================

app.post("/tasks", async (req, res) => {
  try {
    const {
      title,
      description,
      priority,
    } = req.body;

    if (!title || title.trim() === "") {
      return res.status(400).json({
        message: "Task title is required",
      });
    }

    const validPriorities = [
      "Low",
      "Medium",
      "High",
    ];

    const selectedPriority =
      validPriorities.includes(priority)
        ? priority
        : "Medium";

    // Find highest existing ID
    const lastTask = await Task.findOne().sort({
      id: -1,
    });

    const newId = lastTask
      ? lastTask.id + 1
      : 1;

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
    console.error(error);

    res.status(500).json({
      error: "Failed to create task",
    });
  }
});

// =========================
// PUT Update Task
// =========================

app.put("/tasks/:id", async (req, res) => {
  try {
    const id = parseInt(req.params.id);

    const task = await Task.findOne({
      id: id,
    });

    if (!task) {
      return res.status(404).json({
        message: "Task not found",
      });
    }

    const validPriorities = [
      "Low",
      "Medium",
      "High",
    ];

    task.title = req.body.title;
    task.description = req.body.description || "";

    if (typeof req.body.completed === "boolean") {
      task.completed = req.body.completed;
    }

    if (
      validPriorities.includes(req.body.priority)
    ) {
      task.priority = req.body.priority;
    }

    task.rollNo = "24AIML003";

    await task.save();

    res.status(200).json(task);
  } catch (error) {
    console.error(error);

    res.status(500).json({
      error: "Failed to update task",
    });
  }
});

// =========================
// DELETE Task
// =========================

app.delete("/tasks/:id", async (req, res) => {
  try {
    const id = parseInt(req.params.id);

    const task = await Task.findOneAndDelete({
      id: id,
    });

    if (!task) {
      return res.status(404).json({
        message: "Task not found",
      });
    }

    res.status(200).json({
      message: "Task deleted successfully",
    });
  } catch (error) {
    console.error(error);

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
  console.log(
    `Server running on http://localhost:${PORT}`
  );
});