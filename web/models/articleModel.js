const { shopifyGraphQL } = require("../services/shopifyService");

// To get total views on article
async function getArticleViewCount(articleId) {
  const query = `
    query GetArticleViewCount($id: ID!) {
      article(id: $id) {
        metafield(namespace: "custom", key: "view_count") {
          id
          value
        }
      }
    }
  `;
  return shopifyGraphQL(query, { id: articleId });
}

// To update views on article
async function updateArticleViewCount(ownerId, newCount) {
  const mutation = `
    mutation UpdateArticleViewCount($ownerId: ID!, $newCount: String!) {
      metafieldsSet(metafields: [
        {
          ownerId: $ownerId,
          namespace: "custom",
          key: "view_count",
          type: "number_integer",
          value: $newCount
        }
      ]) {
        metafields {
          id
          value
        }
        userErrors {
          field
          message
        }
      }
    }
  `;
  return shopifyGraphQL(mutation, { ownerId, newCount });
}

// Export functions
module.exports = { getArticleViewCount, updateArticleViewCount };