import express from "express";
import swaggerUi from "swagger-ui-express";
import { router } from "./routes/index.js";
import { buildSwaggerSpec } from "./config/swagger.js";

export const app = express();

app.use(express.json());
app.use("/api", router);

const swaggerSpec = buildSwaggerSpec();
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));
app.get("/api-docs.json", (req, res) => res.json(swaggerSpec));
