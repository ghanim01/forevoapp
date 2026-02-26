// Shared type definitions used across stores and components

export interface CityData {
  name: string;
  country: string;
  lat: string | number;
  lng: string | number;
}

export interface WeatherData {
  temp: number;
  city: string;
  windSpeed: string | number;
  windDeg: string | number;
  humidity: string | number;
  clouds: string | number;
  xicon: string;
  description: string;
  feels_like: string | number;
  temp_min: string | number;
  temp_max: string | number;
  date: string;
  sunrise: string;
  sunset: string;
  condition: string;
}

export interface Article {
  id: number;
  title: string;
  description: string;
  url: string;
  urlToImage: string | null;
  publishedAt: string;
  source: { name: string };
  content: string;
  author: string | null;
  authors: string[] | null;
  language: string;
  category: string;
  source_country: string;
  sentiment: number;
}

export interface TeamInfo {
  id: number;
  name: string;
  shortName: string;
  tla: string;
  crest: string;
}

export interface MatchScore {
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
}

export interface Match {
  id: number;
  utcDate: string;
  status: string;
  stage: string;
  group: string | null;
  matchday?: number;
  lastUpdated: string;
  homeTeam: TeamInfo;
  awayTeam: TeamInfo;
  score: MatchScore;
}

export interface Competition {
  id: number | null;
  name: string;
  code: string;
  type: string;
  emblem: string;
}

export interface SoccerResults {
  matches: Match[];
  competition: Competition;
}
