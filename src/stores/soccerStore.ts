import { defineStore } from "pinia";
import axios from "axios";
import type { Match, Competition, SoccerResults } from "../types";

export const useSoccerStore = defineStore("soccerStore", {
  state: () => ({
    soccerResults: {
      matches: [] as Match[],
      competition: { id: null, name: "", code: "", type: "", emblem: "" } as Competition,
    } as SoccerResults,
    championsLeagueResults: {
      matches: [] as Match[],
      competition: { id: null, name: "", code: "", type: "", emblem: "" } as Competition,
    } as SoccerResults,
    laLigaResults: {
      matches: [] as Match[],
      competition: { id: null, name: "", code: "", type: "", emblem: "" } as Competition,
    } as SoccerResults,
    loading: true,
    error: null as string | null,
  }),
  getters: {
    getSoccerResults(): SoccerResults {
      return this.soccerResults;
    },
    getCLResults(): SoccerResults {
      return this.championsLeagueResults;
    },
    getLAResults(): SoccerResults {
      return this.laLigaResults;
    },
  },
  actions: {
    filterByLatestMatchday(matches: Match[]): Match[] {
      if (!matches || matches.length === 0) return [];
      
      // Get the highest matchday number
      const maxMatchday = Math.max(...matches.map(m => m.matchday || 0));
      
      // If no matchday info, return all matches
      if (maxMatchday === 0) return matches;
      
      // Return only matches from the latest matchday
      return matches.filter(m => m.matchday === maxMatchday);
    },
    async searchSoccer() {
      this.loading = true;
      this.error = null;
      try {
        const response = await axios.get("/api/soccer", {
          params: { competition: "PL", status: "FINISHED", limit: 100 },
        });
        const filteredMatches = this.filterByLatestMatchday(response.data.matches);
        this.soccerResults = { ...response.data, matches: filteredMatches };
      } catch (err) {
        console.error("Soccer API error:", err);
        this.error = "Failed to load Premier League matches.";
        this.soccerResults = {
          matches: [],
          competition: { id: null, name: "Premier League", code: "PL", type: "", emblem: "" },
        };
      } finally {
        this.loading = false;
      }
    },
    async searchCLMatches() {
      try {
        const response = await axios.get("/api/soccer", {
          params: { competition: "CL", status: "FINISHED", limit: 100 },
        });
        const filteredMatches = this.filterByLatestMatchday(response.data.matches);
        this.championsLeagueResults = { ...response.data, matches: filteredMatches };
      } catch (err) {
        console.error("Champions League API error:", err);
        this.error = "Failed to load Champions League matches.";
        this.championsLeagueResults = {
          matches: [],
          competition: { id: null, name: "UEFA Champions League", code: "CL", type: "", emblem: "" },
        };
      }
    },
    async searchLAMatches() {
      try {
        const response = await axios.get("/api/soccer", {
          params: { competition: "PD", status: "FINISHED", limit: 100 },
        });
        const filteredMatches = this.filterByLatestMatchday(response.data.matches);
        this.laLigaResults = { ...response.data, matches: filteredMatches };
      } catch (err) {
        console.error("La Liga API error:", err);
        this.error = "Failed to load La Liga matches.";
        this.laLigaResults = {
          matches: [],
          competition: { id: null, name: "La Liga", code: "PD", type: "", emblem: "" },
        };
      }
    },
  },
});
