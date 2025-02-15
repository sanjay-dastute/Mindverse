const mongoose = require('mongoose');
const dotenv = require("dotenv");
dotenv.config();

let conn;

if (process.env.ENVIRONMENT === 'PROD_OLD') {
    const options = {
        tlsCAFile: `certs/global-bundle.pem`
    };

    conn = mongoose.createConnection(process.env.MONGO_URI + "/mv-conversation?tls=true&replicaSet=rs0&readPreference=secondaryPreferred&retryWrites=false", options);
} else {
    conn = mongoose.createConnection(process.env.MONGO_URI + "/mv-conversation?authSource=admin");
}

conn.on('connected', () => {
    console.log('Conversation database connected successfully');
});
  
conn.on('error', (err) => {
    console.error('Conversation database connection error:', err);
});

conn.model('Conversation', require('../models/conversationModel'));
conn.model('Notification', require('../models/notificationModel'));

module.exports = conn;