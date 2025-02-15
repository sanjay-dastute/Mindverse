const axios = require("axios");
require("dotenv").config();
const { createHmac } = require("crypto");

const appId = process.env.INSTAGRAM_APP_ID;
const appSecret = process.env.INSTAGRAM_APP_SECRET;

const instagramBaseUrl = process.env.INSTAGRAM_BASE_API;
const instagramGraphApi = process.env.INSTAGRAM_GRAPH_API;
const redirectUri = process.env.REACT_APP_INSTAGRAM_REDIRECT;
const grantType = 'authorization_code';

async function getAccessTokenInstagram(code) {

    const authUrl = `${instagramBaseUrl}/oauth/access_token`;
    const payload = {
        client_id: appId,
        client_secret: appSecret,
        grant_type: grantType,
        redirect_uri: redirectUri,
        code: code,
    };

    try {
        const response = await axios.post(authUrl, new URLSearchParams(payload), {
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
        });
        return response?.data?.access_token;
    } catch (error) {
        console.error("Error fetching access token:", error.response?.data || error.message);
        throw error;
    }
}


async function getLongLivedAccessTokenInstagram(shortLivedAccessToken) {
    try {
        const response = await axios.get(
            `${instagramGraphApi}/access_token?grant_type=ig_exchange_token&client_secret=${appSecret}&access_token=${shortLivedAccessToken}`
        );
        const access_token = response?.data?.access_token;
        return access_token;
    } catch (error) {
        console.error(
            "Error fetching longlived access token:",
            error.response ? error.response.data : error.message
        );
        throw error;
    }
}

// async function getInstagramAccountDetails(longLivedAccessToken) {
//   try {
//     const response = await axios.get(
//       `${instagramGraphApi}/me/accounts?access_token=${longLivedAccessToken}`
//     );

//     const accountDetail = response.data.data.map((item) => ({
//       id: item.id,
//       access_token: item.access_token
//     }));
//     //console.log(accountDetail);
//     return accountDetail;
//   } catch (error) {
//     console.error(
//       "Error fetching account details:",
//       error.response ? error.response.data : error.message
//     );
//     throw error;
//   }
// }

async function getInstagramAccountWithoutFB(longLivedaccessToken) {
    try {
        const response = await axios.get(
            `${instagramGraphApi}/v21.0/me?fields=user_id,id,name,username,account_type,profile_picture_url,biography,followers_count,follows_count,media_count&access_token=${longLivedaccessToken}`
        );

        const instagramDetails = response?.data;
        return instagramDetails;
    } catch (error) {
        console.error(
            "Error fetching Instagram  account:",
            error.response ? error.response.data : error.message
        );
        throw error;
    }
}

async function getPostDetailsInstagram(instagramId, longLivedaccessToken) {
    try {
        let allPostDetails = []; //note down below url
        let nextUrl = `${instagramGraphApi}/v21.0/${instagramId}/media?fields=id,media_type,media_url,thumbnail_url,permalink,comments_count,caption,media_product_type,comments{id,text,timestamp,like_count,replies{id,text,timestamp,like_count}},like_count,location,timestamp,owner,dimensions,likes{count}&limit=30&access_token=${longLivedaccessToken}`;

        while (nextUrl) {
            const response = await axios.get(nextUrl);
            const postDetails = response?.data?.data;

            if (postDetails && postDetails.length > 0) {
                allPostDetails = [...allPostDetails, ...postDetails];
            }

            nextUrl = response?.data?.paging?.next;
        }

        return allPostDetails;
    } catch (error) {
        console.error(
            "Error fetching posts from instagram:",
            error.response ? error.response.data : error.message
        );
        throw error;
    }
}

function verifyRequestSignatureInstagram(req, buf) {
    var signature = req.headers["x-hub-signature-256"];
    if (!signature) {
        console.warn(`Couldn't find "x-hub-signature-256" in headers.`);
    } else {
        var elements = signature.split("=");
        var signatureHash = elements[1];
        var expectedHash = createHmac("sha256", appSecret)
            .update(buf)
            .digest("hex");
        if (signatureHash !== expectedHash) {
            throw new Error("Couldn't validate the request signature.");
        }
    }
}

module.exports = {
    getAccessTokenInstagram,
    getLongLivedAccessTokenInstagram,
    getInstagramAccountWithoutFB,
    getPostDetailsInstagram,
    verifyRequestSignatureInstagram,
    // getInstagramAccountDetails
}