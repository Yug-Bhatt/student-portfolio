const jwt = require("jsonwebtoken");

const authMiddleware = (req, res, next) => {
  try {
    const authHeader = req.headers["authorization"] || req.headers["Authorization"];

    if (!authHeader) {
      return res.status(401).json({
        error: "Unauthorized",
        message: "Authorization header is missing",
      });
    }

    if (!authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        error: "Unauthorized",
        message: "Invalid authorization format. Format must be: Bearer <token>",
      });
    }

    const token = authHeader.split(" ")[1];

    if (!token || token.trim() === "") {
      return res.status(401).json({
        error: "Unauthorized",
        message: "Token is missing",
      });
    }

    const secret = process.env.JWT_SECRET;
    if (!secret) {
      console.error("JWT_SECRET environment variable is not defined");
      return res.status(500).json({
        error: "Server configuration error",
        message: "JWT_SECRET is not configured",
      });
    }

    const decoded = jwt.verify(token, secret);
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({
      error: "Unauthorized",
      message: "Invalid or expired token",
    });
  }
};

module.exports = authMiddleware;
