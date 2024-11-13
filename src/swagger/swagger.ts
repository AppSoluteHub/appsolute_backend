import swaggerJsDoc from "swagger-jsdoc";
import swaggerUi from "swagger-ui-express";
import * as swaggerDocument from "../../swagger.json";
import { Express } from "express";
import path from "path";

const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "SoundRig API",
      version: "1.0.0",
    },
  },
  servers: [
    {
      url: "http://localhost:3000/api",
      description: "Local server",
    },
  ],
  apis: [path.join(__dirname, "../**/*.ts")],
};

const swaggerSpec = swaggerJsDoc(options);

const setupSwagger = (app: Express) => {
  app.use("/", swaggerUi.serve, swaggerUi.setup(swaggerDocument));
};

export default setupSwagger;
