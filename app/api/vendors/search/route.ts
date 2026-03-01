import { NextRequest, NextResponse } from "next/server";
import { searchVendorsByLocation } from "@/lib/googlePlaces";

export async function POST(req: NextRequest) {
    try {
        const body = await req.json() as { category?: string; country?: string; state?: string; city?: string };
        const { category, country, state, city } = body;

        if (!category?.trim()) {
            return NextResponse.json(
                { error: "Category is required." },
                { status: 400 },
            );
        }

        if (!country?.trim() || !state?.trim()) {
            return NextResponse.json(
                { error: "Country and state are required. City is optional." },
                { status: 400 },
            );
        }

        if (!process.env.GOOGLE_PLACES_API_KEY) {
            return NextResponse.json(
                { error: "GOOGLE_PLACES_API_KEY is not configured." },
                { status: 500 },
            );
        }

        const locationQuery = city?.trim()
            ? `${city.trim()}, ${state.trim()}, ${country.trim()}`
            : `${state.trim()}, ${country.trim()}`;

        const query = category.trim();

        // Re-use our existing Google Places search utility
        const places = await searchVendorsByLocation(query, locationQuery);

        return NextResponse.json({ places });
    } catch (err) {
        const message = err instanceof Error ? err.message : "Vendor search failed.";
        console.error("[vendors/search] error:", message);
        return NextResponse.json({ error: message }, { status: 500 });
    }
}
