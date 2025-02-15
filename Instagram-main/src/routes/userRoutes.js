const express = require("express");
const {
  getUsers,
  upsertOrganizationData,
  getUser,
  getPosts,
  upsertResponseTemplate,
  getResponseTemplate,
  updatePrompt,
  getPrompts,
  refreshInstagramPosts,
  updateSetting,
  getSetting,
  addTeamMember,
  getUserRole,
  getAccountDetails,
  updateAccountDetails,
  subscribeToWebhooks,
  unSubscribeToWebhooks,
  getSubscription,
  getPostWithInsights,
  untagProductFromPost,
  getPostsByProduct,
  getInstagramInsights,
  updateUserProfileAndTemplate,
} = require("../controllers/userController");

const router = express.Router();

router.post("/organization/data", upsertOrganizationData);

router.post("/response/template", upsertResponseTemplate);

router.get("/response/template", getResponseTemplate);

router.post("/context/prompt/:organizationId/:promptId", updatePrompt);

router.get("/context/prompt", getPrompts);

router.get("/getprofiledetails", getUser);

router.get("/:organizationId/posts", getPosts);

router.post("/refresh", refreshInstagramPosts);

router.post("/update-setting", updateSetting);

router.get("/setting", getSetting);

router.post("/team", addTeamMember);

router.get("/role", getUserRole);

router.get("/account-details/:organizationId", getAccountDetails);

router.post("/account-details/:organizationId", updateAccountDetails);

router.post("/subscribe/:organizationId", subscribeToWebhooks);

router.delete("/subscribe/:organizationId", unSubscribeToWebhooks);

router.get("/subscribe/:organizationId", getSubscription);

router.get('/:organizationId/posts/:postId/with-insights', getPostWithInsights);

router.post('/:organizationId/posts/:postId/untag-product', untagProductFromPost);
router.get("/:organizationId/product/:productId/posts", getPostsByProduct);

router.get('/:organizationId/instagram-insights', getInstagramInsights);
router.post('/:organizationId/profile-and-template', updateUserProfileAndTemplate);



module.exports = router;
