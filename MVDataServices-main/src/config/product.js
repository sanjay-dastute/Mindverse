const mongoose = require('mongoose');
const dotenv = require("dotenv");
const path = require('path');
dotenv.config();

let conn;

if (process.env.ENVIRONMENT === 'PROD_OLD') {
    const options = {
        tlsCAFile: `certs/global-bundle.pem`
    };

    conn = mongoose.createConnection(process.env.MONGO_URI + "/mv-products?tls=true&replicaSet=rs0&readPreference=secondaryPreferred&retryWrites=false", options);
} else {
    conn = mongoose.createConnection(process.env.MONGO_URI + "/mv-product?authSource=admin");
}

conn.on('connected', () => {
    console.log('MV Product database connected successfully');
});

conn.on('error', (err) => {
    console.error('MV Product database connection error:', err);
});

conn.model('Product', require('../models/productModel'));

module.exports = conn;