const express = require("express");
const router = express.Router();
const { incrementViewCount ,incrementLikeCount } = require("../controllers/articleController");

router.post("/apps/articles", incrementViewCount);
router.post("/apps/articles/likes", incrementLikeCount);

module.exports = router;
