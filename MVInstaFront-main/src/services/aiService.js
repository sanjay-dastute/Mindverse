// src/services/aiService.js

import axios from 'axios';


export const getDefaultParams = async () => {
  try {
    const response = await axios.get(`${process.env.REACT_APP_AI_BASE_URL}/default_params`);
    return response.data;
  } catch (error) {
    console.error("Error fetching default AI parameters:", error);
    throw new Error("Failed to fetch default AI parameters");
  }
};

export const updateDefaultParams = async (params) => {
  try {
    const response = await axios.post(`${process.env.REACT_APP_AI_BASE_URL}/default_params`, params);
    return response.data;
  } catch (error) {
    console.error("Error updating AI parameters:", error);
    throw new Error("Failed to update AI parameters");
  }
};

export const getOrgParams = async (orgId) => {
    try {
      const response = await axios.get(`${process.env.REACT_APP_AI_BASE_URL}/org/${orgId}`);
      return response.data;
    } catch (error) {
      console.error("Error fetching organization parameters:", error);
      throw new Error("Failed to fetch organization parameters");
    }
  };
  
  export const updateOrgParams = async (orgId, params) => {
    try {
      const response = await axios.put(`${process.env.REACT_APP_AI_BASE_URL}/org/${orgId}`, params);
      return response.data;
    } catch (error) {
      console.error("Error updating organization parameters:", error);
      throw new Error("Failed to update organization parameters");
    }
  };