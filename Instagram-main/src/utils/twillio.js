const twilio = require("twilio");
require("dotenv").config();

const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const fromPhoneNumber = process.env.TWILIO_PHONE_NUMBER;

const client = new twilio(accountSid, authToken);

const sendOTPMsg = async (to, otp) => {
  client.messages
    .create({
      body: `Your OTP is: ${otp}`,
      to: "+" + to,
      from: fromPhoneNumber,
    })
    .then((message) => console.log(`OTP sent successfully: ${message.sid}`))
    .catch((error) => console.error(`Failed to send OTP: ${error.message}`));
};

module.exports = {
  sendOTPMsg,
};
