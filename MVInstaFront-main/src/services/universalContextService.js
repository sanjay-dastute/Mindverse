// src/services/universalContextService.js

import axios from "axios";
import Cookies from "js-cookie";

const getToken = () => {
  // const token = sessionStorage.getItem("token");
  const token = Cookies.get('token');
  if (!token) {
    throw new Error("Token not found in session storage");
  }
  return token;
};

export const getAllUniversalContexts = async () => {
  try {
    const token = getToken();
    const response = await axios.get(
      `${process.env.REACT_APP_API_BASE_URL}/mv/universal-contexts`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error("Error fetching universal contexts:", error);
    throw new Error("Failed to fetch universal contexts");
  }
};

export const updateUniversalContext = async (contextId, data) => {
  try {
    const token = getToken();
    await axios.post(
      `${process.env.REACT_APP_API_BASE_URL}/mv/universal-contexts/${contextId}`,
      data,
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      }
    );
  } catch (error) {
    console.error("Error updating universal context:", error);
    throw new Error("Failed to update universal context");
  }
};