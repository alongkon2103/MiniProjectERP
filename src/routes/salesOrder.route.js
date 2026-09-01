import { Router } from "express";
import { SalesOrderController } from "../controllers/salesOrder.controller.js";

export const salesOrderRouter = Router();

salesOrderRouter.get("/", SalesOrderController.list);
salesOrderRouter.get("/:id", SalesOrderController.getById);
salesOrderRouter.post("/", SalesOrderController.create);
salesOrderRouter.put("/:id", SalesOrderController.update);
salesOrderRouter.post("/:id/approve", SalesOrderController.approve); // อนุมัติ
salesOrderRouter.post("/:id/cancel", SalesOrderController.cancel);   // ยกเลิก
