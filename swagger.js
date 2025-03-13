const swaggerJsdoc = require("swagger-jsdoc");
const swaggerUi = require("swagger-ui-express");

const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Todo API",
      version: "1.0.0",
      description: "A simple Todo API with authentication and file uploads",
    },
    servers: [
      {
        url: "http://localhost:3000",
      },
    ],
    components: {
      securitySchemes: {
        BearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
        },
      },
      schemas: {
        Todo: {
          type: "object",
          properties: {
            _id: {
              type: "string",
              example: "65fc9e29bcd2dbb0e8a293bd",
            },
            title: {
              type: "string",
              example: "Buy groceries",
            },
            description: {
              type: "string",
              example: "Milk, Eggs, Bread",
            },
            completed: {
              type: "boolean",
              example: false,
            },
            image: {
              type: "string",
              example: "/uploads/task-image.jpg",
            },
          },
        },
      },
    },
    security: [
      {
        BearerAuth: [],
      },
    ],
  },
  apis: ["./routes/*.js"], // Make sure this matches your route file locations
};

const specs = swaggerJsdoc(options);

const swaggerDocs = (app) => {
  app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(specs));
};

module.exports = swaggerDocs;
