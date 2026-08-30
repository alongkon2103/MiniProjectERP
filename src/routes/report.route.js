import { Router } from "express";
import { ReportController } from "../controllers/report.controller.js";

export const reportRouter = Router();

reportRouter.get("/trial-balance", ReportController.trialBalance);
