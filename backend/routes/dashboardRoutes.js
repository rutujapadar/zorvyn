const express = require("express");
const router = express.Router();

const auth = require("../middleware/auth");
const role = require("../middleware/role");

const { getSummary } = require("../controllers/recordController");

router.get("/", auth, role("analyst", "admin"), getSummary);

module.exports = router;