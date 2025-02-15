require("dotenv").config();
const axios = require("axios");

const baseUrl = process.env.AI_ENDPOINT;
async function createAiUser(organizationId) {
    try {
      const apiUrl = `${baseUrl}/org/create`
      const response = await axios.post(apiUrl, {
        org_id: organizationId
      });
      console.log(response.data);
      return response.data;
    } catch (error) {
      console.error("Error creating AI user:", error);
    }
  }
  module.exports = { createAiUser };