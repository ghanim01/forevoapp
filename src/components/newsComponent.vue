<template>
  <div class="news-container">
    <v-card class="news-card" elevation="8">
      <div class="card-header">
        <div class="header-label-group">
          <h2 class="header-title">Middle East Headlines</h2>
          <span class="header-subtitle">
            {{ articles.length > 0 ? `${articles.length} articles` : "Trending stories" }}
          </span>
        </div>
        <div class="header-actions">
          <span v-if="lastUpdated" class="cache-badge" :title="`Last updated ${lastUpdated}`">
            <v-icon icon="mdi-clock-outline" size="12" aria-hidden="true"></v-icon>
            {{ lastUpdated }}
          </span>
          <button
            class="refresh-btn"
            @click="refreshNews"
            :disabled="newsStore.isLoading"
            :title="newsStore.isLoading ? 'Loading...' : 'Refresh news'"
            aria-label="Refresh news"
          >
            <v-icon
              icon="mdi-refresh"
              size="small"
              :class="{ 'refreshing': newsStore.isLoading }"
            ></v-icon>
          </button>
        </div>
      </div>

      <div v-if="newsStore.isLoading" class="loading-state">
        <div class="skeleton-news">
          <div class="skeleton-article" v-for="n in 3" :key="n">
            <div class="sk-image"></div>
            <div class="sk-body">
              <div class="sk-line badge-width"></div>
              <div class="sk-line"></div>
              <div class="sk-line third-width"></div>
              <div class="sk-line half-width"></div>
            </div>
          </div>
        </div>
      </div>

      <div v-else-if="newsStore.error" class="error-state">
        <v-icon icon="mdi-newspaper-variant-outline" size="48" class="error-icon"></v-icon>
        <p class="error-message">{{ newsStore.error }}</p>
        <button class="retry-btn" @click="newsStore.fetchNews(true)">
          <v-icon icon="mdi-refresh" size="small"></v-icon>
          Retry
        </button>
      </div>

      <div v-else class="news-grid">
        <div v-if="articles.length === 0" class="no-articles">
          <v-icon icon="mdi-newspaper-variant-multiple-outline" size="x-large" aria-hidden="true"></v-icon>
          <p>No articles available</p>
        </div>

        <a
          v-for="(article, index) in articles"
          :key="`${article.id}-${index}`"
          :href="article.url"
          target="_blank"
          rel="noopener noreferrer"
          class="article-card"
          :style="{ '--card-delay': `${index * 50}ms` }"
        >
          <div class="card-image-container">
            <img
              v-if="article.urlToImage"
              :src="article.urlToImage"
              :alt="article.title"
              class="card-image"
              loading="lazy"
            />
            <div v-else class="card-image-placeholder">
              <v-icon icon="mdi-image-off" size="large" aria-hidden="true"></v-icon>
            </div>
          </div>

          <div class="card-content">
            <div class="source-badge">{{ article.source.name }}</div>

            <h3 class="article-title">{{ articleTitle(article.title) }}</h3>

            <p class="article-description">{{ article.description }}</p>

            <div class="card-footer">
              <span class="article-date">{{ convertDate(article.publishedAt) }}</span>
              <v-icon
                icon="mdi-arrow-top-right"
                size="small"
                class="link-icon"
                aria-hidden="true"
              ></v-icon>
            </div>
          </div>
        </a>
      </div>
    </v-card>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted } from "vue";
import { useNewsStore } from "../stores/NewsStore";

const newsStore = useNewsStore();

onMounted(() => {
  newsStore.fetchNews();
});

const articles = computed(() => {
  return newsStore.getNewsResult;
});

const lastUpdated = computed(() => {
  return newsStore.getLastUpdated;
});

const refreshNews = () => {
  newsStore.fetchNews(true);
};

/**
 * Strips the source attribution suffix from article titles.
 * Many GNews titles end with " - SourceName", we clean that off.
 */
const articleTitle = (x: string): string => {
  if (!x) return "";
  // Remove trailing " - SourceName" or " | SourceName" patterns
  const lastDash = x.lastIndexOf(" - ");
  if (lastDash > Math.floor(x.length * 0.4)) {
    return x.substring(0, lastDash).trim();
  }
  const lastPipe = x.lastIndexOf(" | ");
  if (lastPipe > Math.floor(x.length * 0.4)) {
    return x.substring(0, lastPipe).trim();
  }
  return x.trim();
};

const convertDate = (utc: string): string => {
  const mDate = new Date(utc);
  const now = new Date();
  const diffMs = now.getTime() - mDate.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffMins < 1) return "Just now";
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;

  return mDate.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: mDate.getFullYear() !== now.getFullYear() ? "numeric" : undefined,
  });
};
</script>

<style scoped>
.news-container {
  width: 100%;
  height: 100%;
}

.news-card {
  background: linear-gradient(
    135deg,
    rgba(17, 29, 59, 0.5),
    rgba(15, 23, 42, 0.5)
  );
  border: none;
  border-radius: 0;
  overflow: visible;
  backdrop-filter: blur(10px);
  display: flex;
  flex-direction: column;
  min-height: 100%;
}

.card-header {
  padding: 0.75rem 1.25rem;
  background: linear-gradient(
    135deg,
    rgba(168, 85, 247, 0.06),
    rgba(8, 145, 178, 0.04)
  );
  border-bottom: 1px solid rgba(168, 85, 247, 0.1);
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  flex-shrink: 0;
}

.header-label-group {
  display: flex;
  flex-direction: column;
  gap: 0.05rem;
  min-width: 0;
}

.header-title {
  font-size: 0.85rem;
  font-weight: 700;
  color: white;
  margin: 0;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.header-subtitle {
  font-size: 0.65rem;
  color: rgba(255, 255, 255, 0.5);
  font-weight: 400;
}

.header-icon {
  opacity: 0.5;
  color: rgba(168, 85, 247, 0.6);
  flex-shrink: 0;
}

.header-actions {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  flex-shrink: 0;
}

.cache-badge {
  display: inline-flex;
  align-items: center;
  gap: 0.25rem;
  font-size: 0.6rem;
  color: rgba(255, 255, 255, 0.45);
  white-space: nowrap;
  padding: 0.2rem 0.45rem;
  background: rgba(255, 255, 255, 0.04);
  border-radius: 6px;
}

.refresh-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  border: 1px solid rgba(168, 85, 247, 0.15);
  background: rgba(168, 85, 247, 0.06);
  border-radius: 8px;
  color: rgba(168, 85, 247, 0.6);
  cursor: pointer;
  transition: all 0.2s ease;
  padding: 0;
}

.refresh-btn:hover {
  background: rgba(168, 85, 247, 0.15);
  border-color: rgba(168, 85, 247, 0.3);
  color: #c084fc;
}

.refresh-btn:active {
  transform: scale(0.9);
}

.refresh-btn:disabled {
  opacity: 0.4;
  cursor: not-allowed;
  transform: none;
}

.refresh-btn .refreshing {
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

/* Loading */
.loading-state {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 400px;
  padding: 2rem;
}

.skeleton-news {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  width: 100%;
}

.skeleton-article {
  display: flex;
  gap: 0.75rem;
  background: rgba(255, 255, 255, 0.03);
  border-radius: 12px;
  padding: 0.75rem;
}

.sk-image {
  width: 80px;
  height: 60px;
  border-radius: 8px;
  flex-shrink: 0;
  background: linear-gradient(
    90deg,
    rgba(255, 255, 255, 0.06) 25%,
    rgba(255, 255, 255, 0.15) 50%,
    rgba(255, 255, 255, 0.06) 75%
  );
  background-size: 200% 100%;
  animation: shimmer 1.5s infinite;
}

.sk-body {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.sk-line {
  height: 10px;
  border-radius: 5px;
  background: linear-gradient(
    90deg,
    rgba(255, 255, 255, 0.06) 25%,
    rgba(255, 255, 255, 0.15) 50%,
    rgba(255, 255, 255, 0.06) 75%
  );
  background-size: 200% 100%;
  animation: shimmer 1.5s infinite;
}

.sk-line.badge-width {
  width: 60px;
}

.sk-line.third-width {
  width: 60%;
}

.sk-line.half-width {
  width: 45%;
}

@keyframes shimmer {
  0% {
    background-position: 200% 0;
  }
  100% {
    background-position: -200% 0;
  }
}

/* Error */
.error-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 300px;
  gap: 0.75rem;
  padding: 2rem;
  text-align: center;
}

.error-icon {
  color: rgba(239, 68, 68, 0.7);
}

.error-message {
  color: rgba(255, 255, 255, 0.8);
  font-size: 0.9rem;
  margin: 0;
}

.retry-btn {
  display: flex;
  align-items: center;
  gap: 0.4rem;
  padding: 0.5rem 1.25rem;
  background: rgba(8, 145, 178, 0.15);
  border: 1px solid rgba(8, 145, 178, 0.3);
  border-radius: 20px;
  color: #6ba3b8;
  font-size: 0.85rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  font-family: inherit;
}

.retry-btn:hover {
  background: rgba(8, 145, 178, 0.25);
  border-color: rgba(8, 145, 178, 0.5);
  color: white;
}

.retry-btn:active {
  transform: scale(0.96);
}

/* News Grid */
.news-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 1rem;
  padding: 1.25rem;
  flex-grow: 1;
}

@media (max-width: 1024px) {
  .news-grid {
    grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
    gap: 0.85rem;
    padding: 1rem;
  }
}

@media (max-width: 768px) {
  .news-grid {
    grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
    gap: 0.85rem;
    padding: 0.85rem;
  }
}

@media (max-width: 640px) {
  .news-grid {
    grid-template-columns: 1fr;
    gap: 0.75rem;
    padding: 0.75rem;
  }

  .card-header {
    padding: 0.85rem 1rem;
  }

  .header-title {
    font-size: 0.8rem;
  }

  .article-card {
    border-radius: 12px;
  }
}

/* Empty */
.no-articles {
  grid-column: 1 / -1;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  min-height: 300px;
  color: rgba(255, 255, 255, 0.5);
  text-align: center;
}

.no-articles p {
  margin: 1rem 0 0 0;
  font-size: 1rem;
}

/* Article Card */
.article-card {
  display: flex;
  flex-direction: column;
  background: linear-gradient(
    135deg,
    rgba(17, 29, 59, 0.4),
    rgba(15, 23, 42, 0.4)
  );
  border: 1px solid rgba(168, 85, 247, 0.08);
  border-radius: 16px;
  overflow: hidden;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  text-decoration: none;
  color: inherit;
  height: 100%;
  position: relative;
  animation: cardEntrance 0.4s ease-out both;
  animation-delay: var(--card-delay, 0ms);
}

@keyframes cardEntrance {
  from {
    opacity: 0;
    transform: translateY(8px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.article-card:hover {
  border-color: rgba(168, 85, 247, 0.25);
  box-shadow: 0 16px 48px rgba(168, 85, 247, 0.08);
  background: linear-gradient(
    135deg,
    rgba(168, 85, 247, 0.08),
    rgba(8, 145, 178, 0.04)
  );
  transform: translateY(-2px);
}

.article-card:active {
  transform: translateY(0) scale(0.98);
}

.article-card::before {
  content: "";
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(
    180deg,
    rgba(0, 0, 0, 0) 0%,
    rgba(0, 0, 0, 0.3) 100%
  );
  pointer-events: none;
  z-index: 1;
}

.card-image-container {
  width: 100%;
  height: 170px;
  overflow: hidden;
  background: linear-gradient(135deg, #0f3460, #16213e);
}

.card-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.4s ease;
}

.article-card:hover .card-image {
  transform: scale(1.08);
}

.card-image-placeholder {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #0f3460, #16213e);
  color: rgba(255, 255, 255, 0.25);
}

.card-content {
  display: flex;
  flex-direction: column;
  padding: 1rem;
  flex-grow: 1;
  position: relative;
  z-index: 2;
  gap: 0.4rem;
}

.source-badge {
  display: inline-block;
  background: rgba(168, 85, 247, 0.12);
  border: 1px solid rgba(168, 85, 247, 0.15);
  color: #c084fc !important;
  padding: 0.25rem 0.55rem;
  border-radius: 6px;
  font-size: 0.6rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.4px;
  width: fit-content;
}

.article-title {
  font-size: 0.9rem;
  font-weight: 600;
  color: white;
  margin: 0;
  line-height: 1.3;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.article-description {
  font-size: 0.78rem;
  color: rgba(255, 255, 255, 0.6);
  margin: 0;
  line-height: 1.4;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  flex-grow: 1;
}

.card-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: auto;
  padding-top: 0.5rem;
  border-top: 1px solid rgba(255, 255, 255, 0.08);
}

.article-date {
  font-size: 0.65rem;
  color: rgba(255, 255, 255, 0.5);
  font-weight: 500;
}

.link-icon {
  color: rgba(168, 85, 247, 0.5);
  transition: all 0.3s ease;
}

.article-card:hover .link-icon {
  color: #a855f7;
  transform: rotate(45deg) scale(1.2);
}
</style>
