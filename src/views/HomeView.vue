<template>
  <div background-color="transparent">
    <v-row>
      <v-col col="12" lg="12"> <navBar /> </v-col>
    </v-row>
    <v-row align-start>
      <v-col col="12" lg="4" align-self="start" position="fixed">
        <div><weatherComponent /> <soccerResults /></div>
      </v-col>
      <v-col col="12" lg="8"> <newsComponent /> </v-col>
    </v-row>
  </div>
</template>
<script setup lang="ts">
import navBar from "../components/navBar.vue";
import weatherComponent from "../components/weatherComponent.vue";
import newsComponent from "../components/newsComponent.vue";
import soccerResults from "../components/soccerResults.vue";
</script>
<style></style>
