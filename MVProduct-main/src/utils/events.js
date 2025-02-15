const axios = require("axios");
const dotenv = require("dotenv");
dotenv.config();

// Function to save event via API endpoint
async function saveEvent(eventType, eventData) {
  try {
    const apiUrl = process.env.EVENT_ENDPOINT;
    console.log("Saving event: ",eventType, apiUrl);
    const response = await axios.post(apiUrl, {
      eventType,
      eventData,
    });
    console.log(response);
    return response;
  } catch (error) {
    console.error("Error saving event:", error);
  }
}
module.exports = { saveEvent };
