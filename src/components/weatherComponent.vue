<template>
  <div class="weather-container">
    <v-card
      class="weather-card"
      theme="dark"
      :style="gradientBackground"
      elevation="8"
    >
      <div v-if="weatherStore.isLoading" class="loading-state">
        <div class="skeleton-loader">
          <div class="skeleton-circle"></div>
          <div class="skeleton-text">
            <div class="skeleton-line"></div>
            <div class="skeleton-line short"></div>
          </div>
        </div>
      </div>
      <div v-else-if="weatherStore.error" class="error-state">
        <v-icon icon="mdi-weather-cloudy-alert" size="48" class="error-icon"></v-icon>
        <p class="error-message">{{ weatherStore.error }}</p>
        <button class="retry-btn" @click="weatherStore.searchWeather()">
          <v-icon icon="mdi-refresh" size="small"></v-icon>
          Retry
        </button>
      </div>
      <template v-else>
        <!-- Zone 1: Header + tab switcher (hidden on mobile) -->
        <div class="weather-header">
          <div class="header-left">
            <h2 class="city-name">{{ searchRes.city }}</h2>
            <p class="date-text">{{ searchRes.date }}</p>
          </div>
          <div class="tab-switcher" v-if="!isMobile">
            <button class="tab-btn" :class="{ active: activeTab === 'now' }" @click="activeTab = 'now'">Now</button>
            <button class="tab-btn" :class="{ active: activeTab === 'details' }" @click="activeTab = 'details'">Details</button>
          </div>
        </div>

        <!-- Mobile: show everything in one stack -->
        <template v-if="isMobile">
          <div class="mobile-stack">
            <!-- Hero Section: Icon + Temperature -->
            <div class="mobile-hero">
              <div class="weather-icon-container">
                <span class="weather-emoji">{{ weatherEmoji }}</span>
                <img
                  :src="icon"
                  :alt="searchRes.description"
                  class="weather-icon"
                  loading="lazy"
                  @load="iconLoaded = true"
                  :style="{ opacity: iconLoaded ? 1 : 0 }"
                />
              </div>
              <h1 class="temperature">{{ Math.floor(searchRes.temp) }}°</h1>
              <p class="description">{{ searchRes.description }}</p>
            </div>

            <!-- Temperature Range Card -->
            <div class="mobile-temp-range">
              <div class="temp-range-item">
                <v-icon icon="mdi-arrow-up" class="range-icon"></v-icon>
                <span class="range-value">{{ Math.floor(Number(searchRes.temp_max)) }}°</span>
                <span class="range-label">High</span>
              </div>
              <div class="temp-divider"></div>
              <div class="temp-range-item">
                <v-icon icon="mdi-arrow-down" class="range-icon"></v-icon>
                <span class="range-value">{{ Math.floor(Number(searchRes.temp_min)) }}°</span>
                <span class="range-label">Low</span>
              </div>
            </div>

            <!-- Quick Stats: 3 columns -->
            <div class="mobile-quick-stats">
              <div class="quick-stat">
                <v-icon icon="mdi-thermometer" class="quick-icon"></v-icon>
                <span class="quick-value">{{ Math.floor(Number(searchRes.feels_like)) }}°</span>
                <span class="quick-label">Feels</span>
              </div>
              <div class="quick-stat">
                <v-icon icon="mdi-water-percent" class="quick-icon"></v-icon>
                <span class="quick-value">{{ Math.floor(Number(searchRes.humidity)) }}%</span>
                <span class="quick-label">Humidity</span>
              </div>
              <div class="quick-stat">
                <v-icon icon="mdi-weather-windy" class="quick-icon"></v-icon>
                <span class="quick-value">{{ Number(searchRes.windSpeed || 0).toFixed(1) }}</span>
                <span class="quick-label">Wind m/s</span>
              </div>
            </div>

            <!-- Additional Details: 2 columns -->
            <div class="mobile-details-grid">
              <div class="mobile-detail-card">
                <div class="detail-card-header">
                  <v-icon icon="mdi-white-balance-sunny" class="detail-card-icon"></v-icon>
                  <span class="detail-card-title">Sun Times</span>
                </div>
                <div class="detail-card-content">
                  <div class="sun-time">
                    <span class="sun-label">Sunrise</span>
                    <span class="sun-value">{{ searchRes.sunrise }}</span>
                  </div>
                  <div class="sun-time">
                    <span class="sun-label">Sunset</span>
                    <span class="sun-value">{{ searchRes.sunset }}</span>
                  </div>
                </div>
              </div>
              
              <div class="mobile-detail-card">
                <div class="detail-card-header">
                  <v-icon icon="mdi-weather-cloudy" class="detail-card-icon"></v-icon>
                  <span class="detail-card-title">Conditions</span>
                </div>
                <div class="detail-card-content">
                  <div class="condition-item">
                    <span class="condition-label">Clouds</span>
                    <span class="condition-value">{{ Math.floor(Number(searchRes.clouds || 0)) }}%</span>
                  </div>
                  <div class="condition-item">
                    <span class="condition-label">Wind Dir</span>
                    <span class="condition-value">{{ searchRes.windDeg }}°</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </template>

        <!-- Desktop/Tablet: tabbed layout -->
        <template v-else>
          <!-- NOW tab -->
          <template v-if="activeTab === 'now'">
            <div class="weather-body">
              <div class="temperature-section">
                <div class="weather-icon-container">
                  <span class="weather-emoji">{{ weatherEmoji }}</span>
                  <img
                    :src="icon"
                    :alt="searchRes.description"
                    class="weather-icon"
                    loading="lazy"
                    @load="iconLoaded = true"
                    :style="{ opacity: iconLoaded ? 1 : 0 }"
                  />
                </div>
                <div class="temp-display">
                  <h1 class="temperature">{{ Math.floor(searchRes.temp) }}°</h1>
                  <p class="description">{{ searchRes.description }}</p>
                </div>
              </div>

              <div class="stat-pills">
                <div class="stat-pill">
                  <span class="stat-label">Feels Like</span>
                  <span class="stat-value">{{ Math.floor(Number(searchRes.feels_like)) }}°</span>
                </div>
                <div class="stat-pill">
                  <span class="stat-label">Humidity</span>
                  <span class="stat-value">{{ Math.floor(Number(searchRes.humidity)) }}%</span>
                </div>
                <div class="stat-pill">
                  <span class="stat-label">Wind</span>
                  <span class="stat-value">{{ Number(searchRes.windSpeed || 0).toFixed(1) }} m/s</span>
                </div>
                <div class="stat-pill">
                  <span class="stat-label">Clouds</span>
                  <span class="stat-value">{{ Math.floor(Number(searchRes.clouds || 0)) }}%</span>
                </div>
              </div>
            </div>
          </template>

          <!-- DETAILS tab -->
          <template v-else>
            <div class="details-grid">
              <div class="detail-item">
                <v-icon icon="mdi-thermometer-high" class="detail-icon"></v-icon>
                <div class="detail-info">
                  <span class="detail-label">Max</span>
                  <span class="detail-value">{{ Math.floor(Number(searchRes.temp_max)) }}°</span>
                </div>
              </div>
              <div class="detail-item">
                <v-icon icon="mdi-thermometer-low" class="detail-icon"></v-icon>
                <div class="detail-info">
                  <span class="detail-label">Min</span>
                  <span class="detail-value">{{ Math.floor(Number(searchRes.temp_min)) }}°</span>
                </div>
              </div>
              <div class="detail-item">
                <v-icon icon="mdi-weather-windy" class="detail-icon"></v-icon>
                <div class="detail-info">
                  <span class="detail-label">Wind</span>
                  <span class="detail-value">{{ Number(searchRes.windSpeed || 0).toFixed(1) }} m/s</span>
                </div>
              </div>
              <div class="detail-item">
                <v-icon icon="mdi-compass-outline" class="detail-icon"></v-icon>
                <div class="detail-info">
                  <span class="detail-label">Direction</span>
                  <span class="detail-value">{{ searchRes.windDeg }}°</span>
                </div>
              </div>
              <div class="detail-item">
                <v-icon icon="mdi-weather-cloudy" class="detail-icon"></v-icon>
                <div class="detail-info">
                  <span class="detail-label">Clouds</span>
                  <span class="detail-value">{{ Math.floor(Number(searchRes.clouds || 0)) }}%</span>
                </div>
              </div>
              <div class="detail-item">
                <v-icon icon="mdi-tag-outline" class="detail-icon"></v-icon>
                <div class="detail-info">
                  <span class="detail-label">Condition</span>
                  <span class="detail-value">{{ searchRes.condition }}</span>
                </div>
              </div>
              <div class="detail-item">
                <v-icon icon="mdi-sun-clock" class="detail-icon"></v-icon>
                <div class="detail-info">
                  <span class="detail-label">Sunrise</span>
                  <span class="detail-value">{{ searchRes.sunrise }}</span>
                </div>
              </div>
              <div class="detail-item">
                <v-icon icon="mdi-sun-down" class="detail-icon"></v-icon>
                <div class="detail-info">
                  <span class="detail-label">Sunset</span>
                  <span class="detail-value">{{ searchRes.sunset }}</span>
                </div>
              </div>
            </div>
          </template>
        </template>
      </template>
    </v-card>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, onMounted, onUnmounted } from "vue";
import { useWeatherStore } from "../stores/weatherStore";

const weatherStore = useWeatherStore();
const iconLoaded = ref(false);
const activeTab = ref<'now' | 'details'>('now');
const isMobile = ref(false);

const updateIsMobile = () => {
  isMobile.value = window.innerWidth <= 640;
};

const gradientBackground = computed(() => {
  const weatherCode = weatherStore.getSearchInput.xicon;
  const temp = Number(weatherStore.getSearchInput.temp);
  
  // Determine gradient based on temperature first
  if (temp < 0) {
    // Freezing - icy blue (dimmed)
    return {
      background: "linear-gradient(135deg, #0B7B9C 0%, #076B7F 100%)",
    };
  } else if (temp < 10) {
    // Cold - cool blue (dimmed)
    return {
      background: "linear-gradient(135deg, #1E5A8E 0%, #0B7B9C 100%)",
    };
  } else if (temp < 15) {
    // Cool - blue-cyan (dimmed)
    return {
      background: "linear-gradient(135deg, #076B7F 0%, #0F8F7E 100%)",
    };
  } else if (temp >= 25) {
    // Hot - warm yellow to orange (dimmed)
    return {
      background: "linear-gradient(135deg, #A16207 0%, #7C2D12 100%)",
    };
  } else if (temp >= 20) {
    // Warm - orange to yellow (dimmed)
    return {
      background: "linear-gradient(135deg, #92400E 0%, #A16207 100%)",
    };
  }
  
  // For 15-20 range, use weather condition as secondary factor
  if (weatherCode?.includes("01")) {
    // Clear sky - warm golden (dimmed)
    return {
      background: "linear-gradient(135deg, #A16207 0%, #7C2D12 100%)",
    };
  } else if (weatherCode?.includes("02") || weatherCode?.includes("03")) {
    // Partly cloudy - blue gradient (dimmed)
    return {
      background: "linear-gradient(135deg, #1E5A8E 0%, #1A3A5C 100%)",
    };
  } else if (weatherCode?.includes("04")) {
    // Overcast - gray gradient
    return {
      background: "linear-gradient(135deg, #4B5563 0%, #364452 100%)",
    };
  } else if (weatherCode?.includes("09") || weatherCode?.includes("10")) {
    // Rain - cool blue-purple gradient (dimmed)
    return {
      background: "linear-gradient(135deg, #3A4F8F 0%, #1E2847 100%)",
    };
  } else if (weatherCode?.includes("11")) {
    // Thunderstorm - dark purple gradient (dimmed)
    return {
      background: "linear-gradient(135deg, #1E5A8E 0%, #0F172A 100%)",
    };
  } else if (weatherCode?.includes("13")) {
    // Snow - icy blue gradient (dimmed)
    return {
      background: "linear-gradient(135deg, #0B7B9C 0%, #076B7F 100%)",
    };
  } else if (weatherCode?.includes("50")) {
    // Mist/fog - muted gray gradient
    return {
      background: "linear-gradient(135deg, #556573 0%, #3F4A57 100%)",
    };
  }
  
  // Default gradient
  return {
    background: "linear-gradient(135deg, #0891B2 0%, #06857C 100%)",
  };
});

const weatherEmoji = computed(() => {
  const description = weatherStore.getSearchInput.description?.toLowerCase() || "";
  
  if (description.includes("clear") || description.includes("sunny")) return "☀️";
  if (description.includes("cloud")) return "☁️";
  if (description.includes("rain")) return "🌧️";
  if (description.includes("thunder") || description.includes("storm")) return "⛈️";
  if (description.includes("snow")) return "❄️";
  if (description.includes("mist") || description.includes("fog")) return "🌫️";
  if (description.includes("wind")) return "💨";
  return "🌤️";
});

const searchRes = computed(() => {
  return weatherStore.getSearchInput;
});

const icon = computed(() => {
  return (
    "https://openweathermap.org/img/wn/" +
    weatherStore.getSearchInput.xicon +
    "@4x.png"
  );
});

onMounted(() => {
  updateIsMobile();
  window.addEventListener("resize", updateIsMobile);
});

onUnmounted(() => {
  window.removeEventListener("resize", updateIsMobile);
});
</script>

<style scoped>
.weather-container {
  width: 100%;
  height: 100%;
}

.weather-card {
  background: linear-gradient(135deg, rgba(17, 29, 59, 0.5), rgba(15, 23, 42, 0.5));
  border-radius: 0;
  padding: 0.85rem 1.1rem;
  backdrop-filter: blur(10px);
  border: none;
  box-shadow: none;
  color: white;
  height: 100%;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  gap: 0.6rem;
}

/* ---------- Loading / Error ---------- */
.loading-state {
  display: flex;
  justify-content: center;
  align-items: center;
  flex: 1;
  padding: 2rem;
}

.error-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  flex: 1;
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

/* ---------- Skeleton ---------- */
.skeleton-loader {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1.5rem;
}

.skeleton-circle {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  background: linear-gradient(90deg, rgba(255,255,255,0.1) 25%, rgba(255,255,255,0.2) 50%, rgba(255,255,255,0.1) 75%);
  background-size: 200% 100%;
  animation: loading 1.5s infinite;
}

.skeleton-text {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  width: 200px;
}

.skeleton-line {
  height: 10px;
  border-radius: 4px;
  background: linear-gradient(90deg, rgba(255,255,255,0.1) 25%, rgba(255,255,255,0.2) 50%, rgba(255,255,255,0.1) 75%);
  background-size: 200% 100%;
  animation: loading 1.5s infinite;
}

.skeleton-line.short { width: 60%; }

@keyframes loading {
  0%   { background-position: 200% 0; }
  100% { background-position: -200% 0; }
}

/* ---------- Zone 1: Header ---------- */
.weather-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-bottom: 0.45rem;
  border-bottom: 1px solid rgba(255, 255, 255, 0.15);
  flex-shrink: 0;
  gap: 0.5rem;
}

.header-left {
  display: flex;
  flex-direction: column;
  gap: 0.05rem;
  min-width: 0;
}

.city-name {
  font-size: 0.88rem;
  font-weight: 600;
  margin: 0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.date-text {
  font-size: 0.62rem;
  margin: 0;
  opacity: 0.65;
  font-weight: 400;
  white-space: nowrap;
}

/* Tab switcher */
.tab-switcher {
  display: flex;
  gap: 0.25rem;
  flex-shrink: 0;
}

.tab-btn {
  padding: 0.22rem 0.6rem;
  border-radius: 20px;
  border: 1px solid rgba(8, 145, 178, 0.2);
  background: rgba(8, 145, 178, 0.05);
  color: rgba(255, 255, 255, 0.5);
  font-size: 0.65rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  font-family: inherit;
  white-space: nowrap;
}

.tab-btn:hover {
  border-color: rgba(8, 145, 178, 0.4);
  color: rgba(255, 255, 255, 0.85);
}

.tab-btn.active {
  background: linear-gradient(135deg, rgba(8, 145, 178, 0.3), rgba(107, 33, 168, 0.15));
  border-color: #0891B2;
  color: white;
  box-shadow: 0 0 8px rgba(8, 145, 178, 0.2);
}

/* ---------- Zone 2: Body (icon/temp + pills) ---------- */
.weather-body {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  flex: 1;
  min-height: 0;
}

.temperature-section {
  display: flex;
  align-items: center;
  gap: 0.6rem;
  flex-shrink: 0;
}

.weather-icon-container {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 44px;
  height: 44px;
  flex-shrink: 0;
}

.weather-emoji {
  font-size: 1.65rem;
  position: absolute;
  z-index: 1;
  filter: drop-shadow(0 2px 8px rgba(0, 0, 0, 0.2));
}

.weather-icon {
  position: absolute;
  width: 44px;
  height: 44px;
  transition: opacity 0.4s ease;
  filter: drop-shadow(0 2px 8px rgba(0, 0, 0, 0.2));
}

.temp-display {
  display: flex;
  flex-direction: column;
}

.temperature {
  font-size: 1.55rem;
  font-weight: 700;
  line-height: 1;
  margin: 0;
  text-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
}

.description {
  font-size: 0.62rem;
  margin: 0.1rem 0 0 0;
  opacity: 0.9;
  text-transform: capitalize;
  white-space: nowrap;
}

/* 2×2 pills filling the right side of the body */
.stat-pills {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 0.4rem;
  flex: 1;
}

.stat-pill {
  background: rgba(255, 255, 255, 0.08);
  border: 1px solid rgba(8, 145, 178, 0.15);
  border-radius: 8px;
  padding: 0.35rem 0.3rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  transition: all 0.25s ease;
}

.stat-pill:hover {
  background: rgba(255, 255, 255, 0.12);
  border-color: rgba(8, 145, 178, 0.28);
}

.stat-label {
  font-size: 0.52rem;
  opacity: 0.82;
  text-transform: uppercase;
  letter-spacing: 0.3px;
  margin-bottom: 0.15rem;
}

.stat-value {
  font-size: 0.72rem;
  font-weight: 600;
}

/* ---------- Zone 3: Details grid ---------- */
.details-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 0.45rem;
  flex: 1;
  align-content: start;
}

.detail-item {
  display: flex;
  align-items: center;
  gap: 0.3rem;
  background: rgba(255, 255, 255, 0.07);
  padding: 0.35rem 0.45rem;
  border-radius: 8px;
  border: 1px solid rgba(8, 145, 178, 0.1);
  transition: all 0.2s ease;
}

.detail-item:hover {
  background: rgba(255, 255, 255, 0.11);
  border-color: rgba(8, 145, 178, 0.2);
}

.detail-icon {
  font-size: 0.82rem;
  opacity: 0.8;
  flex-shrink: 0;
}

.detail-info {
  display: flex;
  flex-direction: column;
  min-width: 0;
}

.detail-label {
  font-size: 0.52rem;
  opacity: 0.75;
  text-transform: uppercase;
  letter-spacing: 0.3px;
  margin-bottom: 0.08rem;
}

.detail-value {
  font-size: 0.65rem;
  font-weight: 600;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

/* ---------- Mobile ---------- */
@media (max-width: 640px) {
  .weather-card {
    padding: 1.2rem 1rem 1.2rem;
    gap: 0.75rem;
  }

  .weather-header {
    padding-bottom: 0.65rem;
    border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  }

  .header-left {
    gap: 0.1rem;
  }

  .city-name { 
    font-size: 0.95rem; 
    font-weight: 700;
  }
  .date-text { 
    font-size: 0.64rem;
    opacity: 0.7;
  }

  .mobile-stack {
    display: flex;
    flex-direction: column;
    gap: 0.85rem;
  }

  /* Hero Section */
  .mobile-hero {
    display: flex;
    flex-direction: column;
    align-items: center;
    text-align: center;
    gap: 0.5rem;
    padding: 0.5rem 0;
  }

  .weather-icon-container { 
    width: 90px; 
    height: 90px;
    position: relative;
    display: flex;
    align-items: center;
    justify-content: center;
  }
  
  .weather-emoji { 
    font-size: 3.5rem;
    position: absolute;
    z-index: 1;
    filter: drop-shadow(0 4px 16px rgba(0, 0, 0, 0.4));
  }
  
  .weather-icon { 
    width: 90px; 
    height: 90px;
    position: absolute;
    transition: opacity 0.4s ease;
    filter: drop-shadow(0 4px 20px rgba(0, 0, 0, 0.4));
  }

  .temperature { 
    font-size: 4rem;
    font-weight: 800;
    letter-spacing: -3px;
    line-height: 1;
    margin: 0;
    text-shadow: 0 4px 24px rgba(0, 0, 0, 0.3);
  }
  
  .description { 
    font-size: 0.9rem;
    margin: 0;
    opacity: 0.9;
    font-weight: 500;
    text-transform: capitalize;
  }

  /* Temperature Range Card */
  .mobile-temp-range {
    display: flex;
    align-items: center;
    background: linear-gradient(135deg, rgba(255, 255, 255, 0.12), rgba(255, 255, 255, 0.08));
    border: 1px solid rgba(8, 145, 178, 0.25);
    border-radius: 16px;
    padding: 0.85rem 1rem;
    backdrop-filter: blur(12px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2), inset 0 1px 0 rgba(255, 255, 255, 0.15);
  }

  .temp-range-item {
    flex: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0.25rem;
  }

  .range-icon {
    font-size: 1.2rem;
    color: rgba(34, 211, 238, 0.9);
    margin-bottom: 0.1rem;
  }

  .range-value {
    font-size: 1.5rem;
    font-weight: 800;
    line-height: 1;
  }

  .range-label {
    font-size: 0.65rem;
    opacity: 0.75;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    font-weight: 600;
  }

  .temp-divider {
    width: 1px;
    height: 50px;
    background: linear-gradient(to bottom, transparent, rgba(255, 255, 255, 0.2), transparent);
  }

  /* Quick Stats - 3 columns */
  .mobile-quick-stats {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 0.5rem;
  }

  .quick-stat {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0.3rem;
    background: rgba(255, 255, 255, 0.09);
    border: 1px solid rgba(8, 145, 178, 0.18);
    border-radius: 12px;
    padding: 0.7rem 0.4rem;
    backdrop-filter: blur(10px);
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
    transition: all 0.3s ease;
  }

  .quick-stat:active {
    transform: scale(0.97);
    background: rgba(255, 255, 255, 0.12);
  }

  .quick-icon {
    font-size: 1.1rem;
    color: rgba(34, 211, 238, 0.85);
    margin-bottom: 0.1rem;
  }

  .quick-value {
    font-size: 0.95rem;
    font-weight: 700;
    line-height: 1;
  }

  .quick-label {
    font-size: 0.58rem;
    opacity: 0.75;
    text-transform: uppercase;
    letter-spacing: 0.4px;
    font-weight: 600;
    text-align: center;
  }

  /* Details Grid - 2 columns of cards */
  .mobile-details-grid {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 0.65rem;
  }

  .mobile-detail-card {
    background: rgba(255, 255, 255, 0.08);
    border: 1px solid rgba(8, 145, 178, 0.18);
    border-radius: 14px;
    padding: 0.75rem;
    backdrop-filter: blur(10px);
    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.15);
  }

  .detail-card-header {
    display: flex;
    align-items: center;
    gap: 0.4rem;
    margin-bottom: 0.65rem;
    padding-bottom: 0.5rem;
    border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  }

  .detail-card-icon {
    font-size: 1rem;
    color: rgba(34, 211, 238, 0.9);
  }

  .detail-card-title {
    font-size: 0.7rem;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    opacity: 0.9;
  }

  .detail-card-content {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }

  .sun-time, .condition-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .sun-label, .condition-label {
    font-size: 0.65rem;
    opacity: 0.75;
    font-weight: 500;
  }

  .sun-value, .condition-value {
    font-size: 0.72rem;
    font-weight: 700;
    opacity: 0.95;
  }

  /* Hide old desktop-only styles on mobile */
  .weather-body {
    flex-direction: column;
    align-items: center;
    text-align: center;
  }

  .mobile-card {
    gap: 1rem;
  }

  .temperature-section {
    flex-direction: column;
    align-items: center;
    gap: 0.75rem;
  }

  .stat-pills {
    gap: 0.5rem;
    width: 100%;
  }
  
  .stat-pill { 
    padding: 0.6rem 0.5rem;
    background: rgba(255, 255, 255, 0.1);
    border: 1px solid rgba(8, 145, 178, 0.2);
    border-radius: 12px;
    backdrop-filter: blur(10px);
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15), inset 0 1px 0 rgba(255, 255, 255, 0.1);
  }
  
  .stat-label { 
    font-size: 0.62rem;
    opacity: 0.85;
    font-weight: 600;
    letter-spacing: 0.5px;
  }
  .stat-value { 
    font-size: 0.95rem;
    font-weight: 700;
    margin-top: 0.1rem;
  }

  .tab-btn { font-size: 0.6rem; padding: 0.18rem 0.5rem; }

  .details-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 0.5rem;
  }

  .mobile-details {
    border-top: 1px solid rgba(255, 255, 255, 0.08);
    padding-top: 0.75rem;
    margin-top: 0.25rem;
  }

  .detail-item { 
    padding: 0.5rem 0.6rem;
    background: rgba(255, 255, 255, 0.08);
    border: 1px solid rgba(8, 145, 178, 0.15);
    border-radius: 10px;
    backdrop-filter: blur(8px);
    box-shadow: 0 2px 6px rgba(0, 0, 0, 0.1);
  }
  
  .detail-icon { 
    font-size: 1rem;
    opacity: 0.9;
    color: rgba(34, 211, 238, 0.8);
  }
  
  .detail-label { 
    font-size: 0.58rem;
    opacity: 0.8;
    font-weight: 600;
  }
  .detail-value { 
    font-size: 0.75rem;
    font-weight: 700;
    margin-top: 0.05rem;
  }
}
</style>

