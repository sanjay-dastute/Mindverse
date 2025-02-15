const mongoose = require('mongoose');
const dotenv = require("dotenv");
const logger = require('../utils/logger');
const ProductSchema = require('../models/productModel');
dotenv.config();

let conn = mongoose.createConnection();

// Register models with schemas
conn.model('Product', ProductSchema);

const connectWithRetry = async () => {
    try {
        const options = {
            serverSelectionTimeoutMS: 5000,
            socketTimeoutMS: 45000,
            heartbeatFrequencyMS: 10000,
            retryWrites: true,
            retryReads: true,
            ...(process.env.ENVIRONMENT === 'PROD_OLD' ? { tlsCAFile: `certs/global-bundle.pem` } : {})
        };

        const dbUrl = process.env.ENVIRONMENT === 'PROD_OLD'
            ? `${process.env.MONGO_URI}/mv-products?tls=true&replicaSet=rs0&readPreference=secondaryPreferred&retryWrites=false`
            : `${process.env.MONGO_URI}/mv-product?authSource=admin`;

        await conn.openUri(dbUrl, options);
        logger.info('MV Product database connected successfully');
        return true;
    } catch (err) {
        logger.error('Error connecting to MV Product database:', err);
        setTimeout(connectWithRetry, 5000);
        return false;
    }
};

conn.on('error', (err) => {
    logger.error('MV Product database connection error:', err);
    setTimeout(connectWithRetry, 5000);
});

conn.on('disconnected', () => {
    logger.warn('MV Product database disconnected. Attempting to reconnect...');
    setTimeout(connectWithRetry, 5000);
});

// Export both the connection and connect function
module.exports = conn;
module.exports.connect = connectWithRetry;
