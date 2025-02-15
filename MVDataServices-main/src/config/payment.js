const mongoose = require('mongoose');
const dotenv = require("dotenv");
dotenv.config();

let conn;

if (process.env.ENVIRONMENT === 'PROD_OLD') {
    const options = {
        tlsCAFile: `certs/global-bundle.pem`
    };

    conn = mongoose.createConnection(process.env.MONGO_URI + "/payments?tls=true&replicaSet=rs0&readPreference=secondaryPreferred&retryWrites=false", options);
} else {
    conn = mongoose.createConnection(process.env.MONGO_URI + "/payments?authSource=admin");
}

conn.on('connected', () => {
    console.log('Payment database connected successfully');
});
  
conn.on('error', (err) => {
    console.error('Payment database connection error:', err);
});

conn.model('Payment', require('../models/paymentModel'));
conn.model('Subscription', require('../models/subscriptionModel'));

module.exports = conn;