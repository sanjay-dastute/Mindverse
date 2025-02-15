// src/controllers/userController.js
const axios = require("axios");
const dotenv = require("dotenv");
dotenv.config();

const DATA_SERVICE_URL = process.env.DATA_SERVICE_URL

const {
  getInstagramAccount,
  getPostDetails,
  getLongLivedAccessToken,
  getFbAccountDetails,
  fetchInsights,
} = require("../utils/facebook");
const { saveEvent } = require('../utils/events');
const { getInstagramAccountWithoutFB } = require("../utils/instagram");

// Upsert organization data
const upsertOrganizationData = async (req, res) => {
  try {
    const {
      organizationName,
      contactPerson,
      contactPhoneNumber,
      organizationId,
    } = req.body;

    if (!organizationId) {
      return res.status(400).json({ message: "Bad request: organizationId is required" });
    }

    const response = await axios.put(`${DATA_SERVICE_URL}/users/organization-data`, {
      organizationName,
      contactPerson,
      contactPhoneNumber,
      organizationId,
    });

    // Check if the data service returned a 404 (user not found)
    if (response.status === 404) {
      return res.status(404).json({ message: "User not found" });
    }

    // Return the updated data received from the data service
    res.status(200).json({
      organizationId: response.data.organizationId,
      organizationName: response.data.organizationName,
      contactPerson: response.data.contactPerson,
      contactPhoneNumber: response.data.contactPhoneNumber,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
};


// Get prompts
const getPrompts = async (req, res) => {
  try {
    const { organizationId } = req.query;

    if (!organizationId) {
      console.log('Request made without organizationId');
      return res.status(400).json({ message: "Bad request: organizationId is required" });
    }

    console.log(`Fetching prompts for organizationId: ${organizationId}`);

    const response = await axios.get(`${DATA_SERVICE_URL}/users/prompts`, {
      params: { organizationId }
    });

    console.log(`Successfully fetched prompts for organizationId: ${organizationId}`);
    res.status(200).json(response.data);
  } catch (error) {
    console.error('Error fetching prompts:', error.message);
    if (error.response) {
      res.status(error.response.status).json(error.response.data);
    } else {
      res.status(500).json({ message: "Internal server error" });
    }
  }
};

const updatePrompt = async (req, res) => {
  try {
    const { organizationId, promptId } = req.params;
    const { prompt, isActive } = req.body;

    if (!organizationId || !promptId) {
      console.log('Request made without organizationId or promptId');
      return res.status(400).json({ message: "Bad request: organizationId and promptId are required" });
    }

    if (!prompt) {
      console.log('Request made without prompt');
      return res.status(400).json({ message: "Bad request: prompt is required in the request body" });
    }

    console.log(`Updating prompt for organizationId: ${organizationId}, promptId: ${promptId}`);

    const response = await axios.put(`${DATA_SERVICE_URL}/users/${organizationId}/prompts/${promptId}`, {
      prompt,
      isActive
    });

    console.log(`Successfully updated prompt for organizationId: ${organizationId}, promptId: ${promptId}`);
    res.status(response.status).send();
  } catch (error) {
    console.error('Error updating prompt:', error.message);
    if (error.response) {
      res.status(error.response.status).json(error.response.data);
    } else {
      res.status(500).json({ message: "Internal server error" });
    }
  }
};

// Get response template
const getResponseTemplate = async (req, res) => {
  try {
    const { organizationId } = req.query;

    if (!organizationId) {
      console.log('Request made without organizationId');
      return res.status(400).json({ message: "Bad request: organizationId is required" });
    }

    console.log(`Fetching response template for organizationId: ${organizationId}`);

    const response = await axios.get(`${DATA_SERVICE_URL}/users/response-template`, {
      params: { organizationId }
    });

    console.log(`Successfully fetched response template for organizationId: ${organizationId}`);
    res.status(200).json(response.data);
  } catch (error) {
    console.error('Error fetching response template:', error.message);
    if (error.response) {
      res.status(error.response.status).json(error.response.data);
    } else {
      res.status(500).json({ message: "Internal server error" });
    }
  }
};

const upsertResponseTemplate = async (req, res) => {
  try {
    const { organizationId } = req.body;

    if (!organizationId) {
      console.log('Request made without organizationId');
      return res.status(400).json({ message: "Bad request: organizationId is required" });
    }

    console.log(`Upserting response template for organizationId: ${organizationId}`);

    const response = await axios.put(`${DATA_SERVICE_URL}/users/response-template`, req.body);

    saveEvent("RESPONSE_TEMPLATE_SAVED", req.body);

    console.log(`Successfully upserted response template for organizationId: ${organizationId}`);
    res.status(200).json(response.data);
  } catch (error) {
    console.error('Error upserting response template:', error.message);
    if (error.response) {
      res.status(error.response.status).json(error.response.data);
    } else {
      res.status(500).json({ message: "Internal server error" });
    }
  }
};

const updateUserProfileAndTemplate = async (req, res) => {
  try {
    const { organizationId } = req.params;
    const {
      // Response template fields
      about,
      specialInstructions,
      shippingPolicy,
      returnPolicy,
      paymentType,
      // Account settings fields
      contactPerson,
      contactPhoneNumber,
      organizationName
    } = req.body;

    if (!organizationId) {
      return res.status(400).json({ message: "organizationId is required" });
    }

    await axios.put(`${DATA_SERVICE_URL}/users/response-template`, {
      organizationId,
      about,
      specialInstructions,
      shippingPolicy,
      returnPolicy,
      paymentType
    });

    // Call the updateAccountDetails endpoint
    await axios.put(`${DATA_SERVICE_URL}/users/${organizationId}/account-details`, {
      contactPerson,
      contactPhoneNumber,
      organizationName
    });

    // If both calls were successful, send a 200 response
    res.status(200).json({ message: "User profile and template updated successfully" });

  } catch (error) {
    console.error("Error updating user profile and template:", error);

    // If the error is from the data service, forward its status code and message
    if (error.response && error.response.data) {
      res.status(error.response.status).json(error.response.data);
    } else {
      // For any other errors, send a 500 status
      res.status(500).json({ message: "Internal server error" });
    }
  }
};

// Get user by organizationId
const getUser = async (req, res) => {
  try {
    const { organizationId } = req.query;

    if (!organizationId) {
      console.log('Request made without organizationId');
      return res.status(400).json({ message: "Bad request: organizationId is required" });
    }

    console.log(`Fetching user data for organizationId: ${organizationId}`);

    const response = await axios.get(`${DATA_SERVICE_URL}/users`, {
      params: { organizationId }
    });

    const userData = response.data;
    let instaProfileDetails;
    // const isInstagramLogin = await axios.get(`${DATA_SERVICE_URL}/users/instagramLogin`, {
    //   params: { organizationId }
    // });
    const instagramLogin = userData.instagramLogin;
    if (instagramLogin) {
      instaProfileDetails = await getInstagramAccountWithoutFB(userData.longLivedAccessToken);
    }
    else {
      instaProfileDetails = await getInstagramAccount(
        userData.facebookPageId,
        userData.longLivedAccessToken
      );
    }

    // Get current product count
    const productCountResponse = await axios.get(`${DATA_SERVICE_URL}/mv-product/count`, {
      params: { organizationId }
    });

    const currentProductCount = productCountResponse.data.count;

    const responseJson = {
      mediaCount: instagramLogin ? instaProfileDetails?.media_count : userData.mediaCount,
      profilePictureUrl: instagramLogin ? instaProfileDetails?.profile_picture_url : instaProfileDetails.instagram_business_account.profile_picture_url,
      biography: instagramLogin ? instaProfileDetails?.biography : instaProfileDetails.instagram_business_account.biography,
      name: instagramLogin ? instaProfileDetails?.username : instaProfileDetails.instagram_business_account.username,
      instagramHandle: instagramLogin ? instaProfileDetails?.name : instaProfileDetails.instagram_business_account.name,
      followersCount: instagramLogin ? instaProfileDetails?.followers_count : instaProfileDetails.instagram_business_account.followers_count,
      productCount: currentProductCount,
    };

    console.log(`Successfully fetched and processed user data for organizationId: ${organizationId}`);
    res.status(200).json(responseJson);
  } catch (error) {
    console.error('Error fetching user data:', error.message);
    if (error.response) {
      res.status(error.response.status).json(error.response.data);
    } else {
      res.status(500).json({ message: "Internal server error" });
    }
  }
};

// Get posts details by organizationId
const getPosts = async (req, res) => {
  try {
    const { organizationId } = req.params;
    const { filter } = req.query;

    if (!organizationId) {
      console.log('Request made without organizationId');
      return res.status(400).json({ message: "Bad request: organizationId is required" });
    }

    if (!['all', 'tagged', 'untagged'].includes(filter)) {
      console.log(`Invalid filter value: ${filter}`);
      return res.status(400).json({ message: "Bad request: filter must be 'all', 'tagged', or 'untagged'" });
    }

    console.log(`Fetching ${filter} posts for organizationId: ${organizationId}`);

    let endpoint;
    switch (filter) {
      case 'tagged':
        endpoint = `${DATA_SERVICE_URL}/users/tagged-posts`;
        break;
      case 'untagged':
        endpoint = `${DATA_SERVICE_URL}/users/untagged-posts`;
        break;
      default:
        endpoint = `${DATA_SERVICE_URL}/users/posts`;
    }

    const response = await axios.get(endpoint, {
      params: { organizationId }
    });

    console.log(`Successfully fetched ${filter} posts for organizationId: ${organizationId}`);
    res.status(200).json(response.data);
  } catch (error) {
    console.error('Error fetching posts:', error.message);
    if (error.response) {
      if (error.response.status === 404) {
        res.status(200).json([]);
      } else {
        res.status(error.response.status).json(error.response.data);
      }
    } else {
      res.status(500).json({ message: "Internal server error" });
    }
  }
};

const getPostsByProduct = async (req, res) => {
  try {
    const { organizationId, productId } = req.params;
    const { filter } = req.query;

    if (!organizationId || !productId) {
      console.log('Request made without organizationId or productId');
      return res.status(400).json({ message: "Bad request: organizationId and productId are required" });
    }

    if (!filter || !['tagged', 'untagged'].includes(filter)) {
      console.log(`Invalid or missing filter value: ${filter}`);
      return res.status(400).json({ message: "Bad request: filter must be 'tagged' or 'untagged'" });
    }

    console.log(`Fetching ${filter} posts for organizationId: ${organizationId} and productId: ${productId}`);

    let endpoint;
    if (filter === 'tagged') {
      endpoint = `${DATA_SERVICE_URL}/users/${organizationId}/product/${productId}/posts`;
    } else {
      endpoint = `${DATA_SERVICE_URL}/users/${organizationId}/product/${productId}/posts-excluding`;
    }

    const response = await axios.get(endpoint);

    console.log(`Successfully fetched ${filter} posts for organizationId: ${organizationId} and productId: ${productId}`);
    res.status(200).json(response.data);
  } catch (error) {
    console.error('Error fetching posts:', error.message);
    if (error.response) {
      if (error.response.status === 404) {
        res.status(200).json([]);
      } else {
        res.status(error.response.status).json(error.response.data);
      }
    } else {
      res.status(500).json({ message: "Internal server error" });
    }
  }
};

const refreshInstagramPosts = async (req, res) => {
  try {
    let { organizationId } = req.body;

    if (!organizationId) {
      throw new Error("organizationId is required");
    }

    const response = await axios.get(`${DATA_SERVICE_URL}/users`, {
      params: { organizationId }
    });

    const user = response.data;

    if (!user) {
      throw new Error("User not found");
    }

    const instagramId = user.instagramId;
    const longLivedAccessToken = user.longLivedAccessToken;

    const postDetails = await getPostDetails(instagramId, longLivedAccessToken);

    const existingPosts = user.posts;
    const updatedPosts = [];

    for (const post of postDetails) {
      const existingPost = existingPosts.find((p) => p.id === post.id);

      if (existingPost) {
        // Update existing post fields
        existingPost.media_type = post?.media_type;
        existingPost.media_url = post?.media_url;
        existingPost.thumbnail_url = post?.thumbnail_url;
        existingPost.permalink = post?.permalink;
        existingPost.comments_count = post?.comments_count;
        existingPost.caption = post?.caption;
        existingPost.media_product_type = post?.media_product_type;
        existingPost.timestamp = post?.timestamp;
        existingPost.like_count = post?.like_count;
        existingPost.owner = post?.owner;

        // Update comments
        const existingComments = existingPost?.comments?.data;
        const updatedComments = [];

        for (const comment of post.comments?.data || []) {
          const existingComment = existingComments.find(
            (c) => c.id === comment.id
          );

          if (existingComment) {
            // Update existing comment fields
            existingComment.text = comment.text;
            existingComment.like_count = comment.like_count;
            existingComment.timestamp = comment.timestamp;

            // Update replies
            const existingReplies = existingComment.replies.data;
            const updatedReplies = [];

            for (const reply of comment.replies?.data || []) {
              const existingReply = existingReplies.find(
                (r) => r.id === reply.id
              );

              if (existingReply) {
                // Update existing reply fields
                existingReply.text = reply.text;
                existingReply.like_count = reply.like_count;
                existingReply.timestamp = reply.timestamp;

                updatedReplies.push(existingReply);
              } else {
                // Add new reply
                updatedReplies.push({
                  id: reply.id,
                  text: reply.text,
                  like_count: reply.like_count,
                  timestamp: reply.timestamp,
                });
              }
            }

            // Remove deleted replies
            existingComment.replies.data = updatedReplies;

            updatedComments.push(existingComment);
          } else {
            // Add new comment
            updatedComments.push({
              id: comment.id,
              text: comment.text,
              like_count: comment.like_count,
              timestamp: comment.timestamp,
              replies: {
                data:
                  comment.replies?.data?.map((reply) => ({
                    id: reply.id,
                    text: reply.text,
                    like_count: reply.like_count,
                    timestamp: reply.timestamp,
                  })) || [],
              },
            });
          }
        }

        // Remove deleted comments
        existingPost.comments.data = updatedComments;

        updatedPosts.push(existingPost);
      } else {
        // Add new post
        const newPost = {
          id: post.id,
          media_type: post.media_type,
          media_url: post.media_url,
          permalink: post.permalink,
          comments_count: post.comments_count,
          caption: post.caption,
          media_product_type: post.media_product_type,
          timestamp: post.timestamp,
          comments: {
            data:
              post.comments?.data?.map((comment) => ({
                id: comment.id,
                text: comment.text,
                like_count: comment.like_count,
                timestamp: comment.timestamp,
                replies: {
                  data:
                    comment.replies?.data?.map((reply) => ({
                      id: reply.id,
                      text: reply.text,
                      like_count: reply.like_count,
                      timestamp: reply.timestamp,
                    })) || [],
                },
              })) || [],
          },
          like_count: post.like_count,
          owner: post.owner,
        };

        updatedPosts.push(newPost);
        saveEvent("POST_ADDED", newPost);
      }
    }

    await axios.post(`${DATA_SERVICE_URL}/users/upsert-post-details`, {
      organizationId,
      postDetails: updatedPosts
    });

    res.status(200).json({ organizationId: user.organizationId });
  } catch (error) {
    console.error("Error refreshing Instagram posts:", error);
    throw error;
  }
};

// Refresh access tokens
async function refreshTokens() {
  try {
    const response = await axios.get(`${DATA_SERVICE_URL}/users/tokens`);
    const users = response.data;

    for (const user of users) {
      try {
        const shortLivedAccessToken = user.longLivedAccessToken;
        const newLongLivedAccessToken = await getLongLivedAccessToken(shortLivedAccessToken);

        await axios.put(`${DATA_SERVICE_URL}/users/token`, {
          organizationId: user.organizationId,
          newLongLivedAccessToken
        });

        console.log(`Token refreshed successfully for user: ${user.organizationId}`);
      } catch (error) {
        console.error(`Error refreshing token for user ${user.organizationId}:`, error.message);
      }
    }
    console.log("Access tokens refreshed successfully.");
  } catch (error) {
    console.error("Error refreshing access tokens:", error.message);
  }
}

const getSetting = async (req, res) => {
  try {
    const { organizationId } = req.query;

    console.log(`Fetching settings for organizationId: ${organizationId}`);

    if (!organizationId) {
      console.log('Request made without organizationId');
      return res.status(400).json({ message: "Bad request: organizationId is required" });
    }

    const response = await axios.get(`${DATA_SERVICE_URL}/users/setting`, {
      params: { organizationId }
    });

    console.log(`Settings fetched successfully for organizationId: ${organizationId}`);
    res.status(response.status).json(response.data);
  } catch (error) {
    console.error("Error fetching setting:", error.message);
    if (error.response) {
      return res.status(error.response.status).json(error.response.data);
    }
    res.status(500).json({ message: "Internal server error" });
  }
};

const updateSetting = async (req, res) => {
  try {
    const {
      shop_domain,
      access_token,
      webhook_validation_hash,
      organizationId,
    } = req.body;

    console.log(`Updating settings for organizationId: ${organizationId}`);

    if (!organizationId) {
      console.log('Request made without organizationId');
      return res.status(400).json({ message: "Bad request: organizationId is required" });
    }

    if (!shop_domain || !access_token || !webhook_validation_hash) {
      console.log('Request made with missing required fields');
      return res.status(400).json({ message: "Bad request: Missing required fields" });
    }

    const response = await axios.put(`${DATA_SERVICE_URL}/users/setting`, req.body);

    saveEvent("SHOPIFY_DETAILS_SAVED", req.body);

    console.log(`Settings updated successfully for organizationId: ${organizationId}`);
    return res.status(response.status).json(response.data);
  } catch (error) {
    console.error("Error updating setting:", error.message);
    if (error.response) {
      return res.status(error.response.status).json(error.response.data);
    }
    return res.status(500).json({ message: "Internal server error" });
  }
};

const addTeamMember = async (req, res) => {
  try {
    const { organizationId, otherUserId, role } = req.body;

    if (!organizationId || !otherUserId || !role) {
      console.log('Request made without organizationId, otherUserId, or role');
      return res.status(400).json({ error: "OrganizationId, otherUserId, and role are required" });
    }

    if (role !== "ADMIN") {
      console.log(`Invalid role provided: ${role}`);
      return res.status(400).json({ error: "Invalid role" });
    }

    console.log(`Adding team member for organizationId: ${organizationId}, otherUserId: ${otherUserId}`);

    const response = await axios.post(`${DATA_SERVICE_URL}/users/team-member`, {
      organizationId,
      otherUserId,
      role
    });

    console.log(`Successfully added team member for organizationId: ${organizationId}, otherUserId: ${otherUserId}`);
    res.status(response.status).json(response.data);
  } catch (error) {
    console.error('Error adding team member:', error.message);
    if (error.response) {
      res.status(error.response.status).json(error.response.data);
    } else {
      res.status(500).json({ error: "Internal server error" });
    }
  }
};

const getUserRole = async (req, res) => {
  try {
    const { organizationId, otherUserId } = req.query;

    if (!organizationId && !otherUserId) {
      console.log('Request made without organizationId or otherUserId');
      return res.status(400).json({ error: "Either organizationId or otherUserId is required" });
    }

    let response;

    if (organizationId && !otherUserId) {
      // Possibility 1: Only organizationId is passed
      console.log(`Fetching role for organizationId: ${organizationId}`);
      response = await axios.get(`${DATA_SERVICE_URL}/other-user/role/organization/${organizationId}`);
    } else if (!organizationId && otherUserId) {
      // Possibility 2: Only otherUserId is passed
      console.log(`Fetching role for otherUserId: ${otherUserId}`);
      response = await axios.get(`${DATA_SERVICE_URL}/other-user/role/other-user/${otherUserId}`);
    } else {
      // Possibility 3: Both organizationId and otherUserId are passed
      console.log(`Fetching role for organizationId: ${organizationId}, otherUserId: ${otherUserId}`);
      response = await axios.get(`${DATA_SERVICE_URL}/other-user/role/team-member/${organizationId}/${otherUserId}`);
    }

    console.log('Successfully fetched role');
    res.status(200).json(response.data);
  } catch (error) {
    console.error('Error getting user role:', error.message);
    if (error.response) {
      res.status(error.response.status).json(error.response.data);
    } else {
      res.status(500).json({ error: "Internal server error" });
    }
  }
};

// Get account details
const getAccountDetails = async (req, res) => {
  try {
    const { organizationId } = req.params;
    if (!organizationId) {
      return res.status(400).json({ message: "organizationId is required" });
    }
    const response = await axios.get(`${DATA_SERVICE_URL}/users/${organizationId}/account-details`);
    res.status(200).json(response.data);
  } catch (error) {
    console.error("Error fetching account details:", error);
    res.status(error.response?.status || 500).json({ message: error.response?.data?.message || "Internal server error" });
  }
};

// Update account details
const updateAccountDetails = async (req, res) => {
  try {
    const { organizationId } = req.params;
    const { contactPerson, contactPhoneNumber, organizationName } = req.body;

    if (!organizationId) {
      return res.status(400).json({ message: "organizationId is required" });
    }

    const response = await axios.put(`${DATA_SERVICE_URL}/users/${organizationId}/account-details`, {
      contactPerson,
      contactPhoneNumber,
      organizationName
    });

    res.status(200).json(response.data);
  } catch (error) {
    console.error("Error updating account details:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

const subscribeToWebhooks = async (req, res) => {
  try {
    const { organizationId } = req.params;
    if (!organizationId) {
      return res.status(400).json({ message: "organizationId is required" });
    }

    const response = await axios.get(`${DATA_SERVICE_URL}/users`, {
      params: { organizationId }
    });

    const user = response.data;
    if (!user) {
      return res.status(404).json({ message: "User not found from subscribe Webhooks" });
    }
    let currentSubscriptions;
    // const isInstagramLoggged = await axios.get(`${DATA_SERVICE_URL}/users/instagramLogin`, {
    //   params: { organizationId }
    // });
    if (user.instagramLogin) {
      let accountDetails = await getInstagramAccountWithoutFB(user?.longLivedAccessToken);
      const instaId = accountDetails.user_id;
      currentSubscriptions = await getSubscriptionsInstagram(instaId, user?.longLivedAccessToken) //longlive refresh want to be modified

      if (currentSubscriptions.length === 0 || !isSubscribedToMessagesComments(currentSubscriptions)) {
        // Subscribe to feed and messages
        await subscribeToMessagesComments(instaId, user?.longLivedAccessToken);
      }

    }
    else {
      let accountDetails = await getFbAccountDetails(user?.longLivedAccessToken);
      const pageId = accountDetails[0]?.id;
      const pageAccessToken = accountDetails[0]?.access_token;
      currentSubscriptions = await getSubscriptions(pageId, pageAccessToken);
      if (currentSubscriptions.length === 0 || !isSubscribedToFeedAndMessages(currentSubscriptions)) {
        // Subscribe to feed and messages
        await subscribeToFeedAndMessages(pageId, pageAccessToken);
      }
    }

    // Update user's subscription status
    await axios.put(`${DATA_SERVICE_URL}/users/${organizationId}/subscription`, { isSubscriptionEnabled: true });


    res.status(200).json({ message: "Webhooks subscribed successfully" });
  } catch (error) {
    console.error("Error subscribing to webhooks:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

const unSubscribeToWebhooks = async (req, res) => {
  try {
    const { organizationId } = req.params;
    if (!organizationId) {
      return res.status(400).json({ message: "organizationId is required" });
    }

    const response = await axios.get(`${DATA_SERVICE_URL}/users`, {
      params: { organizationId }
    });

    const user = response.data;
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    let currentSubscriptions;
    // const isInstagramLoggged = await axios.get(`${DATA_SERVICE_URL}/users/instagramLogin`, {
    //   params: { organizationId }
    // })
    if (user.instagramLogin) {
      let accountDetails = await getInstagramAccountWithoutFB(user?.longLivedAccessToken);
      const instaId = accountDetails.user_id;
      currentSubscriptions = await getSubscriptionsInstagram(instaId, user?.longLivedAccessToken) //longlive refresh want to be modified

      if (currentSubscriptions.length > 0) {
        // Unsubscribe from all
        await unsubscribeFromAllInstagram(instaId, user?.longLivedAccessToken);
      }

    }
    else {
      let accountDetails = await getFbAccountDetails(user?.longLivedAccessToken);
      const pageId = accountDetails[0]?.id;
      const pageAccessToken = accountDetails[0]?.access_token;
      currentSubscriptions = await getSubscriptions(pageId, pageAccessToken);

      if (currentSubscriptions.length > 0) {
        // Unsubscribe from all
        await unsubscribeFromAll(pageId, pageAccessToken);
      }
    }

    // Update user's subscription status
    await axios.put(`${DATA_SERVICE_URL}/users/${organizationId}/subscription`, { isSubscriptionEnabled: false });


    res.status(200).json({ message: "Webhooks unsubscribed successfully" });
  } catch (error) {
    console.error("Error unsubscribing from webhooks:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

const getSubscription = async (req, res) => {
  try {
    const { organizationId } = req.params;
    if (!organizationId) {
      return res.status(400).json({ message: "organizationId is required" });
    }

    const response = await axios.get(`${DATA_SERVICE_URL}/users/${organizationId}/subscription`);
    console.log(`Successfully fetched subscription status for organizationId: ${organizationId}`);
    res.status(200).json(response.data);
  } catch (error) {
    console.error("Error getting subscription status:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Helper functions

const getSubscriptions = async (pageId, accessToken) => {
  const response = await axios.get(`https://graph.facebook.com/v19.0/${pageId}/subscribed_apps`, {
    params: { access_token: accessToken }
  });
  return response.data.data;
};

const isSubscribedToFeedAndMessages = (subscriptions) => {
  return subscriptions.some(sub =>
    sub.subscribed_fields.includes('feed') && sub.subscribed_fields.includes('messages')
  );
};

const subscribeToFeedAndMessages = async (pageId, accessToken) => {
  await axios.post(`https://graph.facebook.com/v19.0/${pageId}/subscribed_apps`, null, {
    params: {
      access_token: accessToken,
      subscribed_fields: 'feed,messages'
    }
  });
};

const unsubscribeFromAll = async (pageId, accessToken) => {
  await axios.delete(`https://graph.facebook.com/v19.0/${pageId}/subscribed_apps`, {
    params: { access_token: accessToken }
  });
};

const getSubscriptionsInstagram = async (instagramId, accessToken) => {
  const response = await axios.get(`https://graph.instagram.com/v21.0/${instagramId}/subscribed_apps`, {
    params: { access_token: accessToken }
  });
  return response.data.data;
};

const isSubscribedToMessagesComments = (subscriptions) => {
  return subscriptions.some(sub =>
    sub.subscribed_fields.includes('comments') && sub.subscribed_fields.includes('messages')
  );
};

const subscribeToMessagesComments = async (instagramId, accessToken) => {
  await axios.post(`https://graph.instagram.com/v21.0/${instagramId}/subscribed_apps`, null, {
    params: {
      access_token: accessToken,
      subscribed_fields: 'comments,messages'
    }
  });
};

const unsubscribeFromAllInstagram = async (instagramId, accessToken) => {
  await axios.delete(`https://graph.instagram.com/v21.0/${instagramId}/subscribed_apps`, {
    params: { access_token: accessToken }
  });
};

const getPostWithInsights = async (req, res) => {
  try {
    const { organizationId, postId } = req.params;

    if (!organizationId || !postId) {
      console.log('Request made without organizationId or postId');
      return res.status(400).json({ message: "Bad request: organizationId and postId are required" });
    }

    console.log(`Fetching post with insights for postId: ${postId}, organizationId: ${organizationId}`);

    // Step 1: Get user details to retrieve longLivedAccessToken
    const userResponse = await axios.get(`${DATA_SERVICE_URL}/users/details-only`, {
      params: { organizationId }
    });

    console.log(`Successfully fetched user details for organizationId: ${organizationId}`);

    const { longLivedAccessToken } = userResponse.data;

    if (!longLivedAccessToken) {
      return res.status(404).json({ message: "Long lived access token not found" });
    }

    // Step 2: Get post details
    const postResponse = await axios.get(`${DATA_SERVICE_URL}/users/${organizationId}/posts/${postId}`);
    const postDetails = postResponse.data;

    if (!postDetails) {
      return res.status(404).json({ message: "Post not found" });
    }

    // Step 3: Get post insights from Facebook Graph API
    let insightsMetrics;
    if (postDetails.media_product_type === 'REELS') {
      insightsMetrics = 'clips_replays_count,comments,ig_reels_aggregated_all_plays_count,ig_reels_avg_watch_time,ig_reels_video_view_total_time,likes,plays,reach,saved,shares,total_interactions';
    } else {
      insightsMetrics = 'impressions,reach,saved,video_views,shares,total_interactions';
    }

    const insightsResponse = await axios.get(`https://graph.facebook.com/v20.0/${postId}/insights`, {
      params: {
        metric: insightsMetrics,
        access_token: longLivedAccessToken
      }
    });

    const insights = insightsResponse.data;

    // Step 4: Get conversations
    let processedConversations = [];
    try {
      const conversationsResponse = await axios.get(`${DATA_SERVICE_URL}/mv-conversation/${organizationId}/media/${postId}`);
      console.log(`Successfully fetched conversations for organizationId: ${organizationId}`);

      processedConversations = conversationsResponse.data.map(conversation => {
        conversation.messages = conversation.messages.map(message => {
          if (message.isDeleted) {
            message.originalQuery = "🚫 This message was deleted";
            message.user = "🚫 This message was deleted";
          }
          // Remove isDeleted field
          const { isDeleted, ...messageWithoutIsDeleted } = message;
          return messageWithoutIsDeleted;
        });
        return conversation;
      });
    } catch (conversationError) {
      console.error('Error fetching conversations:', conversationError.message);
      // If there's an error, we'll just use an empty array for conversations
    }

    // Combine all data
    const combinedResponse = {
      ...postDetails,
      insights: insights.data,
      conversations: processedConversations
    };

    console.log(`Successfully fetched post with insights and conversations for postId: ${postId}, organizationId: ${organizationId}`);
    res.status(200).json(combinedResponse);

  } catch (error) {
    console.error('Error fetching post with insights and conversations:', error.message);
    if (error.response) {
      res.status(error.response.status).json(error.response.data);
    } else {
      res.status(500).json({ message: "Internal server error" });
    }
  }
};

const untagProductFromPost = async (req, res) => {
  try {
    const { organizationId, postId } = req.params;

    console.log(`Untagging product from post for organizationId: ${organizationId}, postId: ${postId}`);

    if (!organizationId || !postId) {
      console.log('Request made without organizationId or postId');
      return res.status(400).json({ message: "Bad request: organizationId and postId are required" });
    }

    await axios.post(`${DATA_SERVICE_URL}/users/${organizationId}/posts/${postId}/untag-product`);

    console.log(`Successfully untagged product from post for organizationId: ${organizationId}, postId: ${postId}`);
    res.status(200).json({ message: "Product untagged from post" });
  } catch (error) {
    console.error(error);
    if (error.response) {
      res.status(error.response.status).json(error.response.data);
    } else {
      res.status(500).json({ message: "Internal server error" });
    }
  }
};

const getInstagramInsights = async (req, res) => {
  try {
    const { organizationId } = req.params;
    const { startDate, endDate } = req.query;

    if (!organizationId || !startDate) {
      console.log('Request made without required parameters');
      return res.status(400).json({ message: "Bad request: organizationId and startDate are required" });
    }

    console.log(`Fetching data for organizationId: ${organizationId}, startDate: ${startDate}, endDate: ${endDate || 'not provided'}`);

    // First, get user details to retrieve longLivedAccessToken and instagramId
    const userResponse = await axios.get(`${DATA_SERVICE_URL}/users/details-only`, { params: { organizationId } });
    const { longLivedAccessToken, instagramId } = userResponse.data;

    if (!longLivedAccessToken || !instagramId) {
      return res.status(404).json({ message: "Long lived access token or Instagram ID not found" });
    }

    // Prepare the date parameters
    const dateParams = endDate ? `startDate=${startDate}&endDate=${endDate}` : `startDate=${startDate}`;

    // Fetch all other data in parallel
    const [
      insightsResponse,
      messageCountResponse,
      userCountResponse,
      postCountResponse,
      productCountResponse
    ] = await Promise.allSettled([
      fetchInsights(instagramId, longLivedAccessToken, startDate, endDate),
      axios.get(`${DATA_SERVICE_URL}/mv-conversation/message/${organizationId}/count?${dateParams}`),
      axios.get(`${DATA_SERVICE_URL}/mv-conversation/message/${organizationId}/user-count?${dateParams}`),
      axios.get(`${DATA_SERVICE_URL}/users/${organizationId}/post-count?${dateParams}`),
      axios.get(`${DATA_SERVICE_URL}/mv-product/${organizationId}/product-count?${dateParams}`)
    ]);

    // Combine all responses
    const combinedResponse = {
      insights: insightsResponse.status === 'fulfilled' ? insightsResponse.value.data : null,
      messageCount: messageCountResponse.status === 'fulfilled' ? messageCountResponse.value.data.count : null,
      userDetails: userCountResponse.status === 'fulfilled' ? userCountResponse.value.data : null,
      postCount: postCountResponse.status === 'fulfilled' ? postCountResponse.value.data.postCount : null,
      productCount: productCountResponse.status === 'fulfilled' ? productCountResponse.value.data.productCount : null
    };

    console.log(`Fetched available data for organizationId: ${organizationId}`);
    res.status(200).json(combinedResponse);

  } catch (error) {
    console.error('Error in main process:', error.message);
    res.status(500).json({ message: "Internal server error" });
  }
};

module.exports = {
  upsertOrganizationData,
  getUser,
  getPosts,
  upsertResponseTemplate,
  getResponseTemplate,
  updatePrompt,
  getPrompts,
  refreshInstagramPosts,
  refreshTokens,
  updateSetting,
  getSetting,
  addTeamMember,
  getUserRole,
  getAccountDetails,
  updateAccountDetails,
  subscribeToWebhooks,
  unSubscribeToWebhooks,
  getSubscription,
  getPostWithInsights,
  untagProductFromPost,
  getPostsByProduct,
  getInstagramInsights,
  updateUserProfileAndTemplate,
  getSubscriptionsInstagram,
  subscribeToMessagesComments,
  unsubscribeFromAllInstagram,
  isSubscribedToMessagesComments
};
