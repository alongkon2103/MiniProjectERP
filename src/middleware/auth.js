import "dotenv/config";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "dev-secret";


export function authMiddleware(req, res, next) {
  const header = req.headers.authorization || "";
  const token = header.startsWith("Bearer ") ? header.slice(7) : null;

  if (!token) {
    return res.status(401).json({ message: "ต้องล็อกอินก่อน (ไม่มี token)" });
  }

  try {
    const payload = jwt.verify(token, JWT_SECRET);
    req.user = payload;
    next();
  } catch (err) {
    return res.status(401).json({ message: "token ไม่ถูกต้องหรือหมดอายุ" });
  }
}

export function requireRole(...roles) {
  return (req, res, next) => {
    const userRoles = req.user?.roles || [];

    if (userRoles.includes("ADMIN")) {
      return next();
    }

    const allowedRole = roles.find((role) => {
      return userRoles.includes(role);
    });
    const allowed = allowedRole !== undefined;
    if (!allowed) {
      return res.status(403).json({ message: "ไม่มีสิทธิ์ทำรายการนี้" });
    }
    next();
  };
}
