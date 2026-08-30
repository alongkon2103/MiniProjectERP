import { AccountModel } from "../models/account.model.js";

export const AccountController = {
  async list(req, res) {
    try {
      const accounts = await AccountModel.findAll();
      res.json(accounts);
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  },

  async getById(req, res) {
    try {
      const account = await AccountModel.findById(req.params.id);
      if (!account) {
        return res.status(404).json({ message: "ไม่พบบัญชีนี้" });
      }
      res.json(account);
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  },

  async create(req, res) {
    try {
      const account = await AccountModel.create(req.body);
      res.status(201).json(account);
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  },

  async update(req, res) {
    try {
      const account = await AccountModel.update(req.params.id, req.body);
      res.json(account);
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  },

  async deactivate(req, res) {
    try {
      const account = await AccountModel.deactivate(req.params.id);
      res.json(account);
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  },
};
