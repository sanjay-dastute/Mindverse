export const initInstagramSdk = () => {
    return new Promise((resolve) => {
        // Wait for the Facebook SDK to be loaded
        window.fbAsyncInit = function () {
            window.FB.init({
                appId: process.env.REACT_APP_INSTA_CLIENT_ID,
                cookie: true,
                xfbml: true,
                version: process.env.REACT_APP_INSTAGRAM_GRAPH_API,
            });
            resolve();
        };

        // If the SDK is already loaded, call fbAsyncInit manually
        if (window.FB) {
            window.fbAsyncInit();
        }
    });
};

export const getInstagramLoginStatus = () => {
    return new Promise((resolve) => {
        window.FB.getLoginStatus((response) => {
            resolve(response);
        });
    });
};

export const getInstagramShortLivedToken = () => {
    return new Promise((resolve, reject) => {
        try {
            const clientId = process.env.REACT_APP_INSTA_CLIENT_ID;
            const redirectUri = encodeURIComponent(process.env.REACT_APP_INSTA_REDIRECT_URI);
            const scope = encodeURIComponent(
                'instagram_business_basic,instagram_business_manage_messages,instagram_business_manage_comments,instagram_business_content_publish'
            );

            const authUrl = `https://www.instagram.com/oauth/authorize?enable_fb_login=0&force_authentication=1&client_id=${clientId}&redirect_uri=${redirectUri}&response_type=code&scope=${scope}`;

            resolve(authUrl);

            // Redirect the user to the Instagram OAuth URL
            window.location.href = authUrl;
        } catch (error) {
            // Reject the promise in case of any error
            reject(new Error('Failed to redirect to Instagram login.'));
        }
    });
};



export const instagramLogin = () => {
    return new Promise((resolve, reject) => {
        window.FB.login((response) => {
            if (response.status === 'connected') {
                resolve(response);
            } else if (response.status === 'not_authorized') {
                reject(new Error('User did not authorize the app'));
            } else {
                reject(new Error('User cancelled the login or did not fully authorize'));
            }
        }, {
            scope: 'public_profile,email,pages_show_list,business_management,pages_messaging,instagram_basic,instagram_manage_comments,instagram_manage_messages,pages_manage_metadata,pages_read_engagement,instagram_manage_insights',
            auth_type: 'rerequest'  // This forces a new login dialog to open each time
        });
    });
};

export const resetInstagramSdk = () => {
    return new Promise((resolve) => {
        delete window.FB;
        const fbRoot = document.getElementById('fb-root');
        if (fbRoot) {
            fbRoot.remove();
        }
        const fbScript = document.getElementById('facebook-jssdk');
        if (fbScript) {
            fbScript.remove();
        }
        resolve();
    });
};