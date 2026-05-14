<template>
  <div class="home-container">
    <AppHeader />
    <div class="main-content" :class="{ 'mobile-view': isMobile }">
      <!-- Desktop & Tablet Layout -->
      <template v-if="!isMobile">
        <div class="dashboard-layout">
          <!-- Left Column -->
          <div class="column column-left">
            <!-- Weather Section -->
            <div class="section section-weather">
              <weatherComponent />
            </div>

            <!-- Soccer Section -->
            <div class="section section-soccer">
              <soccerResults />
            </div>
          </div>

          <!-- Right Column -->
          <div class="column column-right">
            <!-- News Section -->
            <div class="section section-news">
              <newsComponent />
            </div>
          </div>
        </div>
      </template>

      <!-- Mobile Layout: Card Carousel -->
      <template v-else>
        <div class="mobile-carousel">
          <!-- Weather Card -->
          <div class="carousel-card" v-show="activeCardMobile === 'weather'">
            <div class="section section-weather">
              <weatherComponent />
            </div>
          </div>

          <!-- Soccer Card -->
          <div class="carousel-card" v-show="activeCardMobile === 'soccer'">
            <div class="section section-soccer">
              <soccerResults />
            </div>
          </div>

          <!-- News Card -->
          <div class="carousel-card" v-show="activeCardMobile === 'news'">
            <div class="section section-news">
              <newsComponent />
            </div>
          </div>
        </div>

        <!-- Bottom Tab Navigation -->
        <nav class="mobile-bottom-nav" aria-label="Section navigation">
          <button
            class="nav-tab"
            :class="{ active: activeCardMobile === 'weather' }"
            @click="switchMobileTab('weather')"
            aria-current="page"
          >
            <v-icon icon="mdi-cloud" size="24"></v-icon>
            <span>Weather</span>
          </button>
          <button
            class="nav-tab"
            :class="{ active: activeCardMobile === 'soccer' }"
            @click="switchMobileTab('soccer')"
          >
            <v-icon icon="mdi-soccer" size="24"></v-icon>
            <span>Soccer</span>
          </button>
          <button
            class="nav-tab"
            :class="{ active: activeCardMobile === 'news' }"
            @click="switchMobileTab('news')"
          >
            <v-icon icon="mdi-newspaper" size="24"></v-icon>
            <span>News</span>
          </button>
        </nav>
      </template>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue";
import { useBreakpoint } from "../composables/useBreakpoint";
import AppHeader from "../components/AppHeader.vue";
import weatherComponent from "../components/weatherComponent.vue";
import newsComponent from "../components/newsComponent.vue";
import soccerResults from "../components/soccerResults.vue";

const { isMobile } = useBreakpoint(640);
const activeCardMobile = ref("weather");

// Track which mobile tabs have been visited to preserve scroll state
const visitedTabs = ref<Set<string>>(new Set(["weather"]));

const switchMobileTab = (tab: string) => {
  visitedTabs.value.add(tab);
  activeCardMobile.value = tab;
};
</script>

<style scoped>
* {
  box-sizing: border-box;
}

.home-container {
  display: flex;
  flex-direction: column;
  height: 100dvh;
  width: 100dvw;
  background: #07091a;
  overflow: hidden;
  position: relative;
}

/* Ambient glow orbs behind content */
.home-container::before {
  content: "";
  position: fixed;
  top: -15%;
  left: -5%;
  width: 50%;
  height: 50%;
  background: radial-gradient(
    ellipse,
    rgba(8, 145, 178, 0.06) 0%,
    transparent 70%
  );
  pointer-events: none;
  z-index: 0;
}

.home-container::after {
  content: "";
  position: fixed;
  bottom: -10%;
  right: 0;
  width: 40%;
  height: 50%;
  background: radial-gradient(
    ellipse,
    rgba(107, 33, 168, 0.05) 0%,
    transparent 70%
  );
  pointer-events: none;
  z-index: 0;
}

.main-content {
  flex: 1;
  min-height: 0;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  position: relative;
  z-index: 1;
}

/* Desktop Layout */
.dashboard-layout {
  display: grid;
  grid-template-columns: 520px 1fr;
  gap: 1rem;
  padding: 1rem;
  height: 100%;
  overflow: hidden;
}

.column {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  height: 100%;
  overflow: hidden;
  min-height: 0;
}

.column-left {
  grid-column: 1;
}

.column-right {
  grid-column: 2;
}

.section {
  flex: 1;
  overflow-y: auto;
  overflow-x: hidden;
  min-height: 0;
  border-radius: 16px;
  background: rgba(10, 16, 40, 0.7);
  border: 1px solid rgba(8, 145, 178, 0.1);
  backdrop-filter: blur(20px);
  box-shadow: 0 4px 24px rgba(0, 0, 0, 0.3),
    inset 0 1px 0 rgba(255, 255, 255, 0.04);
}

/* Section-specific sizing + accent borders */
.section-weather {
  flex: 0.55;
  border-color: rgba(8, 145, 178, 0.15);
}

.section-soccer {
  flex: 5;
  border-color: rgba(34, 197, 94, 0.1);
}

.section-news {
  flex: 1;
  border-color: rgba(168, 85, 247, 0.1);
}

/* Tablet Layout */
@media (max-width: 1199px) {
  .dashboard-layout {
    grid-template-columns: 468px 1fr;
    gap: 0.75rem;
    padding: 0.75rem;
  }
}

@media (max-width: 1023px) {
  .dashboard-layout {
    grid-template-columns: 1fr;
    gap: 0.75rem;
    padding: 0.75rem;
  }

  .column-left {
    grid-column: 1;
    grid-row: 1;
    max-height: 45dvh;
  }

  .column-right {
    grid-column: 1;
    grid-row: 2;
    max-height: 45dvh;
  }
}

/* Mobile Layout */
@media (max-width: 639px) {
  .main-content.mobile-view {
    position: relative;
    padding-bottom: 76px;
  }

  .mobile-carousel {
    position: relative;
    width: 100%;
    height: 100%;
    overflow: hidden;
    padding: 0;
    display: flex;
    flex-direction: column;
  }

  .carousel-card {
    flex: 1;
    min-height: 0;
    padding: 0.5rem;
    display: flex;
    overflow: hidden;
    animation: fadeSlideIn 0.35s cubic-bezier(0.16, 1, 0.3, 1);
  }

  .carousel-card .section {
    width: 100%;
    height: 100%;
    border-radius: 12px;
  }

  @keyframes fadeSlideIn {
    from {
      opacity: 0;
      transform: translateY(12px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  .mobile-bottom-nav {
    position: fixed;
    bottom: 0;
    left: 0;
    right: 0;
    height: 76px;
    background: linear-gradient(
      180deg,
      rgba(7, 9, 26, 0.85),
      rgba(7, 9, 26, 0.97)
    );
    border-top: 1px solid rgba(8, 145, 178, 0.15);
    display: flex;
    justify-content: space-around;
    align-items: center;
    backdrop-filter: blur(16px);
    z-index: 100;
    padding-bottom: env(safe-area-inset-bottom, 0);
  }

  .nav-tab {
    flex: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 0.3rem;
    padding: 0.5rem 0.25rem;
    background: none;
    border: none;
    color: rgba(255, 255, 255, 0.4);
    font-size: 0.65rem;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.25s ease;
    height: 100%;
    letter-spacing: 0.3px;
    position: relative;
  }

  .nav-tab::after {
    content: "";
    position: absolute;
    top: 4px;
    left: 50%;
    transform: translateX(-50%) scaleX(0);
    width: 32px;
    height: 3px;
    background: #22d3ee;
    border-radius: 2px;
    transition: transform 0.25s cubic-bezier(0.16, 1, 0.3, 1);
  }

  .nav-tab.active {
    color: #22d3ee;
  }

  .nav-tab.active::after {
    transform: translateX(-50%) scaleX(1);
  }

  .nav-tab.active :deep(.v-icon) {
    filter: drop-shadow(0 0 6px rgba(34, 211, 238, 0.5));
  }

  .nav-tab:active {
    transform: scale(0.95);
  }

  .nav-tab span {
    display: block;
  }
}
</style>
