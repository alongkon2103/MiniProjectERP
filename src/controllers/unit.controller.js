import { UnitModel } from "../models/unit.model.js";

export const UnitController = {
  async list(req, res) {
    try {
      const units = await UnitModel.findAll();
      res.json(units);
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  },

  async getById(req, res) {
    try {
      const unit = await UnitModel.findById(req.params.id);
      if (!unit) {
        return res.status(404).json({ message: "ไม่พบหน่วยนับนี้" });
      }
      res.json(unit);
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  },

  async create(req, res) {
    try {
      const unit = await UnitModel.create(req.body);
      res.status(201).json(unit);
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  },

  async update(req, res) {
    try {
      const unit = await UnitModel.update(req.params.id, req.body);
      res.json(unit);
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  },
};
