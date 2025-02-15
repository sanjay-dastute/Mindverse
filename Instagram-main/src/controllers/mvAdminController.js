// src/controllers/mvAdminController.js
const axios = require("axios");
const { getInstagramAccount } = require("../utils/facebook");
const DATA_SERVICE_URL = process.env.DATA_SERVICE_URL

// Get all Users
const getAllUsers = async (req, res) => {
  try {
    console.log('Requesting all users from data service');

    const response = await axios.get(`${DATA_SERVICE_URL}/mv-admin/all-users`);
    
    if (!response.data || response.data.length === 0) {
      console.log('No users returned from data service');
      return res.status(404).json({ message: "No users found" });
    }

    // Create an array of promises for Instagram profile fetches
    const profileFetchPromises = response.data.map(user => 
      getInstagramAccount(user.facebookPageId, user.longLivedAccessToken)
        .then(instaProfileDetails => ({
          ...user,
          profilePictureUrl: instaProfileDetails.instagram_business_account.profile_picture_url
        }))
        .catch(error => {
          console.log(`Error fetching Instagram profile for user ${user.instagramUserName}:`, error.message);
          return {
            ...user,
            profilePictureUrl: null
          };
        })
    );

    // Execute all promises in parallel
    const usersWithProfiles = await Promise.all(profileFetchPromises);

    const sanitizedUsers = usersWithProfiles.map((user) => {
      const activePrompt = user.prompts && user.prompts.find(prompt => prompt.isActive);
      return {
        organizationId: user.organizationId,
        instagramUserName: user.instagramUserName,
        contactPerson: user.contactPerson,
        contactPhoneNumber: user.contactPhoneNumber ? "+" + user.contactPhoneNumber : '',
        prompt: activePrompt ? activePrompt.prompt : null,
        profilePictureUrl: user.profilePictureUrl,
      };
    });

    console.log(`Successfully fetched and sanitized ${sanitizedUsers.length} users`);
    res.status(200).json(sanitizedUsers);
  } catch (error) {
    console.log('Error fetching users from data service:', error.message);
    res.status(500).json({ message: "Internal server error" });
  }
};
// Get all universal contexts
const getAllUniversalContexts = async (req, res) => {
  try {
    const response = await axios.get(`${DATA_SERVICE_URL}/mv-admin/universal-context`);
    res.status(200).json(response.data);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Update a universal context
const updateUniversalContext = async (req, res) => {
  try {
    const { id } = req.params;
    const { isActive, prompt } = req.body;

    console.log(`Requesting to update universal context with ID: ${id}`);

    const response = await axios.put(
      `${DATA_SERVICE_URL}/mv-admin/universal-context/${id}`,
      { isActive, prompt }
    );

    console.log(`Successfully updated universal context with ID: ${id}`);
    res.status(response.status).json(response.data);
  } catch (error) {
    console.log('Error updating universal context in data service:', error.message);
    res.status(500).json({ message: "Error updating universal context" });
  }
};

const getOrganizationInsights = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;

    if (!startDate) {
      console.log('Request made without required parameter');
      return res.status(400).json({ message: "Bad request: startDate is required" });
    }

    console.log(`Fetching aggregate data, startDate: ${startDate}, endDate: ${endDate || 'not provided'}`);

    // Prepare the date parameters
    const dateParams = endDate ? `startDate=${startDate}&endDate=${endDate}` : `startDate=${startDate}`;

    // Fetch all data in parallel
    const [
      messageCountResponse,
      userCountResponse,
      supportRequestsResponse,
      inactiveUserResponse,
      activeUserResponse
    ] = await Promise.allSettled([
      axios.get(`${DATA_SERVICE_URL}/mv-admin/message/count?${dateParams}`),
      axios.get(`${DATA_SERVICE_URL}/mv-admin/users/count?${dateParams}`),
      axios.get(`${DATA_SERVICE_URL}/mv-admin/support-requests/count?status=Open`),
      axios.get(`${DATA_SERVICE_URL}/mv-admin/inactive-user/count?${dateParams}`),
      axios.get(`${DATA_SERVICE_URL}/mv-admin/active-user/count?${dateParams}`)
    ]);

    // Combine all responses
    const combinedResponse = {
      messageData: messageCountResponse.status === 'fulfilled' ? messageCountResponse.value.data : null,
      organizationCount: userCountResponse.status === 'fulfilled' ? userCountResponse.value.data.count : null,
      openSupportRequests: supportRequestsResponse.status === 'fulfilled' ? supportRequestsResponse.value.data.requestCount : null,
      inactiveUserCount: inactiveUserResponse.status === 'fulfilled' ? inactiveUserResponse.value.data.inactiveUserCount : null,
      activeUserCount: activeUserResponse.status === 'fulfilled' ? activeUserResponse.value.data.activeUserCount : null
    };

    console.log(`Fetched available aggregate data`);
    res.status(200).json(combinedResponse);

  } catch (error) {
    console.error('Error in main process:', error.message);
    res.status(500).json({ message: "Internal server error" });
  }
};

module.exports = {
  getAllUsers,
  getAllUniversalContexts,
  updateUniversalContext,
  getOrganizationInsights,
};
