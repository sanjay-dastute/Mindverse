const mongoose = require('mongoose');
const dotenv = require("dotenv");
dotenv.config();

let conn;

if (process.env.ENVIRONMENT === 'PROD_OLD') {
    const options = {
        tlsCAFile: `certs/global-bundle.pem`
    };

    conn = mongoose.createConnection(process.env.MONGO_URI + "/instagram?tls=true&replicaSet=rs0&readPreference=secondaryPreferred&retryWrites=false", options);
} else {
    conn = mongoose.createConnection(process.env.MONGO_URI + "/instagram?&authSource=admin");
}
conn.on('connected', () => {
    console.log('Instagram database connected successfully');
});
  
conn.on('error', (err) => {
    console.error('Instagram database connection error:', err);
});

conn.model('User', require('../models/userModel'));
conn.model('OtherUser', require('../models/otherUserModel'));
conn.model('OTP', require('../models/otpModel'));
conn.model('UniversalContext', require('../models/universalContextModel'));

module.exports = conn;