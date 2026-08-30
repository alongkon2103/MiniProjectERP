import { Router } from "express";
import { GoodsReceiptController } from "../controllers/goodsReceipt.controller.js";

export const goodsReceiptRouter = Router();

goodsReceiptRouter.get("/", GoodsReceiptController.list);
goodsReceiptRouter.get("/:id", GoodsReceiptController.getById);
goodsReceiptRouter.post("/", GoodsReceiptController.create);
goodsReceiptRouter.post("/:id/post", GoodsReceiptController.post); 
