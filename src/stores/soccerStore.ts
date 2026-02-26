import { defineStore } from "pinia";
import axios from "axios";

interface Match {
  id: number;
  utcDate: string;
  status: string;
  stage: string;
  group: string | null;
  lastUpdated: string;
  homeTeam: {
    id: number;
    name: string;
    shortName: string;
    tla: string;
    crest: string;
  };
  awayTeam: {
    id: number;
    name: string;
    shortName: string;
    tla: string;
    crest: string;
  };
  score: {
    winner: string;
    duration: string;
    fullTime: {
      home: number | null;
      away: number | null;
    };
    halfTime: {
      home: number | null;
      away: number | null;
    };
  };
}

interface Competition {
  id: number | null;
  name: string;
  code: string;
  type: string;
  emblem: string;
}

interface SoccerResults {
  matches: Match[];
  competition: Competition;
}

export const useSoccerStore = defineStore("soccerStore", {
  state: () => ({
    soccerResults: {
      matches: [],
      competition: {
        id: null,
        name: "",
        code: "",
        type: "",
        emblem: "",
      },
    } as SoccerResults,
    worldCupResults: {
      matches: [],
      competition: {
        id: null,
        name: "",
        code: "",
        type: "",
        emblem: "",
      },
    } as SoccerResults,
    loading: true,
  }),
  getters: {
    getSoccerResults(): SoccerResults {
      return this.soccerResults;
    },
    getWCResults(): SoccerResults {
      return this.worldCupResults;
    },
  },
  actions: {
    async searchSoccer() {
      this.loading = true;
      try {
        const response = await axios.get("/api/soccer", {
          params: {
            competition: "PL",
            status: "FINISHED",
          },
        });
        this.soccerResults = response.data;
      } catch (error) {
        console.error("Soccer API error:", error);
      } finally {
        this.loading = false;
      }
    },
    async searchWCMatches() {
      try {
        const response = await axios.get("/api/soccer", {
          params: {
            competition: "CL",
            status: "FINISHED",
          },
        });
        this.worldCupResults = response.data;
      } catch (error) {
        console.error("Champions League API error:", error);
      } finally {
        this.loading = false;
      }
    },
  },
});
