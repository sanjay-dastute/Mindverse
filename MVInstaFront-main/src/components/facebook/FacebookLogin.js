import React, { useEffect, useState, useCallback } from "react";
import { Button } from "antd";
import { FacebookOutlined } from '@ant-design/icons';
import {
  getFacebookLoginStatus,
  initFacebookSdk,
  fbLogin,
  resetFacebookSdk
} from "../../utils/FacebookSDK";

import { useNavigate } from "react-router";

const FacebookLogin = () => {
  const [isSDKInitialized, setIsSDKInitialized] = useState(false);
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  // const [loginError, setLoginError] = useState(null);

  const navigate = useNavigate();

  const initSDK = useCallback(async () => {
    try {
      await initFacebookSdk();
      console.log("Facebook SDK initialized");
      setIsSDKInitialized(true);
    } catch (error) {
      console.error("Failed to initialize Facebook SDK:", error);
      // setLoginError("Failed to initialize Facebook SDK");
      setIsSDKInitialized(false);
    }
  }, []);

  useEffect(() => {
    initSDK();
  }, [initSDK]);

  useEffect(() => {
    if (isSDKInitialized) {
      checkLoginStatus();
    }
  }, [isSDKInitialized]);

  const checkLoginStatus = async () => {
    try {
      const response = await getFacebookLoginStatus();
      console.log("Login status:", response);
    } catch (error) {
      console.error("Failed to get login status:", error);
    }
  };

  const login = async () => {
    if (!isSDKInitialized || isLoggingIn) {
      console.log("SDK not initialized yet or login in progress");
      return;
    }

    setIsLoggingIn(true);
    // setLoginError(null);
    console.log("Attempting Facebook login");

    try {
      const response = await fbLogin();
      console.log("Login successful:", response);

      let accessToken = response?.authResponse?.accessToken;
      // Check if the response contains an access token
      if (accessToken) {
        // Navigate to the callback route with the access token as a query parameter
        navigate(`/fb/callback?code=${encodeURIComponent(accessToken)}`);
      } else {
        throw new Error("Access token not found in the response");
      }
    } catch (error) {
      console.error("Login failed:", error);
      // setLoginError("Login failed. Please try again.");
      await handleLoginFailure();
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleLoginFailure = async () => {
    console.log("Login was cancelled or failed. Resetting SDK...");
    setIsSDKInitialized(false);
    setIsLoggingIn(false);
    await resetFacebookSdk();
    // Force a "refresh" by reloading the current page
    window.location.reload();
  };

  return (
    <div>
      <Button
        type="primary"
        onClick={login}
        disabled={!isSDKInitialized || isLoggingIn}
        icon={<FacebookOutlined />}
      >
        {isLoggingIn ? 'Logging in...' : 'Login with Facebook'}
      </Button>
    </div>
  );
};

export default FacebookLogin;