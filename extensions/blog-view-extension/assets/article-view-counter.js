
class ArticleViewTracker {
  constructor(apiUrl, articleElement) {
    this.apiUrl = apiUrl;
    this.articleElement = articleElement;
    this.articleId = articleElement.getAttribute("data-article-id");
    this.storageKey = `article_viewed_${this.articleId}`;
    this.counterSpan = articleElement.querySelector("span");
  }

  hasViewed() {
    return localStorage.getItem(this.storageKey) === "true";
  }

  markViewed() {
    localStorage.setItem(this.storageKey, "true");
  }

  sendView() {
    if (this.hasViewed()) {
      console.log(`View already counted for article ID: ${this.articleId}`);
      return;
    }

    console.log(`Sending view for article ID: ${this.articleId}`);

    console.log("API URL:", this.apiUrl);
    console.log("Payload:", { article_id: this.articleId });


    fetch(this.apiUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ article_id: this.articleId })
    })
      .then(response => {
        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }
        return response.json();
      })
      .then(data => {
        console.log("API Response:", data);

        // ✅ Update counter if backend returned view count
        if (data.view_count !== undefined && this.counterSpan) {
          this.counterSpan.textContent = data.view_count;
        }

        // ✅ Mark as viewed so we don’t double-count
        this.markViewed();
      })
      .catch(error => {
        console.error("API fetch failed:", error);
      });
  }
}

document.addEventListener("DOMContentLoaded", () => {
  const viewDiv = document.querySelector(".view-counter");

  if (!viewDiv) {
    console.error("View counter element not found!");
    return;
  }

  // ✅ Use your ngrok/production backend URL
  const tracker = new ArticleViewTracker(
    "https://9d287dbee03e.ngrok-free.app/apps/articles",
    viewDiv
  );

  tracker.sendView();
});
