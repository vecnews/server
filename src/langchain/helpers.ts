import { getJson } from "serpapi";

export const searchForImage = async (query: string) => {
  const result = await getJson({
    api_key: process.env.SERPAPI_API_KEY,
    engine: "google_images",
    q: query,
    google_domain: "google.com",
    hl: "en",
    gl: "us",
  })

  return result.images_results?.[0]?.original || null;
}