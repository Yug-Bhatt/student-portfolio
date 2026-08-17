import { useEffect, useState } from "react";

import {
  getTasks,
  createTask,
  updateTask,
  deleteTask,
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

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] =
    useState("all");

  const [priorityFilter, setPriorityFilter] =
    useState("all");

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
      setLoading(true);
      setError("");

      const data = await getTasks();

      setTasks(data);
    } catch (err) {
      setError(
        "Unable to load tasks. Please make sure the backend is running."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTasks();
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

      setTasks((prev) => [
        ...prev,
        newTask,
      ]);

      setTitle("");
      setDescription("");
      setPriority("Medium");

      showMessage(
        "Task created successfully!"
      );
    } catch (err) {
      setError("Failed to create task.");
    }
  };

  // =========================
  // Start Editing
  // =========================

  const handleEdit = (task) => {
    setEditingId(task.id);

    setTitle(task.title);
    setDescription(task.description);

    setPriority(
      task.priority || "Medium"
    );

    setError("");
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

      const currentTask = tasks.find(
        (task) =>
          task.id === editingId
      );

      const updatedTask =
        await updateTask(editingId, {
          title,
          description,
          completed:
            currentTask?.completed || false,
          priority,
        });

      setTasks((prev) =>
        prev.map((task) =>
          task.id === editingId
            ? updatedTask
            : task
        )
      );

      setEditingId(null);

      setTitle("");
      setDescription("");
      setPriority("Medium");

      showMessage(
        "Task updated successfully!"
      );
    } catch (err) {
      setError("Failed to update task.");
    }
  };

  // =========================
  // Toggle Completion
  // =========================

  const handleToggle = async (task) => {
    try {
      setError("");

      const updatedTask =
        await updateTask(task.id, {
          title: task.title,
          description: task.description,
          completed: !task.completed,
          priority:
            task.priority || "Medium",
        });

      setTasks((prev) =>
        prev.map((item) =>
          item.id === task.id
            ? updatedTask
            : item
        )
      );

      showMessage(
        updatedTask.completed
          ? "Task marked as completed!"
          : "Task marked as pending!"
      );
    } catch (err) {
      setError(
        "Failed to update task status."
      );
    }
  };

  // =========================
  // Delete Task
  // =========================

  const handleDelete = async (task) => {
    const confirmed = window.confirm(
      `Are you sure you want to delete "${task.title}"?`
    );

    if (!confirmed) {
      return;
    }

    try {
      setError("");

      await deleteTask(task.id);

      setTasks((prev) =>
        prev.filter(
          (item) =>
            item.id !== task.id
        )
      );

      showMessage(
        "Task deleted successfully!"
      );
    } catch (err) {
      setError(
        "Failed to delete task."
      );
    }
  };

  // =========================
  // Cancel Editing
  // =========================

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

  const filteredTasks = tasks.filter(
    (task) => {
      const searchText =
        search.toLowerCase();

      const matchesSearch =
        task.title
          .toLowerCase()
          .includes(searchText) ||
        task.description
          .toLowerCase()
          .includes(searchText);

      const matchesStatus =
        statusFilter === "all" ||
        (statusFilter ===
          "completed" &&
          task.completed) ||
        (statusFilter ===
          "pending" &&
          !task.completed);

      const matchesPriority =
        priorityFilter === "all" ||
        (task.priority ||
          "Medium") ===
        priorityFilter;

      return (
        matchesSearch &&
        matchesStatus &&
        matchesPriority
      );
    }
  );

  // =========================
  // Statistics
  // =========================

  const completedTasks =
    tasks.filter(
      (task) => task.completed
    ).length;

  const pendingTasks =
    tasks.length -
    completedTasks;

  const highPriorityTasks =
    tasks.filter(
      (task) =>
        (task.priority ||
          "Medium") === "High"
    ).length;

  return (
    <div className="tasks-page">

      {/* Page Heading */}

      <h1>
        Task Management
      </h1>

      <p className="task-subtitle">
        React + Express + MongoDB
        Task Management
      </p>

      {/* Backend Status */}

      <div className="backend-status">
        🟢 Backend Connected
      </div>

      {/* Success Message */}

      {message && (
        <div className="success-message">
          ✓ {message}
        </div>
      )}

      {/* Error Message */}

      {error && (
        <div className="error-message">
          ⚠ {error}
        </div>
      )}

      {/* Statistics */}

      <div className="task-stats">

        <div className="stat-card">
          <h3>
            Total Tasks
          </h3>

          <strong>
            {tasks.length}
          </strong>
        </div>

        <div className="stat-card">
          <h3>
            Pending
          </h3>

          <strong>
            {pendingTasks}
          </strong>
        </div>

        <div className="stat-card">
          <h3>
            Completed
          </h3>

          <strong>
            {completedTasks}
          </strong>
        </div>

        <div className="stat-card">
          <h3>
            High Priority
          </h3>

          <strong>
            {highPriorityTasks}
          </strong>
        </div>

      </div>

      {/* Create / Edit Form */}

      <div className="task-form">

        <h2>
          {editingId
            ? "Edit Task"
            : "Create Task"}
        </h2>

        <input
          type="text"
          placeholder="Task Title"
          value={title}
          onChange={(e) =>
            setTitle(e.target.value)
          }
        />

        <textarea
          rows="5"
          placeholder="Task Description"
          value={description}
          onChange={(e) =>
            setDescription(
              e.target.value
            )
          }
        />

        {/* Priority */}

        <select
          value={priority}
          onChange={(e) =>
            setPriority(
              e.target.value
            )
          }
        >
          <option value="Low">
            Low Priority
          </option>

          <option value="Medium">
            Medium Priority
          </option>

          <option value="High">
            High Priority
          </option>
        </select>

        {/* Buttons */}

        {editingId ? (
          <div className="form-buttons">

            <button
              onClick={handleUpdate}
            >
              Update Task
            </button>

            <button
              className="cancel-btn"
              onClick={cancelEdit}
            >
              Cancel
            </button>

          </div>
        ) : (
          <button
            onClick={handleCreate}
          >
            Create Task
          </button>
        )}

      </div>

      {/* Search + Filters */}

      <div className="task-filter">

        <input
          type="text"
          placeholder="Search tasks..."
          value={search}
          onChange={(e) =>
            setSearch(
              e.target.value
            )
          }
        />

        {/* Status Filter */}

        <select
          value={statusFilter}
          onChange={(e) =>
            setStatusFilter(
              e.target.value
            )
          }
        >
          <option value="all">
            All Status
          </option>

          <option value="pending">
            Pending
          </option>

          <option value="completed">
            Completed
          </option>
        </select>

        {/* Priority Filter */}

        <select
          value={priorityFilter}
          onChange={(e) =>
            setPriorityFilter(
              e.target.value
            )
          }
        >
          <option value="all">
            All Priorities
          </option>

          <option value="Low">
            Low
          </option>

          <option value="Medium">
            Medium
          </option>

          <option value="High">
            High
          </option>
        </select>

      </div>

      {/* Task List */}

      <div className="task-list">

        <h2>
          Tasks ({filteredTasks.length})
        </h2>

        {/* Loading */}

        {loading && (
          <div className="loading-message">
            Loading tasks...
          </div>
        )}

        {/* Empty */}

        {!loading &&
          filteredTasks.length ===
          0 && (
            <div className="empty-message">
              No tasks found.
            </div>
          )}

        {/* Tasks */}

        {!loading &&
          filteredTasks.map(
            (task) => (
              <div
                className={`task-card ${task.completed
                    ? "completed-task"
                    : ""
                  }`}
                key={task.id}
              >

                <p>
                  <strong>
                    Task ID:
                  </strong>{" "}
                  {task.id}
                </p>

                <h3>
                  {task.title}
                </h3>

                <p>
                  {task.description}
                </p>

                <p>
                  <strong>
                    Roll No:
                  </strong>{" "}
                  {task.rollNo}
                </p>

                <p>
                  <strong>
                    Status:
                  </strong>{" "}
                  {task.completed
                    ? "Completed"
                    : "Pending"}
                </p>

                <p>
                  <strong>
                    Priority:
                  </strong>{" "}
                  {task.priority ||
                    "Medium"}
                </p>

                {/* Actions */}

                <div className="task-actions">

                  <button
                    onClick={() =>
                      handleToggle(
                        task
                      )
                    }
                  >
                    {task.completed
                      ? "Mark Pending"
                      : "✓ Complete"}
                  </button>

                  <button
                    className="edit-btn"
                    onClick={() =>
                      handleEdit(
                        task
                      )
                    }
                  >
                    Edit
                  </button>

                  <button
                    className="delete-btn"
                    onClick={() =>
                      handleDelete(
                        task
                      )
                    }
                  >
                    Delete
                  </button>

                </div>

              </div>
            )
          )}

      </div>

    </div>
  );
}

export default TasksPage;