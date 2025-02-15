const swaggerJsdoc = require("swagger-jsdoc");
const swaggerUi = require("swagger-ui-express");

const options = {
  definition: {
    openapi: "3.0.0", // Specification (optional, defaults to swagger: '2.0')
    info: {
      title: "API Documentation", // Title (required)
      version: "1.0.0", // Version (required)
    },
    servers: [
      {
        url: "http://localhost:3011/products", // Server URL
      },
    ],
  },
  // Paths to files containing OpenAPI definitions
  apis: ["./src/routes/*.js"], // Path to the API docs
};

const specs = swaggerJsdoc(options);

module.exports = { swaggerUi, specs };
