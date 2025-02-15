const axios = require("axios");
const otpGenerator = require("otp-generator");
const {
  // getAccessToken,
  getLongLivedAccessToken,
  getFbAccountDetails,
  getInstagramAccount,
  getPostDetails,
} = require("../utils/facebook");
const jwt = require("jsonwebtoken");
const { sendOTPMsg } = require("../utils/twillio");
const { createAiUser } = require("../utils/ai");
const { saveEvent } = require("../utils/events");
const { getInstagramAccountWithoutFB, getPostDetailsInstagram, getLongLivedAccessTokenInstagram, getAccessTokenInstagram } = require("../utils/instagram");

const DATA_SERVICE_URL = process.env.DATA_SERVICE_URL

const facebookLogin = async (req, res) => {
  try {
    let code = req.query["code"];
    if (code) {
      let longLivedAccessToken = await getLongLivedAccessToken(code);
      if (longLivedAccessToken) {
        let accountDetails = await getFbAccountDetails(longLivedAccessToken);
        console.log(accountDetails, 'accDetailssss')
        const pageId = accountDetails[0]?.id;
        if (pageId) {
          const instagramDetails = await getInstagramAccount(pageId, longLivedAccessToken);
          let instagramId = instagramDetails?.instagram_business_account?.id;
          let instagramUserName = instagramDetails?.instagram_business_account?.username;
          let instagramName = instagramDetails?.instagram_business_account?.name;
          if (instagramId) {
            const response = await axios.post(`${DATA_SERVICE_URL}/users/create-user`, {
              instagramId,
              pageId,
              instagramUserName,
              instagramName,
              longLivedAccessToken
            });

            const { user, isUserExist, organizationId } = response.data;

            const token = jwt.sign(
              {
                organizationId: organizationId,
                facebookPageId: user.facebookPageId,
                role: user.role,
              },
              process.env.JWT_SECRET,
              { expiresIn: "7d" }
            );

            if (isUserExist) {
              return res.status(200).json({
                token: token,
                isUserExist: isUserExist,
                organizationId: organizationId,
              });
            }

            if (user) {
              createAiUser(organizationId);
              saveEvent("USER_CREATED", {
                organizationId: user.organizationId,
                instagramId: user.instagramId,
                facebookPageId: user.facebookPageId,
                instagramUserName: user.instagramUserName,
              });
            }

            const postDetails = await getPostDetails(instagramId, longLivedAccessToken);

            await axios.post(`${DATA_SERVICE_URL}/users/upsert-post-details`, {
              organizationId,
              postDetails
            });

            const eventPostInfo = postDetails.map((post) => ({
              id: post.id,
              media_type: post.media_type
            }));

            saveEvent("INSTAGRAM_SYNC_COMPLETE", {
              organizationId: organizationId,
              posts: eventPostInfo
            });

            res.status(200).json({
              token: token,
              isUserExist: false,
              organizationId: organizationId,
            });
          } else {
            console.error("Could not fetch instagram Id");
            res.status(500).json({ error: "Could not fetch instagram Id" });
          }
        } else {
          console.error("Could not fetch page Id");
          res.status(500).json({ error: "Could not fetch page Id" });
        }
      } else {
        console.error("Could not generate long lived access token");
        res.status(500).json({ error: "Could not generate long lived access token" });
      }
    } else {
      console.error("Could not generate access token");
      res.status(500).json({ error: "Could not generate access token" });
    }
  } catch (error) {
    console.error("Error occurred during login", error);
    res.status(500).json({ error: "Error occurred during login" });
  }
};

const instagramLogin = async (req, res) => {
  try {
    let code = req.query["code"];
    let longLivedAccessToken;
    if (code) {
      let shortToken = await getAccessTokenInstagram(code);
      if(shortToken) longLivedAccessToken = await getLongLivedAccessTokenInstagram(shortToken);
      if (longLivedAccessToken) {
        const instagramDetails = await getInstagramAccountWithoutFB(longLivedAccessToken);
        let instagramId = instagramDetails?.user_id;
        let instagramUserName = instagramDetails?.username;
        let instagramName = instagramDetails?.name;
        if (instagramId) {
          const response = await axios.post(`${DATA_SERVICE_URL}/users/create-user`, {
            instagramId,
            instagramUserName,
            instagramName,
            longLivedAccessToken,
            instagramLogin: true
          });

          const { user, isUserExist, organizationId } = response.data;

          const token = jwt.sign(
            {
              organizationId: organizationId,
              instagramId: instagramId,
              role: user.role,
            },
            process.env.JWT_SECRET,
            { expiresIn: "7d" }
          );

          if (isUserExist) {
            return res.status(200).json({
              token: token,
              isUserExist: isUserExist,
              organizationId: organizationId,
            });
          }

          if (user) {
            createAiUser(organizationId);
            saveEvent("USER_CREATED", {
              organizationId: user.organizationId,
              instagramId: user.instagramId,
              // facebookPageId: user.facebookPageId,
              instagramUserName: user.instagramUserName,
            });
          }

          const postDetails = await getPostDetailsInstagram(instagramId, longLivedAccessToken);
          await axios.post(`${DATA_SERVICE_URL}/users/upsert-post-details`, {
            organizationId,
            postDetails
          });

          const eventPostInfo = postDetails.map((post) => ({
            id: post.id,
            media_type: post.media_type
          }));

          saveEvent("INSTAGRAM_SYNC_COMPLETE", {
            organizationId: organizationId,
            posts: eventPostInfo
          });

          res.status(200).json({
            token: token,
            isUserExist: false,
            organizationId: organizationId,
          });
        } else {
          console.error("Could not fetch instagram Id");
          res.status(500).json({ error: "Could not fetch instagram Id" });
        }
      } else {
        console.error("Could not generate long lived access token");
        res.status(500).json({ error: "Could not generate long lived access token" });
      }
    } else {
      console.error("Could not generate access token");
      res.status(500).json({ error: "Could not generate access token" });
    }
  } catch (error) {
    console.error("Error occurred during Instagram login", error);
    res.status(500).json({ error: "Error occurred during Instagram login" });
  }
};

const login = async (req, res) => {
  try {
    const { username, password } = req.body;

    console.log(`Attempting login for username: ${username}`);

    if (!username || !password) {
      console.log('Login attempt without username or password');
      return res.status(400).json({ error: "Username and password are required" });
    }

    const response = await axios.post(`${DATA_SERVICE_URL}/users/validate-login`, {
      username,
      password
    });

    const { otherUserId, role, organizationId } = response.data;

    let tokenPayload = {
      otherUserId,
      role
    };

    if (organizationId) {
      tokenPayload.organizationId = organizationId;
    }

    const token = jwt.sign(tokenPayload, process.env.JWT_SECRET, { expiresIn: "7d" });

    console.log(`Login successful for username: ${username}`);

    const responseData = {
      token,
      otherUserId
    };

    if (organizationId) {
      responseData.organizationId = organizationId;
    }

    res.status(200).json(responseData);
  } catch (error) {
    console.error("Error during login:", error.message);
    if (error.response) {
      // The request was made and the server responded with a status code
      // that falls out of the range of 2xx
      res.status(error.response.status).json({ error: error.response.data.error });
    } else {
      res.status(500).json({ error: "Internal server error" });
    }
  }
};

generateAndSaveOTP = async (req, res) => {
  try {
    const { organization_id, phone_no } = req.body;

    console.log(`Generating OTP for organization_id: ${organization_id}, phone: ${phone_no}`);

    if (!organization_id || !phone_no) {
      console.log('Missing required fields for OTP generation');
      return res.status(400).json({ error: "organization_id and phone_no are required" });
    }

    const generatedOTP = Math.floor(100000 + Math.random() * 900000);

    await axios.post(`${DATA_SERVICE_URL}/users/save-otp`, {
      organization_id,
      phone_no,
      otp: generatedOTP
    });

    console.log(`OTP generated and saved successfully for organization_id: ${organization_id}`);
    res.status(200).json({ message: "OTP generated and saved successfully" });
  } catch (error) {
    console.error("Error generating or saving OTP:", error);
    res.status(500).json({ error: "Failed to generate and save OTP" });
  }
};

const sendOtp = async (req, res) => {
  try {
    const { organizationId, phone_no } = req.body;
    if (!organizationId || !phone_no) {
      return res
        .status(400)
        .json({ error: "Missing required fields: originator_id and phone_no" });
    }
    const generatedOTP = await generateAndSaveOTP(organizationId, phone_no);
    return res.json({ success: true });
  } catch (error) {
    console.error("Error sending OTP:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
};

const verifyOtp = async (req, res) => {
  try {
    const { organizationId, phone, otp } = req.body;

    console.log(`Verifying OTP for organizationId: ${organizationId}, phone: ${phone}`);

    if (!organizationId || !phone || !otp) {
      console.log('Missing required fields for OTP verification');
      return res.status(400).json({
        error: "Missing required fields: organizationId, phone, and otp",
      });
    }

    const response = await axios.post(`${DATA_SERVICE_URL}/users/verify-otp`, {
      organizationId,
      phone,
      otp
    });

    console.log(`OTP verification result for organizationId: ${organizationId}: ${JSON.stringify(response.data)}`);
    return res.status(response.status).json(response.data);
  } catch (error) {
    console.error("Error verifying OTP:", error);
    if (error.response) {
      return res.status(error.response.status).json(error.response.data);
    }
    return res.status(500).json({ error: "Internal server error" });
  }
};

const createOtherUser = async (req, res) => {
  try {
    const { username, password, role } = req.body;

    console.log(`Attempting to create other user with username: ${username}`);

    if (!username || !password) {
      console.log('Missing username or password for other user creation');
      return res.status(400).json({ error: "Username and password are required" });
    }

    if (role && role !== "MVADMIN") {
      console.log('Invalid role for other user creation');
      return res.status(400).json({ error: "Invalid role" });
    }

    const response = await axios.post(`${DATA_SERVICE_URL}/other-user/create`, {
      username,
      password,
      role
    });

    console.log(`Other user created successfully: ${username}`);
    return res.status(response.status).json(response.data);
  } catch (error) {
    console.error("Error creating other user:", error);
    if (error.response) {
      return res.status(error.response.status).json(error.response.data);
    }
    return res.status(500).json({ error: "Internal server error" });
  }
};

const updateOtherUser = async (req, res) => {
  try {
    const { otherUserId } = req.params;
    const { password, role } = req.body;

    console.log(`Attempting to update other user with id: ${otherUserId}`);

    if (!otherUserId) {
      console.log('Missing otherUserId for user update');
      return res.status(400).json({ error: "OtherUserId is required" });
    }

    const response = await axios.put(`${DATA_SERVICE_URL}/other-user/update/${otherUserId}`, {
      password,
      role
    });

    console.log(`Other user updated successfully: ${otherUserId}`);
    return res.status(response.status).json(response.data);
  } catch (error) {
    console.error("Error updating other user:", error);
    if (error.response) {
      return res.status(error.response.status).json(error.response.data);
    }
    return res.status(500).json({ error: "Internal server error" });
  }
};

module.exports = {
  facebookLogin,
  instagramLogin,
  sendOtp,
  verifyOtp,
  login,
  createOtherUser,
  updateOtherUser,
};
