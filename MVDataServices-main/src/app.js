const express = require('express');
const { swaggerUi, specs } = require('./config/swagger');
const dotenv = require('dotenv');
const conversationConnection = require('./config/conversation');
const userConnection = require('./config/user');
const supportConnection = require('./config/support');
const productConnection = require('./config/product');
const paymentConnection = require('./config/payment');
const userRoutes = require("./routes/userRoutes");
const mvAdminRoutes = require("./routes/mvAdminRoutes");
const supportRoutes = require("./routes/supportRoutes");
const productRoutes = require("./routes/productRoutes");
const otherUserRoutes = require("./routes/otherUserRoutes");
const conversationRoutes = require("./routes/conversationRoutes");
const notificationRoutes = require('./routes/notificationRoutes');
const paymentRoutes = require("./routes/paymentRoutes");

const cors = require("cors");

dotenv.config();

const app = express();

app.use(express.json({limit: '50mb'}));
app.use(express.urlencoded({limit: '50mb'}));


// CORS middleware
if (process.env.ENVIRONMENT === 'DEV') {
  app.use(cors());
  console.log('CORS enabled for development');
}

app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({ message: "An unexpected error occurred" });
});

// Swagger UI setup
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(specs));

app.use('/users', userRoutes);

app.use('/other-user', otherUserRoutes);

app.use('/mv-admin', mvAdminRoutes);

app.use('/mv-support', supportRoutes);

app.use('/mv-product', productRoutes);

app.use('/mv-conversation', conversationRoutes);

app.use('/mv-notifications', notificationRoutes);

app.use('/payments', paymentRoutes);

const PORT = process.env.PORT || 3013;

const startServer = async () => {
  try {
    await conversationConnection.asPromise();
    await userConnection.asPromise();
    await supportConnection.asPromise();
    await productConnection.asPromise();
    await paymentConnection.asPromise();
    
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  } catch (error) {
    console.error('Failed to connect to databases:', error);
    process.exit(1);
  }
};

startServer();