import { ProductCategoryModel } from "../models/productCategory.model.js";

export const ProductCategoryController = {
  async list(req, res) {
    try {
      const categories = await ProductCategoryModel.findAll();
      res.json(categories);
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  },

  async getById(req, res) {
    try {
      const category = await ProductCategoryModel.findById(req.params.id);
      if (!category) {
        return res.status(404).json({ message: "ไม่พบหมวดหมู่นี้" });
      }
      res.json(category);
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  },

  async create(req, res) {
    try {
      const category = await ProductCategoryModel.create(req.body);
      res.status(201).json(category);
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  },

  async update(req, res) {
    try {
      const category = await ProductCategoryModel.update(req.params.id, req.body);
      res.json(category);
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  },
};
