<template>
  <div class="soccer-container">
    <v-card class="soccer-card" elevation="0">
      <!-- Header + Filter -->
      <div class="card-header">
        <div class="header-label">
          <v-icon icon="mdi-soccer" size="16" class="header-icon" aria-hidden="true"></v-icon>
          <span class="header-title">Soccer</span>
          <span class="header-subtitle">Latest results</span>
        </div>
        <div class="filter-section" role="tablist" aria-label="Competition filter">
          <button
            class="filter-pill"
            :class="{ active: activeTab === 'pl' }"
            @click="switchTab('pl')"
            role="tab"
            :aria-selected="activeTab === 'pl'"
          >
            <span>PL</span>
          </button>
          <button
            class="filter-pill"
            :class="{ active: activeTab === 'cl' }"
            @click="switchTab('cl')"
            role="tab"
            :aria-selected="activeTab === 'cl'"
          >
            <span>UCL</span>
          </button>
          <button
            class="filter-pill"
            :class="{ active: activeTab === 'la' }"
            @click="switchTab('la')"
            role="tab"
            :aria-selected="activeTab === 'la'"
          >
            <span>LaLiga</span>
          </button>
        </div>
      </div>

      <!-- Loading State -->
      <div v-if="loading && hasNoData" class="loading-state">
        <div class="skeleton-matches">
          <div class="skeleton-match" v-for="n in 4" :key="n">
            <div class="sk-team">
              <div class="sk-crest"></div>
              <div class="sk-line short"></div>
            </div>
            <div class="sk-score">
              <div class="sk-line"></div>
              <div class="sk-line shorter"></div>
            </div>
            <div class="sk-team">
              <div class="sk-line short"></div>
              <div class="sk-crest"></div>
            </div>
          </div>
        </div>
      </div>

      <!-- Error State -->
      <div v-else-if="soccerStore.activeError(activeTab)" class="error-state">
        <v-icon icon="mdi-soccer" size="48" class="error-icon"></v-icon>
        <p class="error-message">{{ soccerStore.activeError(activeTab) }}</p>
        <button class="retry-btn" @click="retryActiveTab">
          <v-icon icon="mdi-refresh" size="small"></v-icon>
          Retry
        </button>
      </div>

      <!-- Content -->
      <template v-else>
        <div class="matches-content">
          <template v-if="activeTab === 'pl'">
            <div v-if="matches.length === 0" class="empty-state">
              <v-icon icon="mdi-calendar-blank" size="large" aria-hidden="true"></v-icon>
              <p>No matches available</p>
            </div>
            <div v-else class="matches-list">
              <MatchCard v-for="match in matches" :key="match.id" :match="match" @select="openMatchDetail" />
            </div>
          </template>

          <template v-if="activeTab === 'cl'">
            <div v-if="CLmatches.length === 0" class="empty-state">
              <v-icon icon="mdi-calendar-blank" size="large" aria-hidden="true"></v-icon>
              <p>No matches available</p>
            </div>
            <div v-else class="matches-list">
              <MatchCard v-for="match in CLmatches" :key="match.id" :match="match" @select="openMatchDetail" />
            </div>
          </template>

          <template v-if="activeTab === 'la'">
            <div v-if="LAmatches.length === 0" class="empty-state">
              <v-icon icon="mdi-calendar-blank" size="large" aria-hidden="true"></v-icon>
              <p>No matches available</p>
            </div>
            <div v-else class="matches-list">
              <MatchCard v-for="match in LAmatches" :key="match.id" :match="match" @select="openMatchDetail" />
            </div>
          </template>
        </div>
      </template>
    </v-card>

    <!-- Match Detail Modal -->
    <MatchDetailModal
      :match="selectedMatch"
      :competition="currentCompetition"
      @close="closeMatchDetail"
    />
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from "vue";
import { useSoccerStore } from "../stores/soccerStore";
import MatchCard from "./MatchCard.vue";
import MatchDetailModal from "./MatchDetailModal.vue";
import type { Match } from "../types";

const soccerStore = useSoccerStore();
const activeTab = ref("pl");

const selectedMatch = ref<Match | null>(null);
const showModal = ref(false);

const currentCompetition = computed(() => {
  if (activeTab.value === "pl") return soccerStore.getSoccerResults.competition;
  if (activeTab.value === "cl") return soccerStore.getCLResults.competition;
  if (activeTab.value === "la") return soccerStore.getLAResults.competition;
  return null;
});

const openMatchDetail = (match: Match) => {
  selectedMatch.value = match;
  showModal.value = true;
};

const closeMatchDetail = () => {
  showModal.value = false;
  setTimeout(() => {
    selectedMatch.value = null;
  }, 300);
};

const loading = computed(() => soccerStore.isLoading);

const hasNoData = computed(() => {
  return (
    matches.value.length === 0 &&
    CLmatches.value.length === 0 &&
    LAmatches.value.length === 0
  );
});

const matches = computed(() => {
  const x = soccerStore.getSoccerResults.matches;
  if (!x || !Array.isArray(x) || x.length === 0) return [];
  return [...x].reverse().slice(0, 20);
});

const CLmatches = computed(() => {
  const x = soccerStore.getCLResults.matches;
  if (!x || !Array.isArray(x) || x.length === 0) return [];
  return x.slice(0, 20);
});

const LAmatches = computed(() => {
  const x = soccerStore.getLAResults.matches;
  if (!x || !Array.isArray(x) || x.length === 0) return [];
  return x.slice(0, 20);
});

const switchTab = (tab: string) => {
  activeTab.value = tab;
  // Lazy fetch if not already loaded
  if (tab === "pl" && soccerStore.getSoccerResults.matches.length === 0) {
    soccerStore.searchSoccer();
  } else if (tab === "cl" && soccerStore.getCLResults.matches.length === 0) {
    soccerStore.searchCLMatches();
  } else if (tab === "la" && soccerStore.getLAResults.matches.length === 0) {
    soccerStore.searchLAMatches();
  }
};

const retryActiveTab = () => {
  soccerStore.clearError(activeTab.value as "pl" | "cl" | "la");
  if (activeTab.value === "pl") soccerStore.searchSoccer();
  else if (activeTab.value === "cl") soccerStore.searchCLMatches();
  else if (activeTab.value === "la") soccerStore.searchLAMatches();
};
</script>

<style scoped>
.soccer-container {
  width: 100%;
  height: 100%;
}

.soccer-card {
  background: linear-gradient(
    135deg,
    rgba(17, 29, 59, 0.5),
    rgba(15, 23, 42, 0.5)
  );
  border: none;
  border-radius: 0;
  overflow: hidden;
  backdrop-filter: blur(10px);
  box-shadow: none;
  height: 100%;
  display: flex;
  flex-direction: column;
}

/* Header */
.card-header {
  padding: 0.55rem 0.9rem;
  background: linear-gradient(
    135deg,
    rgba(8, 145, 178, 0.08),
    rgba(107, 33, 168, 0.04)
  );
  border-bottom: 1px solid rgba(8, 145, 178, 0.1);
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.75rem;
  flex-shrink: 0;
}

.header-label {
  display: flex;
  align-items: center;
  gap: 0.4rem;
  min-width: 0;
  flex-shrink: 0;
}

.header-icon {
  opacity: 0.7;
  flex-shrink: 0;
}

.header-title {
  font-size: 0.85rem;
  font-weight: 700;
  color: white;
  margin: 0;
  letter-spacing: 0.1px;
  white-space: nowrap;
}

.header-subtitle {
  font-size: 0.7rem;
  color: rgba(255, 255, 255, 0.5);
  margin: 0;
  font-weight: 400;
  white-space: nowrap;
}

/* Filter pills */
.filter-section {
  display: flex;
  gap: 0.35rem;
}

.filter-pill {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0.3rem 0.7rem;
  border: 1px solid rgba(8, 145, 178, 0.2);
  background: rgba(8, 145, 178, 0.05);
  color: rgba(255, 255, 255, 0.6);
  border-radius: 20px;
  font-size: 0.7rem;
  font-weight: 600;
  letter-spacing: 0.2px;
  cursor: pointer;
  transition: all 0.25s ease;
  font-family: inherit;
  white-space: nowrap;
}

.filter-pill:hover {
  border-color: rgba(8, 145, 178, 0.4);
  background: rgba(8, 145, 178, 0.1);
  color: rgba(255, 255, 255, 0.85);
}

.filter-pill:active {
  transform: scale(0.95);
}

.filter-pill.active {
  background: linear-gradient(
    135deg,
    rgba(8, 145, 178, 0.25),
    rgba(107, 33, 168, 0.15)
  );
  border-color: #0891b2;
  color: white;
  box-shadow: 0 0 8px rgba(8, 145, 178, 0.2);
}

/* Content */
.matches-content {
  flex: 1;
  min-height: 0;
  overflow-y: auto;
  overflow-x: hidden;
  padding: 1rem;
  scrollbar-width: thin;
  scrollbar-color: rgba(8, 145, 178, 0.2) transparent;
}

.matches-content::-webkit-scrollbar {
  width: 4px;
}
.matches-content::-webkit-scrollbar-track {
  background: transparent;
}
.matches-content::-webkit-scrollbar-thumb {
  background: rgba(8, 145, 178, 0.2);
  border-radius: 4px;
}
.matches-content::-webkit-scrollbar-thumb:hover {
  background: rgba(8, 145, 178, 0.35);
}

.matches-list {
  display: flex;
  flex-direction: column;
  gap: 0.7rem;
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 1rem;
  padding: 3rem 1.5rem;
  color: rgba(255, 255, 255, 0.5);
  text-align: center;
}

.empty-state :deep(.v-icon) {
  opacity: 0.4;
}

.empty-state p {
  margin: 0;
  font-size: 0.95rem;
}

/* Loading skeleton */
.loading-state {
  display: flex;
  justify-content: center;
  align-items: center;
  flex: 1;
  min-height: 0;
  padding: 2rem;
}

.skeleton-matches {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  width: 100%;
  max-width: 400px;
}

.skeleton-match {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.75rem;
  padding: 0.85rem;
  background: rgba(255, 255, 255, 0.04);
  border-radius: 12px;
}

.sk-team {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  flex: 1;
}

.sk-crest {
  width: 28px;
  height: 28px;
  border-radius: 50%;
  background: linear-gradient(
    90deg,
    rgba(255, 255, 255, 0.06) 25%,
    rgba(255, 255, 255, 0.15) 50%,
    rgba(255, 255, 255, 0.06) 75%
  );
  background-size: 200% 100%;
  animation: shimmer 1.5s infinite;
}

.sk-score {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.4rem;
  min-width: 60px;
}

.sk-line {
  height: 12px;
  border-radius: 6px;
  background: linear-gradient(
    90deg,
    rgba(255, 255, 255, 0.06) 25%,
    rgba(255, 255, 255, 0.15) 50%,
    rgba(255, 255, 255, 0.06) 75%
  );
  background-size: 200% 100%;
  animation: shimmer 1.5s infinite;
}

.sk-line.short {
  width: 50px;
}

.sk-line.shorter {
  width: 35px;
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
  flex: 1;
  min-height: 0;
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

/* Responsive */
@media (max-width: 768px) {
  .matches-content {
    padding: 0.85rem;
  }
  .matches-list {
    gap: 0.6rem;
  }
}

@media (max-width: 640px) {
  .matches-content {
    padding: 0.75rem;
  }
  .matches-list {
    gap: 0.55rem;
  }
}

@media (max-width: 480px) {
  .matches-content {
    padding: 0.6rem;
  }
  .matches-list {
    gap: 0.5rem;
  }
}
</style>
