// src/routes/mvAdminRoutes.js
const express = require("express");
const { getAllUsers, getAllUniversalContexts, updateUniversalContext, getOrganizationInsights } = require("../controllers/mvAdminController");

const router = express.Router();

router.get("/all-users", getAllUsers);
router.get("/universal-contexts", getAllUniversalContexts);
router.post("/universal-contexts/:id", updateUniversalContext);
router.get("/organization-insights", getOrganizationInsights);

module.exports = router;