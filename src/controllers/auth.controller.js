import { AuthService } from "../services/auth.service.js";

export const AuthController = {
  async register(req, res) {
    try {
      const { username, password, full_name, email } = req.body;
      if (!username || !password) {
        return res.status(400).json({ message: "ต้องระบุ username และ password" });
      }
      const user = await AuthService.register({ username, password, full_name, email });
      res.status(201).json(user);
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  },

  async login(req, res) {
    try {
      const { username, password } = req.body;
      const result = await AuthService.login(username, password);
      res.json(result);
    } catch (err) {
      res.status(401).json({ message: err.message });
    }
  },

  async me(req, res) {
    res.json(req.user);
  },
};
