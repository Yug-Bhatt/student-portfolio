import { useEffect, useState } from "react";

function TasksPage() {
  const API = "http://localhost:5000/tasks";

  const [tasks, setTasks] = useState([]);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [editingId, setEditingId] = useState(null);

  // Fetch all tasks
  const fetchTasks = async () => {
    try {
      const response = await fetch(API);
      const data = await response.json();
      setTasks(data);
    } catch (error) {
      console.error("Error fetching tasks:", error);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  // Create Task
  const createTask = async () => {
    if (title.trim() === "") {
      alert("Please enter a task title.");
      return;
    }

    try {
      await fetch(API, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title,
          description,
        }),
      });

      alert("Task created successfully!");

      setTitle("");
      setDescription("");

      fetchTasks();
    } catch (error) {
      console.error(error);
    }
  };

  // Delete Task
  const deleteTask = async (id) => {
    try {
      await fetch(`${API}/${id}`, {
        method: "DELETE",
      });

      alert("Task deleted successfully!");

      fetchTasks();
    } catch (error) {
      console.error(error);
    }
  };

  // Edit Task
  const editTask = (task) => {
    setEditingId(task.id);
    setTitle(task.title);
    setDescription(task.description);
  };

  // Update Task
  const updateTask = async () => {
    try {
      await fetch(`${API}/${editingId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title,
          description,
          completed: false,
        }),
      });

      alert("Task updated successfully!");

      setEditingId(null);
      setTitle("");
      setDescription("");

      fetchTasks();
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div className="tasks-page">

      <div className="task-form">

        <div className="backend-status">
          🟢 Backend Connected
        </div>

        <h2>Create Task</h2>

        <input
          type="text"
          placeholder="Task Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />

        <textarea
          rows="5"
          placeholder="Task Description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />

        {editingId ? (
          <button onClick={updateTask}>Update Task</button>
        ) : (
          <button onClick={createTask}>Create Task</button>
        )}

      </div>

      <div className="task-list">

        <h2>Tasks ({tasks.length})</h2>

        {tasks.map((task) => (

          <div className="task-card" key={task.id}>

            <p><strong>Task ID:</strong> {task.id}</p>

            <h3>{task.title}</h3>

            <p>{task.description}</p>

            <p>
              <strong>Roll No:</strong> {task.rollNo}
            </p>

            <button
              className="edit-btn"
              onClick={() => editTask(task)}
            >
              Edit
            </button>

            <button
              className="delete-btn"
              onClick={() => deleteTask(task.id)}
            >
              Delete
            </button>

          </div>

        ))}

      </div>

    </div>
  );
}

export default TasksPage;