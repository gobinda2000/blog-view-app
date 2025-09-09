async function getOrCreateGuestId() {
  const existingId = localStorage.getItem("guest_customer_id");
  if (existingId) return existingId;

  const newId = `guest-${Date.now()}-${Math.floor(Math.random() * 10000)}`;
  localStorage.setItem("guest_customer_id", newId);
  return newId;
}

class ArticleLikeTracker {
  constructor(apiUrl, articleElement) {
    this.apiUrl = apiUrl; // e.g. "http://localhost:9292/apps/articles"
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
    return await getOrCreateGuestId();
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
      customer_id: customerId
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
      // ✅ Use the correct field name
      if (data.like_count !== undefined && this.counterSpan) {
        this.counterSpan.textContent = data.like_count;
      }
      this.markLiked(); // ✅ only after success
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
