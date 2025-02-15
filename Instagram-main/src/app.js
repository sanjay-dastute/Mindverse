const express = require("express");
const { swaggerUi, specs } = require("./config/swagger");
const bodyParser = require("body-parser");
const dotenv = require("dotenv");
const userRoutes = require("./routes/userRoutes");
const authRoutes = require("./routes/authRoutes");
const mvAdminRoutes = require("./routes/mvAdminRoutes");
const cors = require("cors");

const { authenticateToken, authenticateMvToken } = require("./middleware/authMiddleware");
const { refreshTokens } = require("./controllers/userController");

dotenv.config();
const app = express();
app.use(bodyParser.json({ limit: "50mb" }));
app.use(bodyParser.urlencoded({ limit: "50mb", extended: true }));
app.use(express.json());

// CORS middleware
if (process.env.ENVIRONMENT === 'DEV') {
  app.use(cors());
  console.log('CORS enabled for development');
}

// Swagger UI setup
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(specs));

// Facebook router
app.use("/auth", authRoutes);

// User router
app.use("/users", authenticateToken, userRoutes);

// MV Admin router
app.use("/mv", authenticateMvToken, mvAdminRoutes);


// Execute refreshTokens immediately when the app starts
// refreshTokens();

// Run the refreshTokens function every X seconds
setInterval(refreshTokens, process.env.TOKEN_REFRESH_TIMEOUT);

const PORT = process.env.PORT || 3010;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
