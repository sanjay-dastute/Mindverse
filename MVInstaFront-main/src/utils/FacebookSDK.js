export const initFacebookSdk = () => {
  return new Promise((resolve) => {
    // Wait for the Facebook SDK to be loaded
    window.fbAsyncInit = function () {
      window.FB.init({
        appId: process.env.REACT_APP_INSTAGRAM_CLIENT_ID,
        cookie: true,
        xfbml: true,
        version: process.env.REACT_APP_FACEBOOK_GRAPH_API,
      });
      resolve();
    };

    // If the SDK is already loaded, call fbAsyncInit manually
    if (window.FB) {
      window.fbAsyncInit();
    }
  });
};

export const getFacebookLoginStatus = () => {
  return new Promise((resolve) => {
    window.FB.getLoginStatus((response) => {
      resolve(response);
    });
  });
};

export const fbLogin = () => {
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

export const resetFacebookSdk = () => {
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