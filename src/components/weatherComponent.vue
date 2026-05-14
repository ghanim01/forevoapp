<template>
  <div class="weather-container">
    <v-card
      class="weather-card"
      theme="dark"
      :style="gradientBackground"
      elevation="8"
    >
      <!-- Loading State -->
      <div v-if="weatherStore.isLoading" class="loading-state">
        <div class="skeleton-loader">
          <div class="skeleton-circle"></div>
          <div class="skeleton-text">
            <div class="skeleton-line"></div>
            <div class="skeleton-line short"></div>
            <div class="skeleton-line shorter"></div>
          </div>
        </div>
      </div>

      <!-- Error State -->
      <div v-else-if="weatherStore.error" class="error-state">
        <v-icon icon="mdi-weather-cloudy-alert" size="48" class="error-icon"></v-icon>
        <p class="error-message">{{ weatherStore.error }}</p>
        <button class="retry-btn" @click="weatherStore.searchWeather()">
          <v-icon icon="mdi-refresh" size="small"></v-icon>
          Retry
        </button>
      </div>

      <template v-else>
        <!-- Header: city + tab switcher -->
        <div class="weather-header">
          <div class="header-left">
            <h2 class="city-name">{{ searchRes.city }}</h2>
            <div class="header-meta">
              <span class="date-text">{{ searchRes.date }}</span>
              <span class="meta-dot" aria-hidden="true">·</span>
              <span class="date-text">{{ searchRes.condition }}</span>
            </div>
          </div>
          <div class="tab-switcher" v-if="!isMobile">
            <button
              class="tab-btn"
              :class="{ active: activeTab === 'now' }"
              @click="activeTab = 'now'"
              aria-label="Current weather"
            >Now</button>
            <button
              class="tab-btn"
              :class="{ active: activeTab === 'details' }"
              @click="activeTab = 'details'"
              aria-label="Detailed weather"
            >Details</button>
          </div>
        </div>

        <!-- Mobile: everything in a vertical stack -->
        <template v-if="isMobile">
          <div class="mobile-stack">
            <!-- Hero: Icon + Temperature -->
            <div class="mobile-hero">
              <div class="weather-icon-container">
                <span class="weather-emoji" aria-hidden="true">{{ weatherEmoji }}</span>
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

            <!-- Temperature Range -->
            <div class="mobile-temp-range">
              <div class="temp-range-item">
                <v-icon icon="mdi-arrow-up" class="range-icon" aria-hidden="true"></v-icon>
                <span class="range-value">{{ Math.floor(Number(searchRes.temp_max)) }}°</span>
                <span class="range-label">High</span>
              </div>
              <div class="temp-divider" aria-hidden="true"></div>
              <div class="temp-range-item">
                <v-icon icon="mdi-arrow-down" class="range-icon" aria-hidden="true"></v-icon>
                <span class="range-value">{{ Math.floor(Number(searchRes.temp_min)) }}°</span>
                <span class="range-label">Low</span>
              </div>
            </div>

            <!-- Quick Stats: 3 columns -->
            <div class="mobile-quick-stats">
              <div class="quick-stat">
                <v-icon icon="mdi-thermometer" class="quick-icon" aria-hidden="true"></v-icon>
                <span class="quick-value">{{ Math.floor(Number(searchRes.feels_like)) }}°</span>
                <span class="quick-label">Feels</span>
              </div>
              <div class="quick-stat">
                <v-icon icon="mdi-water-percent" class="quick-icon" aria-hidden="true"></v-icon>
                <span class="quick-value">{{ Math.floor(Number(searchRes.humidity)) }}%</span>
                <span class="quick-label">Humidity</span>
              </div>
              <div class="quick-stat">
                <v-icon icon="mdi-weather-windy" class="quick-icon" aria-hidden="true"></v-icon>
                <span class="quick-value">{{ Number(searchRes.windSpeed || 0).toFixed(1) }}</span>
                <span class="quick-label">Wind</span>
              </div>
            </div>

            <!-- Detail Cards: 2 columns -->
            <div class="mobile-details-grid">
              <div class="mobile-detail-card">
                <div class="detail-card-header">
                  <v-icon icon="mdi-white-balance-sunny" class="detail-card-icon" aria-hidden="true"></v-icon>
                  <span class="detail-card-title">Sun Times</span>
                </div>
                <dl class="detail-card-content">
                  <div class="detail-row">
                    <dt class="detail-row-label">Sunrise</dt>
                    <dd class="detail-row-value">{{ searchRes.sunrise }}</dd>
                  </div>
                  <div class="detail-row">
                    <dt class="detail-row-label">Sunset</dt>
                    <dd class="detail-row-value">{{ searchRes.sunset }}</dd>
                  </div>
                </dl>
              </div>

              <div class="mobile-detail-card">
                <div class="detail-card-header">
                  <v-icon icon="mdi-weather-cloudy" class="detail-card-icon" aria-hidden="true"></v-icon>
                  <span class="detail-card-title">Conditions</span>
                </div>
                <dl class="detail-card-content">
                  <div class="detail-row">
                    <dt class="detail-row-label">Clouds</dt>
                    <dd class="detail-row-value">{{ Math.floor(Number(searchRes.clouds || 0)) }}%</dd>
                  </div>
                  <div class="detail-row">
                    <dt class="detail-row-label">Wind Dir</dt>
                    <dd class="detail-row-value">{{ searchRes.windDeg }}°</dd>
                  </div>
                </dl>
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
                  <span class="weather-emoji" aria-hidden="true">{{ weatherEmoji }}</span>
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
            <dl class="details-grid">
              <div class="detail-item">
                <v-icon icon="mdi-thermometer-high" class="detail-icon" aria-hidden="true"></v-icon>
                <div class="detail-info">
                  <dt class="detail-label">Max</dt>
                  <dd class="detail-value">{{ Math.floor(Number(searchRes.temp_max)) }}°</dd>
                </div>
              </div>
              <div class="detail-item">
                <v-icon icon="mdi-thermometer-low" class="detail-icon" aria-hidden="true"></v-icon>
                <div class="detail-info">
                  <dt class="detail-label">Min</dt>
                  <dd class="detail-value">{{ Math.floor(Number(searchRes.temp_min)) }}°</dd>
                </div>
              </div>
              <div class="detail-item">
                <v-icon icon="mdi-weather-windy" class="detail-icon" aria-hidden="true"></v-icon>
                <div class="detail-info">
                  <dt class="detail-label">Wind</dt>
                  <dd class="detail-value">{{ Number(searchRes.windSpeed || 0).toFixed(1) }} m/s</dd>
                </div>
              </div>
              <div class="detail-item">
                <v-icon icon="mdi-compass-outline" class="detail-icon" aria-hidden="true"></v-icon>
                <div class="detail-info">
                  <dt class="detail-label">Direction</dt>
                  <dd class="detail-value">{{ searchRes.windDeg }}°</dd>
                </div>
              </div>
              <div class="detail-item">
                <v-icon icon="mdi-weather-cloudy" class="detail-icon" aria-hidden="true"></v-icon>
                <div class="detail-info">
                  <dt class="detail-label">Clouds</dt>
                  <dd class="detail-value">{{ Math.floor(Number(searchRes.clouds || 0)) }}%</dd>
                </div>
              </div>
              <div class="detail-item">
                <v-icon icon="mdi-tag-outline" class="detail-icon" aria-hidden="true"></v-icon>
                <div class="detail-info">
                  <dt class="detail-label">Condition</dt>
                  <dd class="detail-value">{{ searchRes.condition }}</dd>
                </div>
              </div>
              <div class="detail-item">
                <v-icon icon="mdi-sun-clock" class="detail-icon" aria-hidden="true"></v-icon>
                <div class="detail-info">
                  <dt class="detail-label">Sunrise</dt>
                  <dd class="detail-value">{{ searchRes.sunrise }}</dd>
                </div>
              </div>
              <div class="detail-item">
                <v-icon icon="mdi-sun-down" class="detail-icon" aria-hidden="true"></v-icon>
                <div class="detail-info">
                  <dt class="detail-label">Sunset</dt>
                  <dd class="detail-value">{{ searchRes.sunset }}</dd>
                </div>
              </div>
            </dl>
          </template>
        </template>
      </template>
    </v-card>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from "vue";
import { useWeatherStore } from "../stores/weatherStore";
import { useBreakpoint } from "../composables/useBreakpoint";

const weatherStore = useWeatherStore();
const iconLoaded = ref(false);
const activeTab = ref<"now" | "details">("now");
const { isMobile } = useBreakpoint(640);

const gradientBackground = computed(() => {
  const weatherCode = weatherStore.getSearchInput.xicon;
  const temp = Number(weatherStore.getSearchInput.temp);

  if (temp < 0) {
    return { background: "linear-gradient(135deg, #0B7B9C 0%, #076B7F 100%)" };
  } else if (temp < 10) {
    return { background: "linear-gradient(135deg, #1E5A8E 0%, #0B7B9C 100%)" };
  } else if (temp < 15) {
    return { background: "linear-gradient(135deg, #076B7F 0%, #0F8F7E 100%)" };
  } else if (temp >= 25) {
    return { background: "linear-gradient(135deg, #A16207 0%, #7C2D12 100%)" };
  } else if (temp >= 20) {
    return { background: "linear-gradient(135deg, #92400E 0%, #A16207 100%)" };
  }

  // 15-20°C: use weather condition
  if (weatherCode?.includes("01")) return { background: "linear-gradient(135deg, #A16207 0%, #7C2D12 100%)" };
  if (weatherCode?.includes("02") || weatherCode?.includes("03"))
    return { background: "linear-gradient(135deg, #1E5A8E 0%, #1A3A5C 100%)" };
  if (weatherCode?.includes("04"))
    return { background: "linear-gradient(135deg, #4B5563 0%, #364452 100%)" };
  if (weatherCode?.includes("09") || weatherCode?.includes("10"))
    return { background: "linear-gradient(135deg, #3A4F8F 0%, #1E2847 100%)" };
  if (weatherCode?.includes("11"))
    return { background: "linear-gradient(135deg, #1E5A8E 0%, #0F172A 100%)" };
  if (weatherCode?.includes("13"))
    return { background: "linear-gradient(135deg, #0B7B9C 0%, #076B7F 100%)" };
  if (weatherCode?.includes("50"))
    return { background: "linear-gradient(135deg, #556573 0%, #3F4A57 100%)" };

  return { background: "linear-gradient(135deg, #0891B2 0%, #06857C 100%)" };
});

const weatherEmoji = computed(() => {
  const description =
    weatherStore.getSearchInput.description?.toLowerCase() || "";

  if (description.includes("clear") || description.includes("sunny")) return "☀️";
  if (description.includes("cloud")) return "☁️";
  if (description.includes("rain")) return "🌧️";
  if (description.includes("thunder") || description.includes("storm")) return "⛈️";
  if (description.includes("snow")) return "❄️";
  if (description.includes("mist") || description.includes("fog")) return "🌫️";
  if (description.includes("wind")) return "💨";
  return "🌤️";
});

const searchRes = computed(() => weatherStore.getSearchInput);

const icon = computed(
  () =>
    "https://openweathermap.org/img/wn/" +
    weatherStore.getSearchInput.xicon +
    "@4x.png"
);
</script>

<style scoped>
.weather-container {
  width: 100%;
  height: 100%;
}

.weather-card {
  background: linear-gradient(
    135deg,
    rgba(17, 29, 59, 0.5),
    rgba(15, 23, 42, 0.5)
  );
  border-radius: 0;
  padding: 0.65rem 1rem;
  backdrop-filter: blur(10px);
  border: none;
  box-shadow: none;
  color: white;
  height: 100%;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
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
  background: linear-gradient(
    90deg,
    rgba(255, 255, 255, 0.08) 25%,
    rgba(255, 255, 255, 0.18) 50%,
    rgba(255, 255, 255, 0.08) 75%
  );
  background-size: 200% 100%;
  animation: shimmer 1.5s infinite;
}

.skeleton-text {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  width: 200px;
}

.skeleton-line {
  height: 12px;
  border-radius: 6px;
  background: linear-gradient(
    90deg,
    rgba(255, 255, 255, 0.08) 25%,
    rgba(255, 255, 255, 0.18) 50%,
    rgba(255, 255, 255, 0.08) 75%
  );
  background-size: 200% 100%;
  animation: shimmer 1.5s infinite;
}

.skeleton-line.short {
  width: 60%;
}

.skeleton-line.shorter {
  width: 40%;
}

@keyframes shimmer {
  0% {
    background-position: 200% 0;
  }
  100% {
    background-position: -200% 0;
  }
}

/* ---------- Header ---------- */
.weather-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-bottom: 0.35rem;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  flex-shrink: 0;
  gap: 0.5rem;
}

.header-left {
  display: flex;
  flex-direction: column;
  gap: 0.1rem;
  min-width: 0;
}

.city-name {
  font-size: 0.85rem;
  font-weight: 700;
  margin: 0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.header-meta {
  display: flex;
  align-items: center;
  gap: 0.35rem;
  font-size: 0.62rem;
  color: rgba(255, 255, 255, 0.6);
}

.date-text {
  font-size: inherit;
  margin: 0;
  font-weight: 400;
  white-space: nowrap;
}

.meta-dot {
  opacity: 0.4;
}

/* Tab switcher */
.tab-switcher {
  display: flex;
  gap: 0.25rem;
  flex-shrink: 0;
}

.tab-btn {
  padding: 0.2rem 0.55rem;
  border-radius: 20px;
  border: 1px solid rgba(8, 145, 178, 0.2);
  background: rgba(8, 145, 178, 0.05);
  color: rgba(255, 255, 255, 0.55);
  font-size: 0.62rem;
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

.tab-btn:active {
  transform: scale(0.95);
}

.tab-btn.active {
  background: linear-gradient(
    135deg,
    rgba(8, 145, 178, 0.3),
    rgba(107, 33, 168, 0.15)
  );
  border-color: #0891b2;
  color: white;
  box-shadow: 0 0 8px rgba(8, 145, 178, 0.2);
}

/* ---------- Body ---------- */
.weather-body {
  display: flex;
  align-items: center;
  gap: 0.6rem;
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
  width: 40px;
  height: 40px;
  flex-shrink: 0;
}

.weather-emoji {
  font-size: 1.5rem;
  position: absolute;
  z-index: 1;
  filter: drop-shadow(0 2px 8px rgba(0, 0, 0, 0.2));
}

.weather-icon {
  position: absolute;
  width: 40px;
  height: 40px;
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
  font-size: 0.65rem;
  margin: 0.1rem 0 0 0;
  opacity: 0.9;
  text-transform: capitalize;
  white-space: nowrap;
}

/* 2x2 pills */
.stat-pills {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 0.3rem;
  flex: 1;
}

.stat-pill {
  background: rgba(255, 255, 255, 0.08);
  border: 1px solid rgba(8, 145, 178, 0.15);
  border-radius: 8px;
  padding: 0.3rem 0.25rem;
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
  font-size: 0.55rem;
  opacity: 0.82;
  text-transform: uppercase;
  letter-spacing: 0.3px;
  margin-bottom: 0.1rem;
}

.stat-value {
  font-size: 0.72rem;
  font-weight: 600;
}

/* ---------- Details grid ---------- */
.details-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 0.45rem;
  flex: 1;
  align-content: start;
  margin: 0;
}

.detail-item {
  display: flex;
  align-items: center;
  gap: 0.35rem;
  background: rgba(255, 255, 255, 0.07);
  padding: 0.4rem 0.5rem;
  border-radius: 8px;
  border: 1px solid rgba(8, 145, 178, 0.1);
  transition: all 0.2s ease;
}

.detail-item:hover {
  background: rgba(255, 255, 255, 0.11);
  border-color: rgba(8, 145, 178, 0.2);
}

.detail-icon {
  font-size: 0.9rem;
  opacity: 0.8;
  flex-shrink: 0;
}

.detail-info {
  display: flex;
  flex-direction: column;
  min-width: 0;
}

.detail-label {
  font-size: 0.6rem;
  opacity: 0.75;
  text-transform: uppercase;
  letter-spacing: 0.3px;
  margin-bottom: 0.08rem;
}

.detail-value {
  font-size: 0.72rem;
  font-weight: 600;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  margin: 0;
}

/* ---------- Mobile ---------- */
@media (max-width: 640px) {
  .weather-card {
    padding: 1.2rem 1rem;
    gap: 0.75rem;
  }

  .weather-header {
    padding-bottom: 0.6rem;
  }

  .header-left {
    gap: 0.15rem;
  }

  .city-name {
    font-size: 1rem;
    font-weight: 700;
  }

  .header-meta {
    font-size: 0.7rem;
  }

  .mobile-stack {
    display: flex;
    flex-direction: column;
    gap: 0.85rem;
  }

  .mobile-hero {
    display: flex;
    flex-direction: column;
    align-items: center;
    text-align: center;
    gap: 0.4rem;
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

  .mobile-temp-range {
    display: flex;
    align-items: center;
    background: linear-gradient(
      135deg,
      rgba(255, 255, 255, 0.12),
      rgba(255, 255, 255, 0.08)
    );
    border: 1px solid rgba(8, 145, 178, 0.25);
    border-radius: 16px;
    padding: 0.85rem 1rem;
    backdrop-filter: blur(12px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2),
      inset 0 1px 0 rgba(255, 255, 255, 0.15);
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
    font-size: 0.68rem;
    opacity: 0.75;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    font-weight: 600;
  }

  .temp-divider {
    width: 1px;
    height: 50px;
    background: linear-gradient(
      to bottom,
      transparent,
      rgba(255, 255, 255, 0.2),
      transparent
    );
  }

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
    font-size: 0.62rem;
    opacity: 0.75;
    text-transform: uppercase;
    letter-spacing: 0.4px;
    font-weight: 600;
    text-align: center;
  }

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
    margin: 0;
  }

  .detail-row {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .detail-row-label {
    font-size: 0.68rem;
    opacity: 0.75;
    font-weight: 500;
  }

  .detail-row-value {
    font-size: 0.75rem;
    font-weight: 700;
    opacity: 0.95;
    margin: 0;
  }
}
</style>
