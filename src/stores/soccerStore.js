import { ref } from "vue";
import { defineStore } from "pinia";
import axios from "axios";
export const useSoccerStore = defineStore("soccerStore", {
  state: () => ({
    soccerResults: ref({}),
    worldCupResults: ref({}),
    loading: true,
  }),
  getters: {
    getSoccerResults: function () {
      return this.soccerResults;
    },
    getWCResults: function () {
      return this.worldCupResults;
    },
  },
  actions: {
    async searchSoccer() {
      try {
        let res = await axios.get("/api/soccer", {
          params: {
            competition: "PL",
            status: "FINISHED",
          },
        });
        this.soccerResults = res.data;
      } catch (error) {
        console.error("Soccer API error:", error);
      }
    },
    async searchWCMatches() {
      try {
        let res = await axios.get("/api/soccer", {
          params: {
            competition: "CL",
          },
        });
        this.worldCupResults = res.data;
      } catch (error) {
        console.error("Champions League API error:", error);
      } finally {
        this.loading = false;
      }
    },
  },
});
