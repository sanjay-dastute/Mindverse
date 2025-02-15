import React, { useEffect, useState, useCallback } from "react";
import { Button } from "antd";
import { initInstagramSdk, instagramLogin, resetInstagramSdk, getInstagramLoginStatus, getInstagramShortLivedToken } from "../../utils/InstagramSDK";

import { useNavigate } from "react-router";

const InstagramLogin = () => {
    // const [isSDKInitialized, setIsSDKInitialized] = useState(false);
    const [isLoggingIn, setIsLoggingIn] = useState(false);
    // const [loginError, setLoginError] = useState(null);

    // const navigate = useNavigate();

    //   const initSDK = useCallback(async () => {
    //     try {
    //       await initInstagramSdk();
    //       console.log("Instagram SDK initialized");
    //       setIsSDKInitialized(true);
    //     } catch (error) {
    //       console.error("Failed to initialize Instagram SDK:", error);
    //       // setLoginError("Failed to initialize Facebook SDK");
    //       setIsSDKInitialized(false);
    //     }
    //   }, []);

    //   useEffect(() => {
    //     initSDK();
    //   }, [initSDK]);

    //   useEffect(() => {
    //     if (isSDKInitialized) {
    //       checkLoginStatus();
    //     }
    //   }, [isSDKInitialized]);

    // const checkLoginStatus = async () => {
    //     try {
    //         const response = await getInstagramLoginStatus();
    //         console.log("Login status:", response);
    //     } catch (error) {
    //         console.error("Failed to get login status:", error);
    //     }
    // };

    const login = async () => {
        // if (!isSDKInitialized || isLoggingIn) {
        //   console.log("SDK not initialized yet or login in progress");
        //   return;
        // }

        setIsLoggingIn(true);
        // setLoginError(null);
        console.log("Attempting Instagram login");

        try {
            //   const response = await instagramLogin();
            //   console.log("Login successful:", response);
            getInstagramShortLivedToken()
                .then((url) => {
                    console.log('Redirecting to:', url);
                    // The user will be redirected to the Instagram OAuth URL
                })
                .catch((error) => {
                    console.error('Error during Instagram login:', error);
                });

            // let accessToken = await
      // Check if the response contains an access token
    //   if (accessToken) {
    //             // Navigate to the callback route with the access token as a query parameter
    //             navigate(`/instagram/callback?code=${encodeURIComponent(accessToken)}`);
    //         } else {
    //             throw new Error("Access token not found in the response");
    //         }
        } catch (error) {
            console.error("Login failed:", error);
            // setLoginError("Login failed. Please try again.");
            await handleLoginFailure();
        } finally {
            setIsLoggingIn(false);
        }
    };

    const handleLoginFailure = async () => {
        console.log("Login was cancelled or failed. Resetting ...");
        // setIsSDKInitialized(false);
        setIsLoggingIn(false);
        // await resetInstagramSdk();
        // Force a "refresh" by reloading the current page
        window.location.reload();
    };

    return (
        <div>
            <Button
                type="primary"
                onClick={login}
                disabled={isLoggingIn}
            >
                {isLoggingIn ? 'Logging in...' : 'Login with Instagram'}
            </Button>
        </div>
    );
};

export default InstagramLogin;