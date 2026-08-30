import { ProductModel } from "../models/product.model.js";

export const ProductController = {
  async list(req, res) {
    try {
      const products = await ProductModel.findAllWithStock();
      res.json(products);
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  },

  async lowStock(req, res) {
    try {
      const products = await ProductModel.findAllWithStock();
      const low = products.filter((p) => p.low_stock);
      res.json(low);
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  },

  async getById(req, res) {
    try {
      const product = await ProductModel.findById(req.params.id);
      if (!product) {
        return res.status(404).json({ message: "ไม่พบสินค้านี้" });
      }
      const onHand = await ProductModel.getOnHand(product.id);
      product.on_hand = onHand;
      product.low_stock = onHand <= Number(product.reorder_point);
      res.json(product);
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  },

  async create(req, res) {
    try {
      const product = await ProductModel.create(req.body);
      res.status(201).json(product);
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  },

  async update(req, res) {
    try {
      const product = await ProductModel.update(req.params.id, req.body);
      res.json(product);
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  },

  async deactivate(req, res) {
    try {
      const product = await ProductModel.deactivate(req.params.id);
      res.json(product);
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  },
};
