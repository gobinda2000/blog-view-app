const express = require("express");
const router = express.Router();
const { incrementViewCount } = require("../controllers/articleController");

router.post("/apps/articles", incrementViewCount);

module.exports = router;
