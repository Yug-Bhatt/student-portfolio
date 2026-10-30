import { useEffect, useState } from "react";
import {
  getTasks,
  createTask,
  updateTask,
  deleteTask,
  generateTaskDescription,
} from "../api";

function TasksPage() {
  // =========================
  // State
  // =========================
  const [tasks, setTasks] = useState([]);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState("Medium");
  const [editingId, setEditingId] = useState(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [aiLoading, setAiLoading] = useState(false);

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [priorityFilter, setPriorityFilter] = useState("all");

  // =========================
  // Success Message
  // =========================
  const showMessage = (text) => {
    setMessage(text);
    setTimeout(() => {
      setMessage("");
    }, 2500);
  };

  // =========================
  // Fetch Tasks
  // =========================
  const fetchTasks = async () => {
    try {
      const data = await getTasks();
      setTasks(data);
      setError("");
    } catch {
      setError("Unable to load tasks. Please make sure the backend is running.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getTasks()
      .then((data) => {
        setTasks(data);
        setError("");
      })
      .catch(() => {
        setError("Unable to load tasks. Please make sure the backend is running.");
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  // =========================
  // Create Task
  // =========================
  const handleCreate = async () => {
    if (title.trim() === "") {
      setError("Please enter a task title.");
      return;
    }

    try {
      setError("");
      const newTask = await createTask({
        title,
        description,
        priority,
      });

      setTasks((prev) => [...prev, newTask]);
      setTitle("");
      setDescription("");
      setPriority("Medium");
      showMessage("Task created successfully!");
    } catch (err) {
      setError(err.message || "Failed to create task.");
    }
  };

  // =========================
  // AI Generate Description
  // =========================
  const handleGenerateDescription = async () => {
    if (!title.trim()) {
      setError("Please enter a task title first to generate an AI description.");
      return;
    }

    try {
      setAiLoading(true);
      setError("");
      const result = await generateTaskDescription(title);
      if (result.description) {
        setDescription(result.description);
        showMessage("✨ AI description generated! You can edit it before saving.");
      }
    } catch (err) {
      setError(err.message || "Failed to generate AI description.");
    } finally {
      setAiLoading(false);
    }
  };

  // =========================
  // Toggle Complete
  // =========================
  const handleToggle = async (task) => {
    try {
      setError("");
      const updated = await updateTask(task.id, {
        completed: !task.completed,
      });

      setTasks((prev) =>
        prev.map((t) => (t.id === task.id ? updated : t))
      );
      showMessage("Task status updated!");
    } catch (err) {
      setError(err.message || "Failed to update task.");
    }
  };

  // =========================
  // Edit Task
  // =========================
  const handleEdit = (task) => {
    setEditingId(task.id);
    setTitle(task.title);
    setDescription(task.description || "");
    setPriority(task.priority || "Medium");
    window.scrollTo({ top: 120, behavior: "smooth" });
  };

  // =========================
  // Update Task
  // =========================
  const handleUpdate = async () => {
    if (title.trim() === "") {
      setError("Please enter a task title.");
      return;
    }

    try {
      setError("");
      const updated = await updateTask(editingId, {
        title,
        description,
        priority,
      });

      setTasks((prev) =>
        prev.map((t) => (t.id === editingId ? updated : t))
      );

      setEditingId(null);
      setTitle("");
      setDescription("");
      setPriority("Medium");
      showMessage("Task updated successfully!");
    } catch (err) {
      setError(err.message || "Failed to update task.");
    }
  };

  // =========================
  // Delete Task
  // =========================
  const handleDelete = async (task) => {
    const confirmDelete = window.confirm(
      `Are you sure you want to delete "${task.title}"?`
    );
    if (!confirmDelete) return;

    try {
      setError("");
      await deleteTask(task.id);
      setTasks((prev) => prev.filter((t) => t.id !== task.id));
      showMessage("Task deleted successfully!");
    } catch (err) {
      setError(err.message || "Failed to delete task.");
    }
  };

  const cancelEdit = () => {
    setEditingId(null);
    setTitle("");
    setDescription("");
    setPriority("Medium");
    setError("");
  };

  // =========================
  // Search + Filters
  // =========================
  const filteredTasks = tasks.filter((task) => {
    const searchText = search.toLowerCase();
    const matchesSearch =
      task.title.toLowerCase().includes(searchText) ||
      (task.description && task.description.toLowerCase().includes(searchText));

    const matchesStatus =
      statusFilter === "all" ||
      (statusFilter === "completed" && task.completed) ||
      (statusFilter === "pending" && !task.completed);

    const matchesPriority =
      priorityFilter === "all" ||
      (task.priority || "Medium") === priorityFilter;

    return matchesSearch && matchesStatus && matchesPriority;
  });

  // =========================
  // Statistics
  // =========================
  const completedTasks = tasks.filter((t) => t.completed).length;
  const pendingTasks = tasks.length - completedTasks;
  const highPriorityTasks = tasks.filter(
    (t) => (t.priority || "Medium") === "High"
  ).length;

  return (
    <div className="tasks-page">
      {/* Dashboard Executive Header */}
      <div className="dashboard-hero">
        <div>
          <span className="section-tag">Protected API Workspace</span>
          <h1>Task Management Dashboard</h1>
          <p className="task-subtitle">
            MongoDB + Express REST Engine with JWT Role Protection
          </p>
        </div>

        <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
          <div className="backend-status">
            <span>●</span> Backend Connected
          </div>
          <button
            onClick={fetchTasks}
            style={{
              padding: "6px 12px",
              fontSize: "12px",
              fontWeight: "600",
              background: "var(--bg-surface)",
              color: "var(--text-secondary)",
              border: "1px solid var(--border-subtle)",
              borderRadius: "var(--radius-full)",
              cursor: "pointer",
            }}
          >
            ↻ Refresh
          </button>
        </div>
      </div>

      {/* Alert Notifications */}
      {message && <div className="success-message">✓ {message}</div>}
      {error && <div className="error-message">⚠ {error}</div>}

      {/* KPI Stat Metric Cards */}
      <div className="task-stats">
        <div className="stat-card">
          <h3>Total Tasks</h3>
          <strong>{tasks.length}</strong>
        </div>

        <div className="stat-card">
          <h3>Pending</h3>
          <strong style={{ color: "var(--warning)" }}>{pendingTasks}</strong>
        </div>

        <div className="stat-card">
          <h3>Completed</h3>
          <strong style={{ color: "var(--success)" }}>{completedTasks}</strong>
        </div>

        <div className="stat-card">
          <h3>High Priority</h3>
          <strong style={{ color: "var(--danger)" }}>{highPriorityTasks}</strong>
        </div>
      </div>

      {/* Create / Edit Form */}
      <div className="task-form">
        <h2>{editingId ? `Edit Task #${editingId}` : "Create New Task"}</h2>

        <input
          type="text"
          placeholder="Task Title (e.g. Train XGBoost model on customer dataset)"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />

        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "8px",
          }}
        >
          <label
            style={{
              fontSize: "12px",
              color: "var(--text-muted)",
              fontWeight: "600",
            }}
          >
            Description
          </label>
          <button
            type="button"
            onClick={handleGenerateDescription}
            disabled={aiLoading}
            style={{
              padding: "5px 12px",
              fontSize: "12px",
              fontWeight: "600",
              background: aiLoading
                ? "var(--bg-card)"
                : "rgba(56, 189, 248, 0.12)",
              color: "var(--cyan-bright)",
              border: "1px solid rgba(56, 189, 248, 0.3)",
              borderRadius: "var(--radius-full)",
              cursor: aiLoading ? "not-allowed" : "pointer",
              display: "inline-flex",
              alignItems: "center",
              gap: "6px",
              boxShadow: "none",
              margin: 0,
            }}
          >
            {aiLoading ? "✨ Generating..." : "✨ Auto-Generate with AI"}
          </button>
        </div>

        <textarea
          rows="4"
          placeholder="Detailed task description and requirements (or auto-generate with AI)..."
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />

        <div style={{ display: "flex", gap: "16px", flexWrap: "wrap", alignItems: "center", marginBottom: "16px" }}>
          <div style={{ flex: 1, minWidth: "200px" }}>
            <label style={{ fontSize: "12px", color: "var(--text-muted)", display: "block", marginBottom: "4px" }}>
              Priority Level
            </label>
            <select
              value={priority}
              onChange={(e) => setPriority(e.target.value)}
              style={{ margin: 0 }}
            >
              <option value="Low">Low Priority</option>
              <option value="Medium">Medium Priority</option>
              <option value="High">High Priority</option>
            </select>
          </div>

          <div style={{ paddingTop: "20px" }}>
            {editingId ? (
              <div className="form-buttons">
                <button onClick={handleUpdate}>Update Task</button>
                <button className="cancel-btn" onClick={cancelEdit}>
                  Cancel
                </button>
              </div>
            ) : (
              <button onClick={handleCreate}>+ Create Task</button>
            )}
          </div>
        </div>
      </div>

      {/* Search & Filter Toolbar */}
      <div className="task-filter">
        <input
          type="text"
          placeholder="🔍 Search tasks by title or details..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
        >
          <option value="all">All Statuses ({tasks.length})</option>
          <option value="pending">Pending ({pendingTasks})</option>
          <option value="completed">Completed ({completedTasks})</option>
        </select>

        <select
          value={priorityFilter}
          onChange={(e) => setPriorityFilter(e.target.value)}
        >
          <option value="all">All Priorities</option>
          <option value="High">High Priority</option>
          <option value="Medium">Medium Priority</option>
          <option value="Low">Low Priority</option>
        </select>
      </div>

      {/* Task List */}
      <div className="task-list">
        <h2>
          Active Tasks ({filteredTasks.length})
        </h2>

        {loading && (
          <div className="loading-message" style={{ textAlign: "center", padding: "40px" }}>
            Loading tasks from MongoDB...
          </div>
        )}

        {!loading && filteredTasks.length === 0 && (
          <div className="empty-message" style={{ textAlign: "center", padding: "40px", color: "var(--text-muted)" }}>
            No tasks found matching your filter criteria.
          </div>
        )}

        {!loading &&
          filteredTasks.map((task) => (
            <div
              className={`task-card ${task.completed ? "completed-task" : ""}`}
              key={task.id}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  flexWrap: "wrap",
                  gap: "8px",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                  <span
                    style={{
                      fontSize: "12px",
                      fontWeight: "700",
                      padding: "3px 8px",
                      borderRadius: "var(--radius-sm)",
                      background: "rgba(56, 189, 248, 0.12)",
                      color: "var(--cyan-bright)",
                      border: "1px solid rgba(56, 189, 248, 0.25)",
                    }}
                  >
                    Task #{task.id}
                  </span>

                  <span
                    style={{
                      fontSize: "11px",
                      fontWeight: "700",
                      padding: "3px 8px",
                      borderRadius: "var(--radius-full)",
                      background:
                        (task.priority || "Medium") === "High"
                          ? "rgba(239, 68, 68, 0.15)"
                          : (task.priority || "Medium") === "Medium"
                          ? "rgba(245, 158, 11, 0.15)"
                          : "rgba(16, 185, 129, 0.15)",
                      color:
                        (task.priority || "Medium") === "High"
                          ? "#ef4444"
                          : (task.priority || "Medium") === "Medium"
                          ? "#f59e0b"
                          : "#10b981",
                      border:
                        (task.priority || "Medium") === "High"
                          ? "1px solid rgba(239, 68, 68, 0.3)"
                          : (task.priority || "Medium") === "Medium"
                          ? "1px solid rgba(245, 158, 11, 0.3)"
                          : "1px solid rgba(16, 185, 129, 0.3)",
                    }}
                  >
                    {(task.priority || "Medium").toUpperCase()} PRIORITY
                  </span>
                </div>

                <span
                  style={{
                    fontSize: "12px",
                    fontWeight: "700",
                    padding: "3px 10px",
                    borderRadius: "var(--radius-full)",
                    background: task.completed
                      ? "rgba(16, 185, 129, 0.15)"
                      : "rgba(2, 132, 199, 0.15)",
                    color: task.completed ? "#10b981" : "var(--cyan-bright)",
                    border: task.completed
                      ? "1px solid rgba(16, 185, 129, 0.3)"
                      : "1px solid rgba(2, 132, 199, 0.3)",
                  }}
                >
                  {task.completed ? "✓ COMPLETED" : "⏳ PENDING"}
                </span>
              </div>

              <h3>{task.title}</h3>

              {task.description && <p>{task.description}</p>}

              <div
                style={{
                  display: "flex",
                  gap: "14px",
                  fontSize: "12px",
                  color: "var(--text-muted)",
                  flexWrap: "wrap",
                }}
              >
                <span>
                  Roll: <strong>{task.rollNo || "24AIML003"}</strong>
                </span>
                <span>
                  Status: <strong>{task.completed ? "Completed" : "Pending"}</strong>
                </span>
                <span>
                  Priority: <strong>{task.priority || "Medium"}</strong>
                </span>
              </div>

              {/* Action Toolbar */}
              <div className="task-actions">
                <button onClick={() => handleToggle(task)}>
                  {task.completed ? "Mark Pending" : "✓ Mark Complete"}
                </button>

                <button className="edit-btn" onClick={() => handleEdit(task)}>
                  ✎ Edit
                </button>

                <button className="delete-btn" onClick={() => handleDelete(task)}>
                  🗑 Delete
                </button>
              </div>
            </div>
          ))}
      </div>
    </div>
  );
}

export default TasksPage;