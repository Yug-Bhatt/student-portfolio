const validateTaskInput = (req, res, next) => {
  const { title, priority } = req.body;

  // Title validation for task creation
  if (req.method === "POST") {
    if (!title || typeof title !== "string" || title.trim() === "") {
      return res.status(400).json({
        error: "Validation failed",
        message: "Task title is required",
      });
    }
  }

  // Title validation for task update (if provided)
  if (req.method === "PUT" && title !== undefined) {
    if (typeof title !== "string" || title.trim() === "") {
      return res.status(400).json({
        error: "Validation failed",
        message: "Task title cannot be empty",
      });
    }
  }

  // Priority validation (optional, but if provided must be Low, Medium, or High)
  if (priority !== undefined && priority !== null && priority !== "") {
    const validPriorities = ["Low", "Medium", "High"];
    if (!validPriorities.includes(priority)) {
      return res.status(400).json({
        error: "Validation failed",
        message: "Priority must be one of: Low, Medium, High",
      });
    }
  }

  next();
};

module.exports = {
  validateTaskInput,
};
