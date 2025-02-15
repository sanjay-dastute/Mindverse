const express = require("express");
const { swaggerUi, specs } = require("./config/swagger");
const dotenv = require("dotenv");
const productRoutes = require("./routes/productRoutes");
const cors = require("cors");
const { authenticateToken } = require("./middleware/authMiddleware");

dotenv.config();
const app = express();

// Increase payload size limit
app.use(express.json({limit: '50MB'}));
app.use(express.urlencoded({limit: '50MB', extended: true}));

// CORS middleware
if (process.env.ENVIRONMENT === 'DEV') {
  app.use(cors());
  console.log('CORS enabled for development');
}

// Swagger UI setup
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(specs));

// Product router
app.use("/products", authenticateToken, productRoutes);

const PORT = process.env.PORT || 3011;
const startServer = async () => {
  try {
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  } catch (error) {
    console.error('Failed to connect to databases:', error);
    process.exit(1);
  }
};

startServer();