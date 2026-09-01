const API_URL = "http://localhost:5000";

// Reusable helper for Authorization headers
export const getAuthHeaders = () => {
  const token = localStorage.getItem("token");
  const headers = {
    "Content-Type": "application/json",
  };

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  return headers;
};

// Handle 401 Unauthorized globally
const handleAuthError = (response) => {
  if (response.status === 401) {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    window.dispatchEvent(new Event("authChange"));

    if (
      typeof window !== "undefined" &&
      !window.location.pathname.includes("/login")
    ) {
      window.location.href = "/login";
    }
  }
};

// =========================
// Authentication API Calls
// =========================

export const registerUser = async (userData) => {
  const response = await fetch(`${API_URL}/register`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(userData),
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data.message || "Registration failed");
  }

  return data;
};

export const loginUser = async (credentials) => {
  const response = await fetch(`${API_URL}/login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(credentials),
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data.message || "Login failed");
  }

  return data;
};

export const logout = () => {
  localStorage.removeItem("token");
  localStorage.removeItem("user");
  window.dispatchEvent(new Event("authChange"));
};

export const isAuthenticated = () => {
  return Boolean(localStorage.getItem("token"));
};

export const getStoredUser = () => {
  try {
    const userStr = localStorage.getItem("user");
    return userStr ? JSON.parse(userStr) : null;
  } catch {
    return null;
  }
};

// =========================
// Protected Task API Calls
// =========================

export const getTasks = async () => {
  const response = await fetch(`${API_URL}/tasks`, {
    headers: getAuthHeaders(),
  });

  if (!response.ok) {
    handleAuthError(response);
    const errData = await response.json().catch(() => ({}));
    throw new Error(errData.message || "Failed to fetch tasks");
  }

  return response.json();
};

export const getTask = async (id) => {
  const response = await fetch(`${API_URL}/tasks/${id}`, {
    headers: getAuthHeaders(),
  });

  if (!response.ok) {
    handleAuthError(response);
    const errData = await response.json().catch(() => ({}));
    throw new Error(errData.message || "Failed to fetch task");
  }

  return response.json();
};

export const createTask = async (task) => {
  const response = await fetch(`${API_URL}/tasks`, {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify(task),
  });

  if (!response.ok) {
    handleAuthError(response);
    const errData = await response.json().catch(() => ({}));
    throw new Error(errData.message || "Failed to create task");
  }

  return response.json();
};

export const updateTask = async (id, task) => {
  const response = await fetch(`${API_URL}/tasks/${id}`, {
    method: "PUT",
    headers: getAuthHeaders(),
    body: JSON.stringify(task),
  });

  if (!response.ok) {
    handleAuthError(response);
    const errData = await response.json().catch(() => ({}));
    throw new Error(errData.message || "Failed to update task");
  }

  return response.json();
};

export const deleteTask = async (id) => {
  const response = await fetch(`${API_URL}/tasks/${id}`, {
    method: "DELETE",
    headers: getAuthHeaders(),
  });

  if (!response.ok) {
    handleAuthError(response);
    const errData = await response.json().catch(() => ({}));
    throw new Error(errData.message || "Failed to delete task");
  }

  return response.json();
};