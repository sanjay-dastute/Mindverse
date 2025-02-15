const express = require("express");
const {
  updateAccountDetails,
  upsertOrganizationData,
  createUser,
  upsertPostDetails,
  validateLogin,
  saveOTP,
  verifyOTP,
  getUserByInstagramId,
  getResponseTemplate,
  upsertResponseTemplate,
  getUserById,
  getPosts,
  getPrompts,
  updatePrompt,
  addTeamMember,
  getAllUsersTokens,
  updateUserToken,
  updateSetting,
  getSetting,
  getAccountDetails,
  updateSubscription,
  getSubscription,
  getPostById,
  getUserDetailsOnlyById,
  untagProductFromPost,
  getTaggedPosts,
  getUntaggedPosts,
  getPostsByProduct,
  getPostsExcludingProduct,
  getPostCountByDateRange,
  getIsInstagramLogin
} = require("../controllers/userController");

const router = express.Router();

router.put("/:organizationId/account-details", updateAccountDetails);
router.get("/:organizationId/account-details", getAccountDetails);
router.put("/organization-data", upsertOrganizationData);
router.post('/create-user', createUser);
router.post('/upsert-post-details', upsertPostDetails);
router.get('/posts', getPosts);
router.get('/tagged-posts', getTaggedPosts);
router.get('/untagged-posts', getUntaggedPosts);
router.post('/validate-login', validateLogin);
router.post('/save-otp', saveOTP);
router.post('/verify-otp', verifyOTP);
router.get('/instagram/:instagramId', getUserByInstagramId);
router.get('/response-template', getResponseTemplate);
router.put('/response-template', upsertResponseTemplate);
router.get('/', getUserById);
router.get('/details-only', getUserDetailsOnlyById);
router.get('/prompts', getPrompts);
router.put('/:organizationId/prompts/:promptId', updatePrompt);
router.post('/team-member', addTeamMember);
router.get('/tokens', getAllUsersTokens);
router.put('/token', updateUserToken);
router.put('/setting', updateSetting);
router.get('/setting', getSetting);
router.put('/:organizationId/subscription', updateSubscription);
router.get('/:organizationId/subscription', getSubscription);
router.get('/:organizationId/posts/:postId', getPostById);
router.post("/:organizationId/posts/:postId/untag-product", untagProductFromPost);
router.get('/:organizationId/product/:productId/posts', getPostsByProduct);
router.get('/:organizationId/product/:productId/posts-excluding', getPostsExcludingProduct);
router.get('/:organizationId/post-count', getPostCountByDateRange);
router.get('/instagramLogin', getIsInstagramLogin);


module.exports = router;
