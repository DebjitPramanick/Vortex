import type { Location } from "@app-types/application";

type GeoName = {
  name?: string;
  countryName?: string;
  countryCode?: string;
  lat?: string | number;
  lng?: string | number;
};

export function formatLocation(
  location: Location | string | null | undefined,
): string {
  if (!location) return "—";
  if (typeof location === "string") return location.trim() || "—";
  const name = location.name?.trim() ?? "";
  if (!name) return "—";
  const country = location.country?.trim() ?? "";
  if (country) return `${name}, ${country}`;
  return name;
}

export function locationFromLabel(query: string): Location {
  const parts = query
    .split(",")
    .map((part) => part.trim())
    .filter(Boolean);

  return {
    name: parts[0] || "Unknown",
    country: parts.slice(1).join(", "),
    countryCode: "",
    lat: 0,
    lng: 0,
  };
}

export async function searchLocations(query: string): Promise<Location[]> {
  const trimmed = query.trim();
  if (trimmed.length < 2) return [];

  const specials = specialLocations(trimmed);

  if (/^(remote|hybrid|onsite)$/i.test(trimmed)) {
    return specials;
  }

  try {
    const response = await fetch(
      `https://secure.geonames.org/searchJSON?q=${encodeURIComponent(trimmed)}&maxRows=8&username=debjitpramanick1`,
    );
    const data = (await response.json()) as { geonames?: GeoName[] };
    const matches = (data.geonames ?? [])
      .filter((place) => Boolean(place.name))
      .map(sanitizeLocation);

    return dedupeLocations([...specials, ...matches]);
  } catch {
    return specials;
  }
}

export async function fetchLocation(query: string): Promise<Location> {
  const results = await searchLocations(query);
  return results[0] ?? locationFromLabel(query.trim() || "Unknown");
}

function specialLocations(query: string): Location[] {
  const trimmed = query.trim().toLowerCase();
  return (["Remote", "Hybrid", "Onsite"] as const)
    .filter(
      (label) =>
        label.toLowerCase() === trimmed ||
        label.toLowerCase().startsWith(trimmed),
    )
    .map((label) => locationFromLabel(label));
}

function dedupeLocations(locations: Location[]): Location[] {
  const seen = new Set<string>();
  return locations.filter((location) => {
    const key = `${location.name}|${location.country}|${location.lat}|${location.lng}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

function sanitizeLocation(location: GeoName): Location {
  return {
    name: location.name ?? "",
    country: location.countryName ?? "",
    countryCode: location.countryCode ?? "",
    lat: Number(location.lat) || 0,
    lng: Number(location.lng) || 0,
  };
}
