import { Router } from "express";
import { CustomerController } from "../controllers/customer.controller.js";

export const customerRouter = Router();

customerRouter.get("/", CustomerController.list);
customerRouter.get("/:id", CustomerController.getById);
customerRouter.post("/", CustomerController.create);
customerRouter.put("/:id", CustomerController.update);
customerRouter.delete("/:id", CustomerController.deactivate);
