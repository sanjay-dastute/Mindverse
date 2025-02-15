const mongoose = require('mongoose');
const dotenv = require("dotenv");
const logger = require('../utils/logger');
const UserSchema = require('../models/userModel');
const OtherUserSchema = require('../models/otherUserModel');
const OTPSchema = require('../models/otpModel');
const UniversalContextSchema = require('../models/universalContextModel');
dotenv.config();

let conn = mongoose.createConnection();

// Register models with schemas
conn.model('User', UserSchema);
conn.model('OtherUser', OtherUserSchema);
conn.model('OTP', OTPSchema);
conn.model('UniversalContext', UniversalContextSchema);

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
            ? `${process.env.MONGO_URI}/instagram?tls=true&replicaSet=rs0&readPreference=secondaryPreferred&retryWrites=false`
            : `${process.env.MONGO_URI}/instagram?authSource=admin`;

        if (!conn) {
            conn = mongoose.createConnection();
        }

        await conn.openUri(dbUrl, options);

        // Register models
        conn.model('User', require('../models/userModel'));
        conn.model('OtherUser', require('../models/otherUserModel'));
        conn.model('OTP', require('../models/otpModel'));
        conn.model('UniversalContext', require('../models/universalContextModel'));

        conn.on('connected', () => {
            logger.info('Instagram database connected successfully');
        });

        conn.on('error', (err) => {
            logger.error('Instagram database connection error:', err);
            setTimeout(connectWithRetry, 5000);
        });

        conn.on('disconnected', () => {
            logger.warn('Instagram database disconnected. Attempting to reconnect...');
            setTimeout(connectWithRetry, 5000);
        });

        return conn;
    } catch (err) {
        logger.error('Error connecting to Instagram database:', err);
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
