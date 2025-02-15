const mongoose = require('mongoose');
const dotenv = require("dotenv");
dotenv.config();

let conn;

if (process.env.ENVIRONMENT === 'PROD_OLD') {
    const options = {
        tlsCAFile: `certs/global-bundle.pem`
    };

    conn = mongoose.createConnection(process.env.MONGO_URI + "/mv-support?tls=true&replicaSet=rs0&readPreference=secondaryPreferred&retryWrites=false", options);
} else {
    conn = mongoose.createConnection(process.env.MONGO_URI + "/mv-support?authSource=admin");
}

conn.on('connected', () => {
    console.log('MV Support database connected successfully');
});
  
conn.on('error', (err) => {
    console.error('MV Support database connection error:', err);
});

conn.model('SupportRequest', require('../models/supportRequestModel'));


module.exports = conn;