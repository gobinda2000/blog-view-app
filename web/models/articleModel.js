const { shopifyGraphQL } = require("../services/shopifyService");

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

async function getArticleLikeCount(articleId) {
  const fetchQuery = `
    query GetArticleLikes($id: ID!) {
      article(id: $id) {
        likeCount: metafield(namespace: "custom", key: "like_count") {
          value
        }
        customerLikes: metafield(namespace: "custom", key: "customer_likes") {
          value
        }
      }
    }
  `;
  return shopifyGraphQL(fetchQuery, { id: articleId });
}

async function updateArticleLikeCount(ownerId, { likeCount, customerLikes }) {
  const updateMutation = `
    mutation UpdateArticleLikes($ownerId: ID!, $likeCount: String!, $customerLikes: String!) {
      metafieldsSet(metafields: [
        {
          ownerId: $ownerId,
          namespace: "custom",
          key: "like_count",
          type: "number_integer",
          value: $likeCount
        },
        {
          ownerId: $ownerId,
          namespace: "custom",
          key: "customer_likes",
          type: "list.single_line_text_field",
          value: $customerLikes
        }
      ]) {
        metafields {
          id
          key
          value
        }
        userErrors {
          field
          message
        }
      }
    }
  `;
  return shopifyGraphQL(updateMutation, {
    ownerId,
    likeCount: String(likeCount),
    customerLikes: JSON.stringify(customerLikes) // Properly stringify array
  });
}

module.exports = {
  getArticleViewCount, updateArticleViewCount, getArticleLikeCount, updateArticleLikeCount
};