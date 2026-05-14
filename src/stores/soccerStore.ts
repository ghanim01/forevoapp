import { defineStore } from "pinia";
import http from "../api/http";
import type { Match, Competition, SoccerResults } from "../types";

const EMPTY_SOCCER_RESULTS: SoccerResults = {
  matches: [],
  competition: {
    id: null,
    name: "",
    code: "",
    type: "",
    emblem: "",
  } as Competition,
};

export const useSoccerStore = defineStore("soccerStore", {
  state: () => ({
    soccerResults: { ...EMPTY_SOCCER_RESULTS } as SoccerResults,
    championsLeagueResults: { ...EMPTY_SOCCER_RESULTS } as SoccerResults,
    laLigaResults: { ...EMPTY_SOCCER_RESULTS } as SoccerResults,
    isLoading: false,
    errors: {
      pl: null as string | null,
      cl: null as string | null,
      la: null as string | null,
    },
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
    /** Convenience getter that returns the error for the currently active tab */
    activeError: (state) => {
      return (tab: "pl" | "cl" | "la"): string | null => {
        return state.errors[tab];
      };
    },
  },
  actions: {
    clearError(tab?: "pl" | "cl" | "la") {
      if (tab) {
        this.errors[tab] = null;
      } else {
        this.errors = { pl: null, cl: null, la: null };
      }
    },
    filterByLatestMatchday(matches: Match[]): Match[] {
      if (!matches || matches.length === 0) return [];

      // Get the highest matchday number
      const maxMatchday = Math.max(
        ...matches.map((m) => m.matchday || 0)
      );

      // If no matchday info, return all matches
      if (maxMatchday === 0) return matches;

      // Return only matches from the latest matchday
      return matches.filter((m) => m.matchday === maxMatchday);
    },
    async searchSoccer() {
      this.isLoading = true;
      this.errors.pl = null;
      try {
        const response = await http.get("/soccer", {
          params: { competition: "PL", status: "FINISHED", limit: 100 },
        });
        const filteredMatches = this.filterByLatestMatchday(
          response.data.matches
        );
        this.soccerResults = {
          ...response.data,
          matches: filteredMatches,
        };
      } catch (err) {
        console.error("Soccer API error:", err);
        this.errors.pl = "Failed to load Premier League matches.";
        this.soccerResults = {
          matches: [],
          competition: {
            id: null,
            name: "Premier League",
            code: "PL",
            type: "",
            emblem: "",
          },
        };
      } finally {
        this.isLoading = false;
      }
    },
    async searchCLMatches() {
      this.errors.cl = null;
      try {
        const response = await http.get("/soccer", {
          params: {
            competition: "CL",
            status: "FINISHED",
            limit: 100,
          },
        });
        const filteredMatches = this.filterByLatestMatchday(
          response.data.matches
        );
        this.championsLeagueResults = {
          ...response.data,
          matches: filteredMatches,
        };
      } catch (err) {
        console.error("Champions League API error:", err);
        this.errors.cl = "Failed to load Champions League matches.";
        this.championsLeagueResults = {
          matches: [],
          competition: {
            id: null,
            name: "UEFA Champions League",
            code: "CL",
            type: "",
            emblem: "",
          },
        };
      }
    },
    async searchLAMatches() {
      this.errors.la = null;
      try {
        const response = await http.get("/soccer", {
          params: {
            competition: "PD",
            status: "FINISHED",
            limit: 100,
          },
        });
        const filteredMatches = this.filterByLatestMatchday(
          response.data.matches
        );
        this.laLigaResults = {
          ...response.data,
          matches: filteredMatches,
        };
      } catch (err) {
        console.error("La Liga API error:", err);
        this.errors.la = "Failed to load La Liga matches.";
        this.laLigaResults = {
          matches: [],
          competition: {
            id: null,
            name: "La Liga",
            code: "PD",
            type: "",
            emblem: "",
          },
        };
      }
    },
  },
});
