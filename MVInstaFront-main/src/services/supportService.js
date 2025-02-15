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

export const createNewRequest = async (requestData) => {
  try {
    const organizationId = getOrganizationId();
    const token = getToken();
    const response = await axios.post(
      `${process.env.REACT_APP_SUPPORT_BASE_URL}/support/${organizationId}/create`,
      requestData,
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      }
    );
    return response.data.supportRequest;
  } catch (error) {
    console.error("Error creating new request:", error);
    throw new Error("Failed to create new request");
  }
};

export const getSubmittedQueries = async () => {
  try {
    const organizationId = getOrganizationId();
    const token = getToken();
    const response = await axios.get(
      `${process.env.REACT_APP_SUPPORT_BASE_URL}/support/${organizationId}/all`,
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      }
    );
    return response.data.supportRequests.map((request) => ({
      id: request.ticketId,
      requestId: request.requestId,
      type: request.type,
      query: request.query,
      createdAt: request.createdAt,
      status: request.status,
    }));
  } catch (error) {
    console.error("Error fetching submitted queries:", error);
    throw new Error("Failed to fetch submitted queries");
  }
};

export const getMessages = async (organizationId, requestId) => {
  try {
    const token = getToken();
    const response = await axios.get(
      `${process.env.REACT_APP_SUPPORT_BASE_URL}/support/${organizationId}/requests/${requestId}/messages`,
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      }
    );
    const sortedMessages = response.data.messages.sort((a, b) => {
      return new Date(a.timestamp) - new Date(b.timestamp);
    });
    return sortedMessages;
  } catch (error) {
    console.error("Error fetching messages:", error);
    throw new Error("Failed to fetch messages");
  }
};

export const sendMessage = async (organizationId, requestId, message, sender) => {
  try {
    const token = getToken();
    await axios.post(
      `${process.env.REACT_APP_SUPPORT_BASE_URL}/support/${organizationId}/requests/${requestId}/messages`,
      { text: message, sender: sender },
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      }
    );
  } catch (error) {
    console.error("Error sending message:", error);
    throw new Error("Failed to send message");
  }
};

export const resolveSupportRequest = async (organizationId, requestId) => {
  try {
    const token = getToken();
    await axios.put(
      `${process.env.REACT_APP_SUPPORT_BASE_URL}/support/${organizationId}/requests/${requestId}/resolve`,
      {},
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      }
    );
  } catch (error) {
    console.error("Error resolving request:", error);
    throw new Error("Failed to resolve request");
  }
};

export const getAllSupportRequests = async (otherUserId) => {
  try {
    const token = getToken();
    const response = await axios.get(
      `${process.env.REACT_APP_SUPPORT_BASE_URL}/support/mvadmin/${otherUserId}/all`,
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error("Error fetching all support requests:", error);
    throw new Error("Failed to fetch all support requests");
  }
};