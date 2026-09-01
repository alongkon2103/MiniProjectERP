import { Router } from "express";
import { ReceiptController } from "../controllers/receipt.controller.js";

export const receiptRouter = Router();

receiptRouter.get("/", ReceiptController.list);
receiptRouter.get("/:id", ReceiptController.getById);
receiptRouter.post("/", ReceiptController.create);
receiptRouter.post("/:id/post", ReceiptController.post); // ลงบัญชีรับเงิน
