import type { CityData } from "../types";

let _cities: CityData[] | null = null;

/**
 * Lazy-load the cities.json dataset.
 * This defers the ~69MB import until the user first searches, avoiding
 * blocking the initial page load.
 */
async function loadCities(): Promise<CityData[]> {
  if (_cities) return _cities;
  // Dynamic import defers the bundle cost until first use
  const module = await import("cities.json");
  _cities = (module.default || module) as CityData[];
  return _cities;
}

/**
 * Find a city by exact name (case-insensitive first-letter-uppercase match).
 * Returns the city data or null if not found.
 */
export async function findCityByName(name: string): Promise<CityData | null> {
  const cities = await loadCities();
  const normalized = name.charAt(0).toUpperCase() + name.slice(1).toLowerCase();
  const found = cities.find((c) => c.name === normalized);
  return found ?? null;
}

/**
 * Search cities by partial name match (case-insensitive).
 * Returns up to `limit` results.
 */
export async function searchCities(
  query: string,
  limit = 6
): Promise<CityData[]> {
  if (!query || query.length < 2) return [];
  const cities = await loadCities();
  const lower = query.toLowerCase();
  const results: CityData[] = [];
  for (const city of cities) {
    if (city.name.toLowerCase().includes(lower)) {
      results.push(city);
      if (results.length >= limit) break;
    }
  }
  return results;
}

/**
 * Clear the cached cities dataset (useful for testing).
 */
export function clearCitiesCache(): void {
  _cities = null;
}
