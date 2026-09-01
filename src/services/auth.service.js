import "dotenv/config";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { prisma } from "../config/prisma.js";

const JWT_SECRET = process.env.JWT_SECRET || "dev-secret";
const JWT_EXPIRES = "8h";

export const AuthService = {
  async register({ username, password, full_name, email }) {
    const password_hash = await bcrypt.hash(password, 10);
    const user = await prisma.app_user.create({
      data: { username, password_hash, full_name, email },
    });
    return { id: user.id, username: user.username, full_name: user.full_name };
  },

  async login(username, password) {
    const user = await prisma.app_user.findUnique({ where: { username } });
    if (!user) {
      throw new Error("username หรือ password ไม่ถูกต้อง");
    }

    const ok = await bcrypt.compare(password, user.password_hash);
    if (!ok) {
      throw new Error("username หรือ password ไม่ถูกต้อง");
    }
    if (!user.is_active) {
      throw new Error("บัญชีนี้ถูกปิดใช้งาน");
    }

    const userRoles = await prisma.user_role.findMany({
      where: { user_id: user.id },
      include: { role: true },
    });
    const roles = userRoles.map((ur) => ur.role.code);

    const payload = { id: user.id, username: user.username, roles };
    const token = jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES });
    return {
      token,
      user: { id: user.id, username: user.username, full_name: user.full_name, roles },
    };
  },
};
