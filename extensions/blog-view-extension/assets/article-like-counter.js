async function getGuestId() {
  try {
    const response = await fetch("https://api64.ipify.org?format=json"); // Public IP API
    const data = await response.json();
    return `ip-${data.ip.replace(/\./g, "-")}`; // e.g., ip-192-168-1-100
  } catch (error) {
    console.error("Failed to fetch IP:", error);
    return `guest-${Date.now()}`; // fallback random ID
  }
}

class ArticleLikeTracker {
  constructor(apiUrl, articleElement) {
    this.apiUrl = apiUrl;
    this.articleElement = articleElement;
    this.articleId = articleElement.getAttribute("data-article-id");
    this.customerId = articleElement.getAttribute("data-customer-id") || null;
    this.storageKey = `article_liked_${this.articleId}`;
    this.counterSpan = articleElement.querySelector(".like-count");
    this.likeButton = articleElement.querySelector(".like-button");
    this.init();
  }

  async getCustomerId() {
    if (this.customerId && this.customerId.trim() !== "") {
      return this.customerId; // Logged-in user
    }
    return await getGuestId(); // Guest → IP-based ID
  }

  hasLiked() {
    return localStorage.getItem(this.storageKey) === "true";
  }

  markLiked() {
    localStorage.setItem(this.storageKey, "true");
  }

  async sendLike() {
    if (this.hasLiked()) {
      console.log(`Already liked article ID: ${this.articleId}`);
      return;
    }

    const customerId = await this.getCustomerId();

    const payload = {
      article_id: this.articleId,
      customer_id: customerId // Always send something now
    };

    fetch(this.apiUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    })
    .then(response => {
      if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);
      return response.json();
    })
    .then(data => {
      console.log("API Response:", data);

      if (data.new_count !== undefined && this.counterSpan) {
        this.counterSpan.textContent = data.new_count;
      }

      this.markLiked();
    })
    .catch(error => {
      console.error("API fetch failed:", error);
    });
  }

  init() {
    if (!this.likeButton) return;
    this.likeButton.addEventListener("click", () => this.sendLike());
  }
}

document.addEventListener("DOMContentLoaded", () => {
  const likeDiv = document.querySelector(".blog-likes");
  if (!likeDiv) {
    console.error("Like button element not found!");
    return;
  }

  const tracker = new ArticleLikeTracker(
    "https://e03f69676878.ngrok-free.app/apps/articles", // Your API endpoint
    likeDiv
  );
});
