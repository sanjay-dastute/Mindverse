import axios from "axios";
import Cookies from "js-cookie";

// Function to retrieve the token from local storage
const getToken = () => {
  // const token = sessionStorage.getItem("token");
  const token = Cookies.get('token');
  if (!token) {
    throw new Error("Token not found in local storage");
  }
  return token;
};

// Function to retrieve the organizationId from local storage
const getOrganizationId = () => {
  // const organizationId = sessionStorage.getItem("organizationId");
  const organizationId = Cookies.get('organizationId');
  if (!organizationId) {
    throw new Error("Organization ID not found in local storage");
  }
  return organizationId;
};

// Get post details using Axios
export const getPostDetails = async (organizationId, tabKey = 'all') => {
  try {
    const token = getToken();
    const response = await axios.get(
      `${process.env.REACT_APP_API_BASE_URL}/users/${organizationId}/posts`,
      {
        params: {
          filter: tabKey,
        },
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    return response.data.map((item) => ({
      id: item?.id,
      media_type: item?.media_type,
      media_url: item?.media_url,
      thumbnail_url: item?.thumbnail_url,
      caption: item?.caption,
      tagProductId: item?.taggedProduct,
    }));
  } catch (error) {
    console.error("Error fetching post details:", error);
    throw new Error("Failed to fetch post details");
  }
};

// Get user profile using Axios
export const getUserProfile = async (organizationId) => {
  try {
    const token = getToken();
    const response = await axios.get(
      `${process.env.REACT_APP_API_BASE_URL}/users/getprofiledetails`,
      {
        params: {
          organizationId: organizationId,
        },
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      }
    );
    const data = response.data;

    return {
      id: 1,
      name: data.instagramHandle,
      title: data.name,
      mediaCount: data.mediaCount,
      avatar: data.profilePictureUrl,
      articles: data.postCount,
      followers: data.followersCount,
      productCount: data.productCount,
      biography: data.biography
    };
  } catch (error) {
    console.error("Error fetching user profile:", error);
    throw new Error("Failed to fetch user profile");
  }
};

export const getResponseTemplate = async (organizationId) => {
  const token = getToken();
  try {
    const response = await axios.get(
      `${process.env.REACT_APP_API_BASE_URL}/users/response/template`,
      {
        params: {
          organizationId: organizationId,
        },
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error("Error fetching response template:", error);
    throw error;
  }
};

export const submitResponseTemplate = async (data) => {
  try {
    const token = getToken();
    const organizationId = getOrganizationId();
    const response = await axios.post(
      `${process.env.REACT_APP_API_BASE_URL}/users/response/template`,
      {
        ...data,
        organizationId: organizationId,
      },
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error("Error sending request:", error);
    throw new Error("Failed to submit response template");
  }
};

export const getContextSetting = async () => {
  const token = getToken();
  const organizationId = getOrganizationId();
  try {
    const response = await axios.get(
      `${process.env.REACT_APP_API_BASE_URL}/users/context/prompt`,
      {
        params: {
          organizationId: organizationId,
        },
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    return response.data; // This should now be an array of prompts
  } catch (error) {
    console.error("Error fetching prompts:", error);
    throw error;
  }
};

export const updateContextSetting = async (promptId, data) => {
  try {
    const token = getToken();
    const organizationId = getOrganizationId();
    await axios.post(
      `${process.env.REACT_APP_API_BASE_URL}/users/context/prompt/${organizationId}/${promptId}`,
      data,
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      }
    );
  } catch (error) {
    console.error("Error updating prompt:", error);
    throw new Error("Failed to update prompt");
  }
};

export const getRefreshDetails = async (organizationId) => {
  try {
    const token = getToken();
    const response = await axios.post(
      `${process.env.REACT_APP_API_BASE_URL}/users/refresh`,
      {
        organizationId: organizationId,
      },
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      }
    );
    return response.data;
  }
  catch (error) {
    console.error("Error fetching post details:", error);
    throw new Error("Failed to fetch post details");
  }
};

export const getUserSettings = async () => {
  try {
    const token = getToken();
    const organizationId = getOrganizationId();
    const response = await axios.get(
      `${process.env.REACT_APP_API_BASE_URL}/users/setting`,
      {
        params: {
          organizationId: organizationId,
        },
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    return response.data;
  } catch (error) {
    throw new Error("Failed to load settings");
  }
};

export const updateUserSettings = async (data) => {
  try {
    const token = getToken();
    const organizationId = getOrganizationId();
    const response = await axios.post(
      `${process.env.REACT_APP_API_BASE_URL}/users/update-setting`,
      {
        ...data,
        organizationId: organizationId,
      },
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      }
    );
    return response.data;
  } catch (error) {
    throw new Error("Failed to update settings");
  }
};

export const getAccountDetails = async () => {
  try {
    const token = getToken();
    const organizationId = getOrganizationId();
    const response = await axios.get(
      `${process.env.REACT_APP_API_BASE_URL}/users/account-details/${organizationId}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error("Error fetching account details:", error);
    throw new Error("Failed to fetch account details");
  }
};

export const updateAccountDetails = async (data) => {
  try {
    const token = getToken();
    const organizationId = getOrganizationId();
    const response = await axios.post(
      `${process.env.REACT_APP_API_BASE_URL}/users/account-details/${organizationId}`,
      data,
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error("Error updating account details:", error);
    throw new Error("Failed to update account details");
  }
};

export const getPostInsights = async (postId) => {
  try {
    const token = getToken();
    const organizationId = getOrganizationId();
    const response = await axios.get(
      `${process.env.REACT_APP_API_BASE_URL}/users/${organizationId}/posts/${postId}/with-insights`,
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error("Error updating post insight details:", error);
    throw new Error("Failed to post insight details");
  }
};

export const getOrganizationInsights = async (startDate, endDate) => {
  try {
    const token = getToken();
    const organizationId = getOrganizationId();
    const response = await axios.get(
      `${process.env.REACT_APP_API_BASE_URL}/users/${organizationId}/instagram-insights?startDate=${startDate}&endDate=${endDate}`,
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error("Error updating organization insight details:", error);
    throw new Error("Failed to post insight details");
  }
};