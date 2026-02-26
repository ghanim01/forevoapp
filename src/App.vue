<template>
  <v-app theme="dark" id="app" class="bgMain">
    <v-main class="app-main">
      <router-view></router-view>
    </v-main>
  </v-app>
</template>

<script setup>
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

html, body {
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

html, body {
  height: 100%;
  width: 100%;
  overflow: hidden;
}
</style>
