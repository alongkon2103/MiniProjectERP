import { Router } from "express";
import { PaymentController } from "../controllers/payment.controller.js";

export const paymentRouter = Router();

paymentRouter.get("/", PaymentController.list);
paymentRouter.get("/:id", PaymentController.getById);
paymentRouter.post("/", PaymentController.create);
paymentRouter.post("/:id/post", PaymentController.post); 
