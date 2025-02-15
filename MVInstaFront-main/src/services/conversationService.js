import axios from "axios";
import Cookies from "js-cookie";

// Function to retrieve the organizationId from local storage
const getOrganizationId = () => {
  // const organizationId = sessionStorage.getItem("organizationId");
  const organizationId = Cookies.get('organizationId');
  if (!organizationId) {
    throw new Error("Organization ID not found in local storage");
  }
  return organizationId;
};

// Function to retrieve the token from local storage
const getToken = () => {
  // const token = sessionStorage.getItem("token");
  const token = Cookies.get('token');
  if (!token) {
    throw new Error("Token not found in local storage");
  }
  return token;
};

export const createNotification = async (message) => {
  const organizationId = getOrganizationId();
  const token = getToken();
  const response = await axios.post(
    `${process.env.REACT_APP_CONVERSATION_BASE_URL}/conversation/create-notification`,
    { message, organizationId },
    {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    }
  );
  return response.data;
};

export const notificationList = async () => {
  const organizationId = getOrganizationId();
  const token = getToken();
  const response = await axios.get(
    `${process.env.REACT_APP_CONVERSATION_BASE_URL}/conversation/notification-list?organizationId=${organizationId}`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );
  return response.data;
};

export const conversationList = async () => {
  const organizationId = getOrganizationId();
  const token = getToken();
  const response = await axios.get(
    `${process.env.REACT_APP_CONVERSATION_BASE_URL}/conversation/get-conversion?organizationId=${organizationId}`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );
  return response.data;
};

export const markNotificationAsRead = async (notificationId) => {
  const token = getToken();
  await axios.post(
    `${process.env.REACT_APP_CONVERSATION_BASE_URL}/conversation/mark-as-read`,
    { notificationId },
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );
};

export const messageCountByOrganization = async () => {
  const organizationId = getOrganizationId();
  const token = getToken();
  const response = await axios.get(
    `${process.env.REACT_APP_CONVERSATION_BASE_URL}/conversation/message/${organizationId}/count`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );
  return response.data;
};

export const paymentOrderCreation = async (options) => {
  const organizationId = getOrganizationId();
  const token = getToken();
  const response = await axios.post(
    `${process.env.REACT_APP_CONVERSATION_BASE_URL}/payment/?organizationId=${organizationId}`,
    { options },
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );
  return response.data;
};

export const verifyPaymentOrder = async (options) => {
  const organizationId = getOrganizationId();
  const token = getToken();
  const response = await axios.post(
    `${process.env.REACT_APP_CONVERSATION_BASE_URL}/payment/verify-payment?organizationId=${organizationId}`,
    { options },
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );
  return response.data;
};

export const subscriptionOrderCreation = async (options) => {
  const organizationId = getOrganizationId();
  const token = getToken();
  const response = await axios.post(
    `${process.env.REACT_APP_CONVERSATION_BASE_URL}/payment/subscription?organizationId=${organizationId}`,
    { options },
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );
  return response.data;
};

export const verifySubscriptionOrder = async (options) => {
  const organizationId = getOrganizationId();
  const token = getToken();
  const response = await axios.post(
    `${process.env.REACT_APP_CONVERSATION_BASE_URL}/payment/subscription/verify?organizationId=${organizationId}`,
    { options },
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );
  return response.data;
};

export const updateUserFeeling = async (options, user, feeling) => {
  const organizationId = getOrganizationId();
  const token = getToken();
  const response = await axios.post(
    `${process.env.REACT_APP_CONVERSATION_BASE_URL}/conversation/feeling?organizationId=${organizationId}`,
    { options, user, feeling },
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );
  return response.data;
};

// export const getUserFeeling = async () => {
//   const organizationId = getOrganizationId();
//   const token = getToken();
//   const response = await axios.get(
//     `${process.env.REACT_APP_CONVERSATION_BASE_URL}/feeling?organizationId=${organizationId}`,
//     {
//       headers: {
//         Authorization: `Bearer ${token}`,
//       },
//     }
//   );
//   return response.data;
// };

