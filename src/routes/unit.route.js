import { Router } from "express";
import { UnitController } from "../controllers/unit.controller.js";

export const unitRouter = Router();

unitRouter.get("/", UnitController.list);
unitRouter.get("/:id", UnitController.getById);
unitRouter.post("/", UnitController.create);
unitRouter.put("/:id", UnitController.update);
