import axios from "axios";
import Cookies from "js-cookie";

const getToken = () => {
  // const token = sessionStorage.getItem("token");
  const token = Cookies.get('token');
  if (!token) {
    throw new Error("Token not found in local storage");
  }
  return token;
};

// Generate access token and save user record
export const getAccessToken = async (code) => {
  const authUrl = `${process.env.REACT_APP_API_BASE_URL}/auth/sign-up?code=${code}`;
  try {
    const response = await axios.post(authUrl);
    return response?.data;
  } catch (error) {
    console.error("Error fetching access token:", error);
    throw error;
  }
};

export const getAccessTokenInstagram = async (code) => {
  const authUrl = `${process.env.REACT_APP_API_BASE_URL}/auth/sign-up/instagram?code=${code}`;
  try {
    const response = await axios.post(authUrl);
    return response?.data;
  } catch (error) {
    console.error("Error fetching access token:", error);
    throw error;
  }
};

export const login = async (username, password) => {
  const loginUrl = `${process.env.REACT_APP_API_BASE_URL}/auth/login`;
  try {
    const response = await axios.post(loginUrl, {
      username,
      password,
    });
    return response.data;
  } catch (error) {
    console.error("Login failed:", error);
    throw error;
  }
};

export const getMessageResponse = async (message, assistantId = '', threadId = '') => {
  const authUrl = `${process.env.REACT_APP_POC_AI_BASE_URL}/assistant_ai2`;
  try {
    const response = await axios.post(authUrl, {
      message,
      ...(assistantId && { assistant_id: assistantId }),
      ...(threadId && { thread_id: threadId }),
    });
    return response?.data;
  } catch (error) {
    console.error("Error fetching message response from ai assistant:", error);
    throw error;
  }
};

export const submitUserDetails = async (values) => {
  // const organizationId = sessionStorage.getItem("organizationId");
  // const token = sessionStorage.getItem("token");
  const organizationId = Cookies.get('organizationId');
  const token = Cookies.get('token');

  if (!organizationId) {
    throw new Error("Organization ID not found in local storage");
  }
  const payload = {
    organizationName: values.orgName,
    contactPerson: values.name,
    contactPhoneNumber: values.phone,
    organizationId: organizationId,
  };
  try {
    const response = await axios.post(
      `${process.env.REACT_APP_API_BASE_URL}/users/organization/data`,
      payload,
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error("Error submitting user details:", error);
    throw error;
  }
};

export const sendOtp = async (phone_no) => {
  // const organizationId = sessionStorage.getItem("organizationId");
  const organizationId = Cookies.get('organizationId');
  const token = getToken();
  const response = await axios.post(
    `${process.env.REACT_APP_API_BASE_URL}/auth/send-otp`,
    { organizationId, phone_no },
    {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    }
  );
  return response.data;
};

export const verifyOtp = async (phone, otp) => {
  // const organizationId = sessionStorage.getItem("organizationId");
  const organizationId = Cookies.get('organizationId');
  const token = getToken();
  const response = await axios.post(
    `${process.env.REACT_APP_API_BASE_URL}/auth/verify-otp`,
    { organizationId, phone, otp },
    {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    }
  );
  return response.data;
};
