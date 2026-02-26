<template>
  <div class="soccer-container">
    <v-card class="soccer-card" elevation="0">
      <!-- Header + Filter combined in one compact line -->
      <div class="card-header">
        <div class="header-label">
          <v-icon icon="mdi-soccer" size="14" class="header-icon"></v-icon>
          <span class="header-title">Soccer</span>
          <span class="header-subtitle">Live & upcoming</span>
        </div>
        <div class="filter-section">
          <button 
            class="filter-pill" 
            :class="{ active: activeTab === 'pl' }"
            @click="activeTab = 'pl'"
          >
            <span>PL</span>
          </button>
          <button 
            class="filter-pill" 
            :class="{ active: activeTab === 'cl' }"
            @click="activeTab = 'cl'"
          >
            <span>UCL</span>
          </button>
          <button 
            class="filter-pill" 
            :class="{ active: activeTab === 'la' }"
            @click="activeTab = 'la'"
          >
            <span>LaLiga</span>
          </button>
        </div>
      </div>

      <!-- Loading State -->
      <div v-if="loading == true" class="loading-state">
        <v-progress-circular indeterminate color="primary" size="48"></v-progress-circular>
      </div>

      <!-- Error State -->
      <div v-else-if="soccerStore.error" class="error-state">
        <v-icon icon="mdi-soccer" size="48" class="error-icon"></v-icon>
        <p class="error-message">{{ soccerStore.error }}</p>
        <button class="retry-btn" @click="retryActiveTab">
          <v-icon icon="mdi-refresh" size="small"></v-icon>
          Retry
        </button>
      </div>

      <!-- Content -->
      <template v-else>
        <div class="matches-content">
          <!-- Premier League Section -->
          <template v-if="activeTab === 'pl'">
            <div v-if="matches.length === 0" class="empty-state">
              <v-icon icon="mdi-calendar-blank" size="large"></v-icon>
              <p>No matches available</p>
            </div>
            <div v-else class="matches-list">
              <MatchCard v-for="match in matches" :key="match.id" :match="match" />
            </div>
          </template>

          <!-- Champions League Section -->
          <template v-if="activeTab === 'cl'">
            <div v-if="CLmatches.length === 0" class="empty-state">
              <v-icon icon="mdi-calendar-blank" size="large"></v-icon>
              <p>No matches available</p>
            </div>
            <div v-else class="matches-list">
              <MatchCard v-for="match in CLmatches" :key="match.id" :match="match" />
            </div>
          </template>

          <!-- La Liga Section -->
          <template v-if="activeTab === 'la'">
            <div v-if="LAmatches.length === 0" class="empty-state">
              <v-icon icon="mdi-calendar-blank" size="large"></v-icon>
              <p>No matches available</p>
            </div>
            <div v-else class="matches-list">
              <MatchCard v-for="match in LAmatches" :key="match.id" :match="match" />
            </div>
          </template>
        </div>
      </template>
    </v-card>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from "vue";
import { useSoccerStore } from "../stores/soccerStore";
import MatchCard from "./MatchCard.vue";

const soccerStore = useSoccerStore();
const activeTab = ref("pl");

const loading = computed(() => {
  return soccerStore.loading;
});

const matches = computed(() => {
  const x = soccerStore.getSoccerResults.matches;
  if (!x || !Array.isArray(x) || x.length === 0) return [];
  const reversed = [...x].reverse();
  return reversed.slice(0, 20);
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

const retryActiveTab = () => {
  soccerStore.error = null;
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
  background: linear-gradient(135deg, rgba(17, 29, 59, 0.5), rgba(15, 23, 42, 0.5));
  border: none;
  border-radius: 0;
  overflow: hidden;
  backdrop-filter: blur(10px);
  box-shadow: none;
  height: 100%;
  display: flex;
  flex-direction: column;
}

/* Header — single compact row */
.card-header {
  padding: 0.5rem 0.9rem;
  background: linear-gradient(135deg, rgba(8, 145, 178, 0.08), rgba(107, 33, 168, 0.04));
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
  gap: 0.35rem;
  min-width: 0;
  flex-shrink: 0;
}

.header-icon {
  opacity: 0.7;
  flex-shrink: 0;
}

.header-title {
  font-size: 0.8rem;
  font-weight: 700;
  color: white;
  margin: 0;
  letter-spacing: 0.1px;
  white-space: nowrap;
}

.header-subtitle {
  font-size: 0.68rem;
  color: rgba(255, 255, 255, 0.45);
  margin: 0;
  font-weight: 400;
  white-space: nowrap;
}

/* Filter pills inline */
.filter-section {
  display: flex;
  gap: 0.35rem;
}

.filter-pill {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0.25rem 0.65rem;
  border: 1px solid rgba(8, 145, 178, 0.2);
  background: rgba(8, 145, 178, 0.05);
  color: rgba(255, 255, 255, 0.6);
  border-radius: 20px;
  font-size: 0.68rem;
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

.filter-pill.active {
  background: linear-gradient(135deg, rgba(8, 145, 178, 0.25), rgba(107, 33, 168, 0.15));
  border-color: #0891B2;
  color: white;
  box-shadow: 0 0 8px rgba(8, 145, 178, 0.2);
}

/* Content Area */
.matches-content {
  flex: 1;
  min-height: 0;
  overflow-y: auto;
  overflow-x: hidden;
  padding: 1.25rem;
  scrollbar-width: thin;
  scrollbar-color: rgba(8, 145, 178, 0.2) transparent;
}

.matches-content::-webkit-scrollbar { width: 4px; }
.matches-content::-webkit-scrollbar-track { background: transparent; }
.matches-content::-webkit-scrollbar-thumb { background: rgba(8, 145, 178, 0.2); border-radius: 4px; }
.matches-content::-webkit-scrollbar-thumb:hover { background: rgba(8, 145, 178, 0.35); }

.matches-list {
  display: flex;
  flex-direction: column;
  gap: 0.9rem;
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

.loading-state {
  display: flex;
  justify-content: center;
  align-items: center;
  flex: 1;
  min-height: 0;
  padding: 2rem;
}

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

/* Responsive Adjustments */
@media (max-width: 768px) {
  .matches-content {
    padding: 1rem;
  }

  .matches-list {
    gap: 0.7rem;
  }
}

@media (max-width: 640px) {
  .matches-content {
    padding: 0.75rem;
  }

  .matches-list {
    gap: 0.6rem;
  }

  .empty-state {
    padding: 2rem 1rem;
  }

  .empty-state p {
    font-size: 0.85rem;
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

