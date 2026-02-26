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
            @blur="showSuggestions = false"
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
          ></v-icon>
        </div>

        <div v-if="showSuggestions && filteredCities.length > 0" class="suggestions-popup">
          <div
            v-for="city in filteredCities.slice(0, 6)"
            :key="`${city.name}-${city.lat}-${city.lng}`"
            class="suggestion-item"
            @mousedown.prevent="selectCity(city)"
          >
            <v-icon icon="mdi-map-marker-outline" size="small" class="suggestion-icon"></v-icon>
            <span class="suggestion-name">{{ city.name }}</span>
            <span class="suggestion-country">{{ city.country }}</span>
          </div>
        </div>
      </div>

      <div class="location-chips">
        <button
          v-for="city in quickCities"
          :key="city.name"
          class="location-chip"
          @click="selectQuickCity(city)"
        >
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
import cities from "cities.json";

const weatherStore = useWeatherStore();
const soccerStore = useSoccerStore();

const model = ref<string>("");
const showSuggestions = ref(false);
const hasSearched = ref(false);

const quickCities = [
  { name: "Chicago", lat: 41.85, lng: -87.65 },
  { name: "New York", lat: 40.71, lng: -74.01 },
  { name: "London", lat: 51.51, lng: -0.13 },
  { name: "Tokyo", lat: 35.68, lng: 139.69 },
];

const filteredCities = computed(() => {
  if (!model.value || model.value.length < 2) return [];
  const searchTerm = model.value.toLowerCase();
  return (cities as any[]).filter((city) =>
    city.name.toLowerCase().includes(searchTerm)
  );
});

const isSearching = computed(() => {
  return weatherStore.isLoading;
});

// Watch for when search completes and clear the search box
watch(
  () => weatherStore.isLoading,
  (newVal) => {
    if (!newVal && hasSearched.value) {
      // Search has completed, clear the search box
      setTimeout(() => {
        model.value = "";
        hasSearched.value = false;
      }, 200);
    }
  }
);

const selectCity = (city: any) => {
  model.value = city.name;
  showSuggestions.value = false;
  weatherStore.searchCityByObject(city);
  hasSearched.value = true;
};

const selectQuickCity = (city: any) => {
  model.value = city.name;
  weatherStore.searchCityByObject(city);
  hasSearched.value = true;
};

const clearSearch = () => {
  model.value = "";
};

const onSearchInput = () => {
  showSuggestions.value = true;
};

onMounted(() => {
  model.value = "Chicago";
  weatherStore.searchCityName(model.value);
  soccerStore.searchSoccer();
  soccerStore.searchCLMatches();
  soccerStore.searchLAMatches();
});
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@700;800&display=swap');

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
  height: 44px;
  position: relative;
}

.wordmark {
  display: flex;
  align-items: center;
  font-size: 1.25rem;
  font-weight: 800;
  letter-spacing: -0.5px;
  color: #e0f7fa;
  font-family: 'Space Grotesk', 'DM Sans', 'Inter', system-ui, sans-serif;
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
  padding: 0.28rem 0.75rem;
  transition: border-color 0.2s, box-shadow 0.2s, background 0.2s;
}

.search-wrapper:focus-within {
  background: rgba(255, 255, 255, 0.08);
  border-color: rgba(34, 211, 238, 0.4);
  box-shadow: 0 0 0 3px rgba(34, 211, 238, 0.07);
}

.search-icon {
  color: rgba(255, 255, 255, 0.3);
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

.search-input:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.search-input::placeholder {
  color: rgba(255, 255, 255, 0.28);
}

.search-clear {
  color: rgba(255, 255, 255, 0.35);
  cursor: pointer;
  transition: color 0.15s;
  font-size: 1rem;
  margin-left: 0.4rem;
}

.search-clear:hover {
  color: rgba(255, 255, 255, 0.75);
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
  border-radius: 10px;
  box-shadow: 0 12px 32px rgba(0, 0, 0, 0.5);
  z-index: 200;
  overflow: hidden;
  backdrop-filter: blur(16px);
}

.suggestion-item {
  display: flex;
  align-items: center;
  gap: 0.6rem;
  padding: 0.55rem 0.85rem;
  cursor: pointer;
  transition: background 0.15s;
  border-bottom: 1px solid rgba(255, 255, 255, 0.04);
}

.suggestion-item:last-child { border-bottom: none; }

.suggestion-item:hover {
  background: rgba(34, 211, 238, 0.05);
}

.suggestion-icon {
  color: rgba(34, 211, 238, 0.4);
  flex-shrink: 0;
}

.suggestion-name {
  font-size: 0.85rem;
  color: rgba(255, 255, 255, 0.82);
  flex: 1;
}

.suggestion-country {
  font-size: 0.7rem;
  color: rgba(255, 255, 255, 0.28);
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

.location-chips::-webkit-scrollbar { display: none; }

.location-chip {
  padding: 0.18rem 0.6rem;
  background: rgba(8, 145, 178, 0.07);
  border: 1px solid rgba(8, 145, 178, 0.16);
  border-radius: 20px;
  color: rgba(255, 255, 255, 0.48);
  font-size: 0.7rem;
  font-weight: 500;
  cursor: pointer;
  transition: background 0.2s, border-color 0.2s, color 0.2s;
  white-space: nowrap;
  font-family: inherit;
  letter-spacing: 0.2px;
  flex-shrink: 0;
}

.location-chip:hover {
  background: rgba(8, 145, 178, 0.16);
  border-color: rgba(34, 211, 238, 0.35);
  color: #22D3EE;
}

@media (max-width: 767px) {
  .header-top {
    flex-direction: row;
    align-items: center;
    gap: 0.75rem;
    padding: 0.6rem 0.75rem;
    height: auto;
  }

  .wordmark {
    font-size: 1.1rem;
    flex: 0 0 20%;
  }

  .location-chips {
    display: none;
  }

  .search-container {
    position: relative;
    left: 0;
    transform: none;
    width: 100%;
    flex: 1 1 80%;
  }

  .search-wrapper {
    padding: 0.24rem 0.6rem;
  }

  .search-input {
    font-size: 0.82rem;
  }
}
</style>