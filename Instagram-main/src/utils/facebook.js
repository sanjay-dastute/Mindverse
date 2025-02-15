const axios = require("axios");
require("dotenv").config();
const { createHmac } = require("crypto");

const appId = process.env.APP_ID;
const appSecret = process.env.APP_SECRET;

const baseUrl = process.env.FACEBOOK_GRAPH_API;
const redirectUri = process.env.REACT_APP_FACEBOOK_REDIRECT;

async function getAccessToken(code) {
  const authUrl = `${baseUrl}/oauth/access_token?client_id=${appId}&redirect_uri=${redirectUri}&client_secret=${appSecret}&code=${code}`;

  try {
    const response = await axios.get(authUrl);
    return response?.data?.access_token;
  } catch (error) {
    console.error("Error fetching access token:", error);
    throw error;
  }
}

async function getLongLivedAccessToken(shortLivedAccessToken) {
  try {
    const response = await axios.get(
      `${baseUrl}/oauth/access_token?grant_type=fb_exchange_token&client_id=${appId}&client_secret=${appSecret}&fb_exchange_token=${shortLivedAccessToken}`
    );
    const access_token = response?.data?.access_token;
    return access_token;
  } catch (error) {
    console.error(
      "Error fetching longlived access token:",
      error.response ? error.response.data : error.message
    );
    throw error;
  }
}

async function getFbAccountDetails(longLivedAccessToken) {
  try {
    const response = await axios.get(
      // `${baseUrl}/me/accounts?access_token=${longLivedAccessToken}`
      `${baseUrl}/me/accounts?fields=id%2Cname%2Caccess_token%2Cinstagram_business_account&access_token=${longLivedAccessToken}`
    );
console.log(response.data, 'rpp')
    const accountDetail = response.data.data.map((item) => ({
      id: item.id,
      access_token: item.access_token
    }));
    return accountDetail;
  } catch (error) {
    console.error(
      "Error fetching account details:",
      error.response ? error.response.data : error.message
    );
    throw error;
  }
}

async function getInstagramAccount(pageId, longLivedaccessToken) {
  try {
    const response = await axios.get(
      `${baseUrl}/${pageId}?fields=instagram_business_account{name,username,profile_picture_url,biography,followers_count}&access_token=${longLivedaccessToken}`
    );

    const instagramId = response?.data;
    console.log(instagramId);
    return instagramId;
  } catch (error) {
    console.error(
      "Error fetching Instagram  account:",
      error.response ? error.response.data : error.message
    );
    throw error;
  }
}

async function getPostDetails(instagramId, longLivedaccessToken) {
  try {
    let allPostDetails = [];
    let nextUrl = `${baseUrl}/${instagramId}/media?fields=id,media_type,media_url,thumbnail_url,permalink,comments_count,caption,media_product_type,comments{id,text,timestamp,like_count,replies{id,text,timestamp,like_count}},like_count,location,timestamp,owner,dimensions,likes{count}&limit=30&access_token=${longLivedaccessToken}`;

    while (nextUrl) {
      const response = await axios.get(nextUrl);
      const postDetails = response?.data?.data;

      if (postDetails && postDetails.length > 0) {
        allPostDetails = [...allPostDetails, ...postDetails];
      }

      nextUrl = response?.data?.paging?.next;
    }

    return allPostDetails;
  } catch (error) {
    console.error(
      "Error fetching posts from instagram:",
      error.response ? error.response.data : error.message
    );
    throw error;
  }
}

function verifyRequestSignature(req, buf) {
  var signature = req.headers["x-hub-signature-256"];
  if (!signature) {
    console.warn(`Couldn't find "x-hub-signature-256" in headers.`);
  } else {
    var elements = signature.split("=");
    var signatureHash = elements[1];
    var expectedHash = createHmac("sha256", appSecret)
      .update(buf)
      .digest("hex");
    if (signatureHash !== expectedHash) {
      throw new Error("Couldn't validate the request signature.");
    }
  }
}

const fetchInsights = async (instagramId, accessToken, startDate, endDate) => {
  const { since, until } = calculateDateRange(startDate, endDate);
  const maxDuration = 30 * 24 * 60 * 60; // 30 days in seconds
  const adjustedUntil = Math.min(since + maxDuration, until);

  const response = await axios.get(`https://graph.facebook.com/v19.0/${instagramId}/insights`, {
    params: {
      metric: 'impressions,reach,website_clicks,profile_views,accounts_engaged,total_interactions,likes,comments,shares,saves,replies,follows_and_unfollows,profile_links_taps',
      period: 'day',
      metric_type: 'total_value',
      since: since,
      until: adjustedUntil,
      access_token: accessToken
    }
  });

  return response.data;
};

// Helper function to calculate date range
const calculateDateRange = (startDate, endDate) => {
  const start = new Date(startDate);
  start.setHours(0, 0, 0, 0);

  let end;
  if (endDate) {
    end = new Date(endDate);
    end.setHours(23, 59, 59, 999);
  } else {
    end = new Date(start);
    end.setHours(23, 59, 59, 999);
  }

  return {
    since: Math.floor(start.getTime() / 1000),
    until: Math.floor(end.getTime() / 1000)
  };
};

module.exports = {
  verifyRequestSignature,
  getAccessToken,
  getLongLivedAccessToken,
  getFbAccountDetails,
  getInstagramAccount,
  getPostDetails,
  fetchInsights,
};
