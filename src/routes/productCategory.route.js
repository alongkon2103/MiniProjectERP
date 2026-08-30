import { Router } from "express";
import { ProductCategoryController } from "../controllers/productCategory.controller.js";

export const productCategoryRouter = Router();

productCategoryRouter.get("/", ProductCategoryController.list);
productCategoryRouter.get("/:id", ProductCategoryController.getById);
productCategoryRouter.post("/", ProductCategoryController.create);
productCategoryRouter.put("/:id", ProductCategoryController.update);
