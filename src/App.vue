<template>
  <v-app theme="dark" id="app" class="bgMain">
    <v-main class="app-main">
      <router-view></router-view>
    </v-main>
  </v-app>
</template>

<script setup lang="ts">
import { RouterView } from "vue-router";
</script>

<style scoped>
:deep(.app-main) {
  padding: 0;
  height: 100dvh;
  width: 100dvw;
  overflow: hidden;
}

:deep(.v-app) {
  height: 100dvh;
  width: 100dvw;
  overflow: hidden;
}

:deep(#app) {
  height: 100dvh;
  width: 100dvw;
  overflow: hidden;
}

html,
body {
  height: 100%;
  width: 100%;
  overflow: hidden;
  margin: 0;
  padding: 0;
}
</style>

<style>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

html,
body {
  height: 100%;
  width: 100%;
  overflow: hidden;
}

/* Global focus-visible styles for keyboard accessibility */
*:focus-visible {
  outline: 2px solid rgba(34, 211, 238, 0.6);
  outline-offset: 2px;
  border-radius: 4px;
}

/* Remove focus outline for mouse users */
*:focus:not(:focus-visible) {
  outline: none;
}

/* Smooth scrolling for overflow containers */
::-webkit-scrollbar {
  width: 6px;
  height: 6px;
}

::-webkit-scrollbar-track {
  background: transparent;
}

::-webkit-scrollbar-thumb {
  background: rgba(8, 145, 178, 0.25);
  border-radius: 3px;
}

::-webkit-scrollbar-thumb:hover {
  background: rgba(8, 145, 178, 0.4);
}

/* Consistent scrollbar for Firefox */
* {
  scrollbar-width: thin;
  scrollbar-color: rgba(8, 145, 178, 0.25) transparent;
}
</style>
