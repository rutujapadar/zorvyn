const express = require("express");
const router = express.Router();

const auth = require("../middleware/auth");
const role = require("../middleware/role");

const {
  createRecord,
  getRecords,
  updateRecord,
  deleteRecord
} = require("../controllers/recordController");

// CREATE
router.post("/", auth, role("admin"), createRecord);

// READ + FILTER
router.get("/", auth, role("viewer", "analyst", "admin"), getRecords);

// UPDATE
router.put("/:id", auth, role("admin"), updateRecord);

// DELETE
router.delete("/:id", auth, role("admin"), deleteRecord);

module.exports = router;