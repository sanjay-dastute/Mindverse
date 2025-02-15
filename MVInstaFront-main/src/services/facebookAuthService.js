//TODO: Not used anymore, can be removed
export const facebookLogin = () => {
  const appId = process.env.REACT_APP_INSTAGRAM_CLIENT_ID;
  const redirectUri = process.env.REACT_APP_INSTAGRAM_REDIRECT_URI;
  const scope =
    "pages_show_list,business_management,pages_messaging,instagram_basic,instagram_manage_comments,instagram_manage_messages,pages_manage_metadata,pages_read_engagement,instagram_manage_insights"; 
  const authUrl = `https://www.facebook.com/v19.0/dialog/oauth?client_id=${appId}&redirect_uri=${redirectUri}&scope=${scope}&response_type=code`;
  window.location.href = authUrl;
};
