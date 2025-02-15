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
export const getAllUsers = async () => {
  try {
    const token = getToken();
    const response = await axios.get(
      `${process.env.REACT_APP_API_BASE_URL}/mv/all-users`,
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      }
    );

    return response.data.map((user) => ({
      organizationId: user.organizationId,
      instagramUserName: user.instagramUserName,
      contactPerson: user.contactPerson,
      contactPhoneNumber: user.contactPhoneNumber,
      prompt: user.prompt || "Default value for prompt",
      profilePictureUrl: user.profilePictureUrl
    }));
  } catch (error) {
    console.error("Error fetching user details:", error);
    throw new Error("Failed to fetch user details");
  }
};

export const getAllOrganizationsInsights = async (startDate, endDate) => {
  try {
    const token = getToken();
    const response = await axios.get(
      `${process.env.REACT_APP_API_BASE_URL}/mv/organization-insights?startDate=${startDate}&endDate=${endDate}`,
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      }
    );

    return response.data;
  } catch (error) {
    console.error("Error fetching mv insights:", error);
    throw new Error("Failed to fetch user details");
  }
};