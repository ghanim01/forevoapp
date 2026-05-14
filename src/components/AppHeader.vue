<template>
  <header class="app-header">
    <div class="header-top">
      <span class="wordmark">Forevo</span>

      <div class="search-container">
        <div class="search-wrapper">
          <v-icon icon="mdi-magnify" class="search-icon"></v-icon>
          <input
            v-model="model"
            type="text"
            placeholder="Search city..."
            class="search-input"
            :disabled="isSearching"
            @input="onSearchInput"
            @focus="showSuggestions = true"
            @blur="handleBlur"
          />
          <v-progress-circular
            v-if="isSearching"
            indeterminate
            :size="16"
            :width="2"
            color="rgba(34, 211, 238, 0.6)"
            class="search-loader"
          ></v-progress-circular>
          <v-icon
            v-else-if="model"
            icon="mdi-close"
            class="search-clear"
            @click="clearSearch"
            @mousedown.prevent
          ></v-icon>
        </div>

        <div
          v-if="showSuggestions && filteredCities.length > 0"
          class="suggestions-popup"
          role="listbox"
          aria-label="City suggestions"
        >
          <div
            v-for="(city, index) in filteredCities.slice(0, 6)"
            :key="`${city.name}-${city.lat}-${city.lng}`"
            class="suggestion-item"
            :class="{ 'suggestion-highlighted': index === highlightedIndex }"
            role="option"
            :aria-selected="index === highlightedIndex"
            @mousedown.prevent="selectCity(city)"
            @mouseenter="highlightedIndex = index"
          >
            <v-icon
              icon="mdi-map-marker-outline"
              size="small"
              class="suggestion-icon"
            ></v-icon>
            <span class="suggestion-name">{{ city.name }}</span>
            <span class="suggestion-country">{{ city.country }}</span>
          </div>
        </div>
      </div>

      <div class="location-chips" role="navigation" aria-label="Quick city select">
        <button
          v-for="city in quickCities"
          :key="city.name"
          class="location-chip"
          :class="{ 'chip-loading': isSearching && selectedChip === city.name }"
          :disabled="isSearching"
          @click="selectQuickCity(city)"
        >
          <span v-if="isSearching && selectedChip === city.name" class="chip-spinner"></span>
          {{ city.name }}
        </button>
      </div>
    </div>
  </header>
</template>

<script setup lang="ts">
import { onMounted, ref, computed, watch } from "vue";
import { useWeatherStore } from "../stores/weatherStore";
import { useSoccerStore } from "../stores/soccerStore";
import { searchCities } from "../utils/cities";
import type { CityData } from "../types";

const weatherStore = useWeatherStore();
const soccerStore = useSoccerStore();

const model = ref<string>("");
const showSuggestions = ref(false);
const hasSearched = ref(false);
const searchResults = ref<CityData[]>([]);
const selectedChip = ref<string | null>(null);
const highlightedIndex = ref(-1);
let searchDebounceTimer: ReturnType<typeof setTimeout> | null = null;
let blurTimer: ReturnType<typeof setTimeout> | null = null;

const quickCities: CityData[] = [
  { name: "Chicago", country: "US", lat: 41.85, lng: -87.65 },
  { name: "New York", country: "US", lat: 40.71, lng: -74.01 },
  { name: "London", country: "GB", lat: 51.51, lng: -0.13 },
  { name: "Tokyo", country: "JP", lat: 35.68, lng: 139.69 },
];

const filteredCities = computed(() => searchResults.value);

const isSearching = computed(() => {
  return weatherStore.isLoading;
});

// Watch for when search completes
watch(
  () => weatherStore.isLoading,
  (newVal) => {
    if (!newVal) {
      selectedChip.value = null;
      if (hasSearched.value) {
        hasSearched.value = false;
      }
    }
  }
);

const selectCity = (city: CityData) => {
  model.value = city.name;
  showSuggestions.value = false;
  highlightedIndex.value = -1;
  weatherStore.searchCityByObject(city);
  hasSearched.value = true;
};

const selectQuickCity = (city: CityData) => {
  model.value = city.name;
  selectedChip.value = city.name;
  weatherStore.searchCityByObject(city);
  hasSearched.value = true;
};

const clearSearch = () => {
  model.value = "";
  searchResults.value = [];
  highlightedIndex.value = -1;
};

const handleBlur = () => {
  // Delay hiding so click on suggestion registers first
  blurTimer = setTimeout(() => {
    showSuggestions.value = false;
    highlightedIndex.value = -1;
  }, 150);
};

const onSearchInput = () => {
  showSuggestions.value = true;
  highlightedIndex.value = -1;

  // Cancel pending blur
  if (blurTimer) clearTimeout(blurTimer);

  // Debounce search to avoid hammering the cities dataset on every keystroke
  if (searchDebounceTimer) {
    clearTimeout(searchDebounceTimer);
  }
  searchDebounceTimer = setTimeout(async () => {
    if (!model.value || model.value.length < 2) {
      searchResults.value = [];
      return;
    }
    searchResults.value = await searchCities(model.value, 6);
  }, 150);
};

onMounted(() => {
  // Set initial city but don't clear it - user should see what's selected
  model.value = "Chicago";
  weatherStore.searchCityName(model.value);
  soccerStore.searchSoccer();
  // Defer CL and La Liga loads to prioritize initial render
  setTimeout(() => {
    soccerStore.searchCLMatches();
    soccerStore.searchLAMatches();
  }, 2000);
});
</script>

<style scoped>
@import url("https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@700;800&display=swap");

.app-header {
  display: flex;
  flex-direction: column;
  flex-shrink: 0;
  background: rgba(7, 9, 26, 0.95);
  box-shadow: inset 0 -1px 0 rgba(8, 145, 178, 0.12);
  backdrop-filter: blur(20px);
  position: relative;
  z-index: 100;
}

.header-top {
  display: flex;
  align-items: center;
  padding: 0 1.25rem;
  gap: 1rem;
  height: 48px;
  position: relative;
}

.wordmark {
  display: flex;
  align-items: center;
  font-size: 1.35rem;
  font-weight: 800;
  letter-spacing: -0.5px;
  color: #e0f7fa;
  font-family: "Space Grotesk", "DM Sans", "Inter", system-ui, sans-serif;
  flex-shrink: 0;
  user-select: none;
  white-space: nowrap;
}

.search-container {
  position: absolute;
  left: 50%;
  transform: translateX(-50%);
  width: 460px;
  z-index: 1;
}

.search-wrapper {
  display: flex;
  align-items: center;
  width: 100%;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(8, 145, 178, 0.18);
  border-radius: 10px;
  padding: 0.35rem 0.75rem;
  transition: border-color 0.2s, box-shadow 0.2s, background 0.2s;
}

.search-wrapper:focus-within {
  background: rgba(255, 255, 255, 0.08);
  border-color: rgba(34, 211, 238, 0.4);
  box-shadow: 0 0 0 3px rgba(34, 211, 238, 0.07);
}

.search-icon {
  color: rgba(255, 255, 255, 0.35);
  font-size: 1rem;
  margin-right: 0.45rem;
  flex-shrink: 0;
}

.search-input {
  flex: 1;
  border: none;
  background: transparent;
  color: white;
  font-size: 0.875rem;
  outline: none;
  padding: 0;
  transition: opacity 0.2s;
}

.search-input::placeholder {
  color: rgba(255, 255, 255, 0.4);
}

.search-input:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.search-clear {
  color: rgba(255, 255, 255, 0.4);
  cursor: pointer;
  transition: color 0.15s, transform 0.15s;
  font-size: 1rem;
  margin-left: 0.4rem;
}

.search-clear:hover {
  color: rgba(255, 255, 255, 0.8);
  transform: scale(1.15);
}

.search-loader {
  margin-left: 0.4rem;
  flex-shrink: 0;
}

.suggestions-popup {
  position: absolute;
  top: calc(100% + 6px);
  left: 0;
  width: 100%;
  background: rgba(10, 14, 35, 0.98);
  border: 1px solid rgba(8, 145, 178, 0.2);
  border-radius: 12px;
  box-shadow: 0 12px 32px rgba(0, 0, 0, 0.5);
  z-index: 200;
  overflow: hidden;
  backdrop-filter: blur(16px);
}

.suggestion-item {
  display: flex;
  align-items: center;
  gap: 0.6rem;
  padding: 0.6rem 0.85rem;
  cursor: pointer;
  transition: background 0.15s;
  border-bottom: 1px solid rgba(255, 255, 255, 0.04);
}

.suggestion-item:last-child {
  border-bottom: none;
}

.suggestion-item:hover,
.suggestion-highlighted {
  background: rgba(34, 211, 238, 0.08);
}

.suggestion-icon {
  color: rgba(34, 211, 238, 0.4);
  flex-shrink: 0;
  font-size: 0.9rem;
}

.suggestion-name {
  font-size: 0.875rem;
  color: rgba(255, 255, 255, 0.82);
  flex: 1;
}

.suggestion-country {
  font-size: 0.7rem;
  color: rgba(255, 255, 255, 0.4);
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.location-chips {
  display: flex;
  align-items: center;
  gap: 0.4rem;
  flex-shrink: 0;
  overflow-x: auto;
  scrollbar-width: none;
  margin-left: auto;
  padding-right: 6rem;
}

.location-chips::-webkit-scrollbar {
  display: none;
}

.location-chip {
  display: flex;
  align-items: center;
  gap: 0.35rem;
  padding: 0.22rem 0.7rem;
  background: rgba(8, 145, 178, 0.07);
  border: 1px solid rgba(8, 145, 178, 0.16);
  border-radius: 20px;
  color: rgba(255, 255, 255, 0.5);
  font-size: 0.72rem;
  font-weight: 500;
  cursor: pointer;
  transition: background 0.2s, border-color 0.2s, color 0.2s, transform 0.15s;
  white-space: nowrap;
  font-family: inherit;
  letter-spacing: 0.2px;
  flex-shrink: 0;
}

.location-chip:hover {
  background: rgba(8, 145, 178, 0.16);
  border-color: rgba(34, 211, 238, 0.35);
  color: #22d3ee;
}

.location-chip:active {
  transform: scale(0.95);
}

.location-chip:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  transform: none;
}

.chip-loading {
  opacity: 0.7;
}

.chip-spinner {
  width: 10px;
  height: 10px;
  border: 2px solid rgba(34, 211, 238, 0.3);
  border-top-color: #22d3ee;
  border-radius: 50%;
  animation: chipSpin 0.6s linear infinite;
}

@keyframes chipSpin {
  to {
    transform: rotate(360deg);
  }
}

@media (max-width: 767px) {
  .header-top {
    flex-direction: row;
    align-items: center;
    gap: 0.75rem;
    padding: 0.6rem 0.75rem;
    height: auto;
    min-height: 48px;
  }

  .wordmark {
    font-size: 1.1rem;
    flex: 0 0 auto;
  }

  .location-chips {
    display: none;
  }

  .search-container {
    position: relative;
    left: 0;
    transform: none;
    width: 100%;
    flex: 1;
  }

  .search-wrapper {
    padding: 0.3rem 0.6rem;
  }

  .search-input {
    font-size: 0.82rem;
  }
}
</style>
