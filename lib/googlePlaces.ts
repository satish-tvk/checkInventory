const BASE = "https://maps.googleapis.com/maps/api/place";
const KEY = process.env.GOOGLE_PLACES_API_KEY ?? "";

export interface PlaceResult {
  place_id: string;
  name: string;
  address: string;
  rating?: number;
  total_ratings?: number;
  types: string[];
  business_status?: string;
  lat: number;
  lng: number;
}

export interface PlaceDetails extends PlaceResult {
  phone?: string;
  website?: string;
  opening_hours?: string[];
  price_level?: number;
  maps_url: string;
}

/** Text search — finds vendors by keyword + location string */
export async function searchVendorsByLocation(
  query: string,
  location: string,
): Promise<PlaceResult[]> {
  const params = new URLSearchParams({
    query: `${query} in ${location}`,
    key: KEY,
    type: "establishment",
  });

  const res = await fetch(`${BASE}/textsearch/json?${params}`);
  if (!res.ok) throw new Error(`Google Places text search failed: ${res.status}`);

  const data = await res.json();
  if (data.status !== "OK" && data.status !== "ZERO_RESULTS") {
    throw new Error(`Google Places error: ${data.status} — ${data.error_message ?? ""}`);
  }

  return (data.results ?? []).slice(0, 10).map((p: Record<string, unknown>) => ({
    place_id: p.place_id as string,
    name: p.name as string,
    address: (p.formatted_address ?? p.vicinity ?? "N/A") as string,
    rating: p.rating as number | undefined,
    total_ratings: p.user_ratings_total as number | undefined,
    types: (p.types ?? []) as string[],
    business_status: p.business_status as string | undefined,
    lat: (p.geometry as Record<string, Record<string, number>>).location.lat,
    lng: (p.geometry as Record<string, Record<string, number>>).location.lng,
  }));
}

/** Place Details — enriches a place_id with phone, website, hours */
export async function getVendorDetails(placeId: string): Promise<PlaceDetails> {
  const params = new URLSearchParams({
    place_id: placeId,
    key: KEY,
    fields: [
      "place_id",
      "name",
      "formatted_address",
      "formatted_phone_number",
      "website",
      "rating",
      "user_ratings_total",
      "business_status",
      "types",
      "geometry",
      "opening_hours",
      "price_level",
      "url",
    ].join(","),
  });

  const res = await fetch(`${BASE}/details/json?${params}`);
  if (!res.ok) throw new Error(`Google Places details failed: ${res.status}`);

  const data = await res.json();
  if (data.status !== "OK") {
    throw new Error(`Google Places details error: ${data.status}`);
  }

  const p = data.result as Record<string, unknown>;
  const geo = p.geometry as Record<string, Record<string, number>>;
  const hours = p.opening_hours as Record<string, string[]> | undefined;

  return {
    place_id: p.place_id as string,
    name: p.name as string,
    address: (p.formatted_address ?? "N/A") as string,
    phone: p.formatted_phone_number as string | undefined,
    website: p.website as string | undefined,
    rating: p.rating as number | undefined,
    total_ratings: p.user_ratings_total as number | undefined,
    types: (p.types ?? []) as string[],
    business_status: p.business_status as string | undefined,
    lat: geo?.location?.lat ?? 0,
    lng: geo?.location?.lng ?? 0,
    opening_hours: hours?.weekday_text,
    price_level: p.price_level as number | undefined,
    maps_url: (p.url ?? `https://www.google.com/maps/place/?q=place_id:${placeId}`) as string,
  };
}
