<template>
  <v-app-bar theme="dark" density="default" class="align-center" extended>
    <v-app-bar-title>
      <v-img src="../assets/forevoLogo.png" width="110px" class="mt-6 ml-8" />
    </v-app-bar-title>
    <v-text-field
      v-model.lazy="model"
      label="search"
      prepend-inner-icon="mdi-magnify"
      clearable
      density="compact"
      class="mt-12 me-3"
      variant="outlined"
      rounded
      @keydown.enter="searchCity()"
    ></v-text-field>
    <!-- <v-autocomplete
      v-model="model"
      :items="items"
      :loading="isLoading"
      hide-no-data
      hide-selected
      item-title="Description"
      item-value="name"
      label="Search Cities"
      placeholder="Start typing to Search"
      prepend-icon="mdi-city"
      return-object
      clearable
    ></v-autocomplete> -->
    <v-btn
      @click="searchCity()"
      class="mt-6 px-0 text-blue-lighten-3"
      variant="flat"
      ripple
      icon="mdi-magnify"
    ></v-btn>
    <v-spacer></v-spacer>
  </v-app-bar>
</template>
<script setup lang="ts">
import { onMounted, ref } from "vue";
import { useWeatherStore } from "../stores/weatherStore";
import { useNewsStore } from "../stores/NewsStore";
import { debounce } from "lodash";
import { useSoccerStore } from "../stores/soccerStore";

const weatherStore = useWeatherStore();
const newsStore = useNewsStore();
const soccerStore = useSoccerStore();
const model = ref<string>("");

const searchCity = debounce(function (this: any) {
  weatherStore.searchCityName(this.model || model.value);
  newsStore.searchCity(this.model || model.value);
}, 500);

onMounted(() => {
  model.value = "Chicago";
  weatherStore.searchCityName(model.value);
  newsStore.searchCity(model.value);
  soccerStore.searchSoccer();
  soccerStore.searchWCMatches();
});
</script>
<style></style>
