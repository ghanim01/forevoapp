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
            <div class="section weather-section">
              <weatherComponent />
            </div>
            
            <!-- Soccer Section -->
            <div class="section soccer-section">
              <soccerResults />
            </div>
          </div>

          <!-- Right Column -->
          <div class="column column-right">
            <!-- News Section -->
            <div class="section news-section">
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
            <div class="section weather-section">
              <weatherComponent />
            </div>
          </div>

          <!-- Soccer Card -->
          <div class="carousel-card" v-show="activeCardMobile === 'soccer'">
            <div class="section soccer-section">
              <soccerResults />
            </div>
          </div>

          <!-- News Card -->
          <div class="carousel-card" v-show="activeCardMobile === 'news'">
            <div class="section news-section">
              <newsComponent />
            </div>
          </div>
        </div>

        <!-- Bottom Tab Navigation -->
        <div class="mobile-bottom-nav">
          <button 
            class="nav-tab"
            :class="{ active: activeCardMobile === 'weather' }"
            @click="activeCardMobile = 'weather'"
          >
            <v-icon icon="mdi-cloud" size="24"></v-icon>
            <span>Weather</span>
          </button>
          <button 
            class="nav-tab"
            :class="{ active: activeCardMobile === 'soccer' }"
            @click="activeCardMobile = 'soccer'"
          >
            <v-icon icon="mdi-soccer" size="24"></v-icon>
            <span>Soccer</span>
          </button>
          <button 
            class="nav-tab"
            :class="{ active: activeCardMobile === 'news' }"
            @click="activeCardMobile = 'news'"
          >
            <v-icon icon="mdi-newspaper" size="24"></v-icon>
            <span>News</span>
          </button>
        </div>
      </template>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from "vue";
import AppHeader from "../components/AppHeader.vue";
import weatherComponent from "../components/weatherComponent.vue";
import newsComponent from "../components/newsComponent.vue";
import soccerResults from "../components/soccerResults.vue";

const isMobile = ref(false);
const activeCardMobile = ref("weather");

const checkMobileView = () => {
  isMobile.value = window.innerWidth < 640;
};

onMounted(() => {
  checkMobileView();
  window.addEventListener("resize", checkMobileView);
});

onUnmounted(() => {
  window.removeEventListener("resize", checkMobileView);
});
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
  background: #07091A;
  overflow: hidden;
  position: relative;
}

/* Ambient glow orbs behind content */
.home-container::before {
  content: '';
  position: fixed;
  top: -15%;
  left: -5%;
  width: 50%;
  height: 50%;
  background: radial-gradient(ellipse, rgba(8, 145, 178, 0.06) 0%, transparent 70%);
  pointer-events: none;
  z-index: 0;
}

.home-container::after {
  content: '';
  position: fixed;
  bottom: -10%;
  right: 0;
  width: 40%;
  height: 50%;
  background: radial-gradient(ellipse, rgba(107, 33, 168, 0.05) 0%, transparent 70%);
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
  box-shadow: 0 4px 24px rgba(0, 0, 0, 0.3), inset 0 1px 0 rgba(255,255,255,0.04);
}

/* Scrollbar */
.section::-webkit-scrollbar { width: 4px; }
.section::-webkit-scrollbar-track { background: transparent; }
.section::-webkit-scrollbar-thumb { background: rgba(8, 145, 178, 0.2); border-radius: 4px; }
.section::-webkit-scrollbar-thumb:hover { background: rgba(8, 145, 178, 0.35); }
.section { scrollbar-width: thin; scrollbar-color: rgba(8, 145, 178, 0.2) transparent; }

.weather-section {
  flex: 1.2;
}

.soccer-section {
  flex: 3;
}

.news-section {
  flex: 1;
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
    padding-bottom: 70px;
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
    animation: slideIn 0.3s ease-out;
    display: flex;
    overflow: hidden;
  }

  .carousel-card .section {
    width: 100%;
    height: 100%;
    border-radius: 12px;
  }

  @keyframes slideIn {
    from { opacity: 0; transform: translateY(20px); }
    to { opacity: 1; transform: translateY(0); }
  }

  .mobile-bottom-nav {
    position: fixed;
    bottom: 0;
    left: 0;
    right: 0;
    height: 70px;
    background: linear-gradient(180deg, rgba(7, 9, 26, 0.85), rgba(7, 9, 26, 0.97));
    border-top: 1px solid rgba(8, 145, 178, 0.15);
    display: flex;
    justify-content: space-around;
    align-items: center;
    backdrop-filter: blur(16px);
    z-index: 100;
  }

  .nav-tab {
    flex: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 0.35rem;
    padding: 0.5rem;
    background: none;
    border: none;
    color: rgba(255, 255, 255, 0.4);
    font-size: 0.65rem;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.25s ease;
    height: 100%;
    letter-spacing: 0.3px;
  }

  .nav-tab.active { color: #22D3EE; }
  .nav-tab.active :deep(.v-icon) { filter: drop-shadow(0 0 6px rgba(34, 211, 238, 0.5)); }
  .nav-tab span { display: block; }
}
</style>
