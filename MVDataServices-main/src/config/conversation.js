const mongoose = require('mongoose');
const dotenv = require("dotenv");
const logger = require('winston');
const ConversationSchema = require('../models/conversationModel');
const NotificationSchema = require('../models/notificationModel');
dotenv.config();

let conn = mongoose.createConnection();

// Register models with schemas
conn.model('Conversation', ConversationSchema);
conn.model('Notification', NotificationSchema);

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
            ? `${process.env.MONGO_URI}/mv-conversation?tls=true&replicaSet=rs0&readPreference=secondaryPreferred&retryWrites=false`
            : `${process.env.MONGO_URI}/mv-conversation?authSource=admin`;

        if (!conn) {
            conn = mongoose.createConnection();
        }

        await conn.openUri(dbUrl, options);

        // Register models
        conn.model('Conversation', require('../models/conversationModel'));
        conn.model('Notification', require('../models/notificationModel'));

        conn.on('connected', () => {
            logger.info('Conversation database connected successfully');
        });

        conn.on('error', (err) => {
            logger.error('Conversation database connection error:', err);
            setTimeout(connectWithRetry, 5000);
        });

        conn.on('disconnected', () => {
            logger.warn('Conversation database disconnected. Attempting to reconnect...');
            setTimeout(connectWithRetry, 5000);
        });

        return conn;
    } catch (err) {
        logger.error('Error connecting to conversation database:', err);
        setTimeout(connectWithRetry, 5000);
        return null;
    }
};

// Initial connection and export
connectWithRetry();

// Export the connection instance
module.exports = conn;

// Also export the connect function for explicit connection management
module.exports.connect = connectWithRetry;
