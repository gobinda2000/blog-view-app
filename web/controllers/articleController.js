const { getArticleViewCount, updateArticleViewCount ,getArticleLikeCount, updateArticleLikeCount } = require("../models/articleModel");

async function incrementViewCount(req, res) {
  try {
    const { article_id } = req.body;
    if (!article_id) {
      return res.status(400).json({ success: false, error: "Missing article_id" });
    }

    const articleGID = `gid://shopify/Article/${article_id}`;
    let newCount = 1;

    // Fetch current count
    const data = await getArticleViewCount(articleGID);
    const current = data?.article?.metafield?.value;

    if (current) newCount = parseInt(current, 10) + 1;

    // Update count
    const updateRes = await updateArticleViewCount(articleGID, String(newCount));
    const errors = updateRes?.metafieldsSet?.userErrors || [];

    if (errors.length) {
      throw new Error(errors[0].message);
    }

    res.json({ success: true, article_id, new_view_count: newCount });
  } catch (error) {
    console.error("Error incrementing view count:", error);
    res.status(500).json({ success: false, error: error.message });
  }
}
async function incrementLikeCount(req, res) {
  try {
    const { article_id, customer_id } = req.body;
    if (!article_id || !customer_id) {
      return res.status(400).json({ success: false, error: "Missing article_id or customer_id" });
    }

    const articleGID = `gid://shopify/Article/${article_id}`;
    const result = await getArticleLikeCount(articleGID);

    const likeCount = result?.data?.article?.likeCount?.value
      ? parseInt(result.data.article.likeCount.value, 10)
      : 0;

    // Parse customer_likes list
    let customerLikes = [];
    const customerLikesRaw = result?.data?.article?.customerLikes?.value;
    if (customerLikesRaw) {
      try {
        customerLikes = JSON.parse(customerLikesRaw);
      } catch {
        customerLikes = [];
      }
    }

    // Prevent duplicate likes
    if (customerLikes.includes(customer_id)) {
      return res.status(200).json({
        success: false,
        message: "User already liked this article.",
        like_count: likeCount
      });
    }

    // Increment and update
    const newLikeCount = likeCount + 1;
    customerLikes.push(customer_id);

    const updateRes = await updateArticleLikeCount(articleGID, {
      likeCount: newLikeCount,
      customerLikes
    });
    const errors = updateRes?.data?.metafieldsSet?.userErrors || []; // FIXED

    if (errors.length) {
      throw new Error(errors[0].message);
    }

    res.json({
      success: true,
      article_id,
      like_count: newLikeCount,
      message: "Article liked successfully"
    });
  } catch (error) {
    console.error("Error incrementing like count:", error);
    res.status(500).json({ success: false, error: error.message });
  }
}

module.exports = { incrementViewCount ,incrementLikeCount };
