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
    this.messageEl = this.articleElement.querySelector(".like-message"); 
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
      // ⚠️ Already liked
      if (this.messageEl) {
        this.messageEl.textContent = "You already liked it.";
        this.messageEl.style.color = "red";
        this.messageEl.style.display = "block";
        this.messageEl.style.background = "#fde8e8";
        this.messageEl.style.border = "1px solid #fca5a5";

         setTimeout(() => {
        this.messageEl.style.display = "none";
      }, 2000);
      }
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

      // ✅ Update count if returned by API
      if (data.like_count !== undefined && this.counterSpan) {
        this.counterSpan.textContent = data.like_count;
      }

      this.markLiked();

      if (this.messageEl) {
        this.messageEl.textContent = "Thanks for liking!";
        this.messageEl.style.color = "green";
        this.messageEl.style.display = "block";
        this.messageEl.style.background = "#dcfce7";
        this.messageEl.style.border = "1px solid #86efac";

        setTimeout(() => {
        this.messageEl.style.display = "none";
      }, 2000);
      }
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
