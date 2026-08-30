import { UserModel } from "../models/user.model.js";

export const UserController = {
  async list(req, res) {
    try {
      const users = await UserModel.findAll();
      res.json(users);
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  },

  async getById(req, res) {
    try {
      const user = await UserModel.findById(req.params.id);
      if (!user) {
        return res.status(404).json({ message: "ไม่พบผู้ใช้นี้" });
      }
      res.json(user);
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  },

  async create(req, res) {
    try {
      const user = await UserModel.create(req.body);
      res.status(201).json(user);
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  },

  async update(req, res) {
    try {
      const user = await UserModel.update(req.params.id, req.body);
      res.json(user);
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  },

  async deactivate(req, res) {
    try {
      const user = await UserModel.deactivate(req.params.id);
      res.json(user);
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  },
};
