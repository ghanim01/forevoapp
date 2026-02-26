<template>
  <div class="news-container">
    <v-card class="news-card" elevation="8">
      <div class="card-header">
        <h2 class="header-title">Middle East Headlines</h2>
        <v-icon icon="mdi-newspaper-variant-outline" size="large"></v-icon>
      </div>

      <div v-if="newStore.isLoading" class="loading-state">
        <v-progress-circular indeterminate color="primary" size="48"></v-progress-circular>
      </div>

      <div v-else-if="newStore.error" class="error-state">
        <v-icon icon="mdi-newspaper-variant-outline" size="48" class="error-icon"></v-icon>
        <p class="error-message">{{ newStore.error }}</p>
        <button class="retry-btn" @click="newStore.fetchNews(true)">
          <v-icon icon="mdi-refresh" size="small"></v-icon>
          Retry
        </button>
      </div>

      <div v-else class="news-grid">
        <div v-if="articles.length === 0" class="no-articles">
          <v-icon icon="mdi-newspaper-variant-multiple-outline" size="x-large"></v-icon>
          <p>No articles available</p>
        </div>

        <a
          v-for="(article, index) in articles"
          :key="`${article.id}-${index}`"
          :href="article.url"
          target="_blank"
          rel="noopener noreferrer"
          class="article-card"
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
              <v-icon icon="mdi-image-off" size="large"></v-icon>
            </div>
          </div>

          <div class="card-content">
            <div class="source-badge">{{ article.source.name }}</div>

            <h3 class="article-title">{{ articleTitle(article.title) }}</h3>

            <p class="article-description">{{ article.description }}</p>

            <div class="card-footer">
              <span class="article-date">{{ convertDate(article.publishedAt) }}</span>
              <v-icon icon="mdi-arrow-top-right" size="small" class="link-icon"></v-icon>
            </div>
          </div>
        </a>
      </div>
    </v-card>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from "vue";
import { useNewsStore } from "../stores/NewsStore";

const newStore = useNewsStore();

onMounted(() => {
  newStore.fetchNews();
});

const articles = computed(() => {
  return newStore.getNewsResult;
});

const articleTitle = (x: string): string => {
  const z = x.split("-");
  return z[0];
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
  background: linear-gradient(135deg, rgba(17, 29, 59, 0.5), rgba(15, 23, 42, 0.5));
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
  background: linear-gradient(135deg, rgba(8, 145, 178, 0.08), rgba(107, 33, 168, 0.04));
  border-bottom: 1px solid rgba(8, 145, 178, 0.15);
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
}

.header-title {
  font-size: 1rem;
  font-weight: 600;
  color: white;
  margin: 0;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.loading-state {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 400px;
  padding: 2rem;
}

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
  color: #6BA3B8;
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

.news-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
  gap: 1.25rem;
  padding: 1.5rem;
  flex-grow: 1;
}

@media (max-width: 1024px) {
  .news-grid {
    grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
    gap: 1rem;
    padding: 1.5rem;
  }
}

@media (max-width: 768px) {
  .news-grid {
    grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
    gap: 1rem;
    padding: 1rem;
  }

  .card-header {
    padding: 1.5rem;
  }

  .header-title {
    font-size: 1.5rem;
  }
}

@media (max-width: 640px) {
  .news-grid {
    grid-template-columns: 1fr;
    gap: 0.75rem;
    padding: 0.75rem;
  }

  .card-header {
    padding: 1rem;
  }

  .header-title {
    font-size: 1.2rem;
  }

  .header-subtitle {
    font-size: 0.75rem;
  }

  .article-card {
    border-radius: 12px;
  }

  .article-image {
    height: 150px;
  }

  .article-content {
    padding: 0.85rem;
  }

  .article-title {
    font-size: 0.95rem;
    line-height: 1.3;
    margin-bottom: 0.4rem;
  }

  .article-source {
    font-size: 0.65rem;
    margin-bottom: 0.35rem;
  }

  .article-description {
    font-size: 0.75rem;
    line-height: 1.35;
    margin-bottom: 0.4rem;
  }

  .article-date {
    font-size: 0.6rem;
  }

  .no-articles p {
    font-size: 1rem;
  }
}

@media (max-width: 480px) {
  .news-grid {
    gap: 0.5rem;
    padding: 0.6rem;
  }

  .card-header {
    padding: 0.85rem;
  }

  .header-title {
    font-size: 1rem;
  }

  .header-subtitle {
    font-size: 0.65rem;
  }

  .article-image {
    height: 120px;
  }

  .article-content {
    padding: 0.7rem;
  }

  .article-title {
    font-size: 0.85rem;
    margin-bottom: 0.3rem;
  }

  .article-source {
    font-size: 0.6rem;
    margin-bottom: 0.2rem;
  }

  .article-description {
    font-size: 0.7rem;
    margin-bottom: 0.3rem;
  }

  .card-footer {
    padding-top: 0.3rem;
  }

  .article-date {
    font-size: 0.55rem;
  }

  .no-articles {
    min-height: 200px;
  }

  .no-articles p {
    font-size: 0.9rem;
  }
}

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
  font-size: 1.125rem;
}

.article-card {
  display: flex;
  flex-direction: column;
  background: linear-gradient(135deg, rgba(17, 29, 59, 0.4), rgba(15, 23, 42, 0.4));
  border: 1px solid rgba(8, 145, 178, 0.1);
  border-radius: 16px;
  overflow: hidden;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  text-decoration: none;
  color: inherit;
  height: 100%;
  position: relative;
}

.article-card:hover {
  border-color: rgba(8, 145, 178, 0.25);
  box-shadow: 0 16px 48px rgba(8, 145, 178, 0.1);
  background: linear-gradient(135deg, rgba(8, 145, 178, 0.1), rgba(107, 33, 168, 0.05));
}

.article-card::before {
  content: "";
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(180deg, rgba(0, 0, 0, 0) 0%, rgba(0, 0, 0, 0.3) 100%);
  pointer-events: none;
  z-index: 1;
}

.card-image-container {
  width: 100%;
  height: 160px;
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
  color: rgba(255, 255, 255, 0.3);
}

.card-content {
  display: flex;
  flex-direction: column;
  padding: 1rem;
  flex-grow: 1;
  position: relative;
  z-index: 2;
}

.source-badge {
  display: inline-block;
  background: rgba(8, 145, 178, 0.15);
  border: 1px solid rgba(8, 145, 178, 0.2);
  color: #6BA3B8 !important;
  padding: 0.3rem 0.6rem;
  border-radius: 6px;
  font-size: 0.65rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.3px;
  margin-bottom: 0.5rem;
  width: fit-content;
}

.article-title {
  font-size: 0.95rem;
  font-weight: 600;
  color: white;
  margin: 0 0 0.5rem 0;
  line-height: 1.3;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.article-description {
  font-size: 0.8rem;
  color: rgba(255, 255, 255, 0.65);
  margin: 0 0 0.75rem 0;
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
  border-top: 1px solid rgba(255, 255, 255, 0.1);
}

.article-date {
  font-size: 0.7rem;
  color: rgba(255, 255, 255, 0.55);
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.2px;
}

.link-icon {
  color: rgba(8, 145, 178, 0.6);
  transition: all 0.3s ease;
}

.article-card:hover .link-icon {
  color: #0891B2;
  transform: rotate(45deg) scale(1.2);
}
</style>

