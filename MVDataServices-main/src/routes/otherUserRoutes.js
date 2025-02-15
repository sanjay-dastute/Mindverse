const express = require("express");

const { updateOtherUser, createOtherUser, getUserRoleByOrganization, getOtherUserRole, getTeamMemberRole } = require("../controllers/otherUserController");

const router = express.Router();

router.post('/create', createOtherUser);
router.put('/update/:otherUserId', updateOtherUser);
router.get('/role/organization/:organizationId', getUserRoleByOrganization);
router.get('/role/other-user/:otherUserId', getOtherUserRole);
router.get('/role/team-member/:organizationId/:otherUserId', getTeamMemberRole);

module.exports = router;
