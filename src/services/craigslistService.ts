import { randomUUID } from "crypto";
import type { SearchParams } from "@/src/models/searchParams";
import type { RawListing } from "@/src/models/listing";

const MOCK_LISTINGS: RawListing[] = [
  {
    id: randomUUID(),
    title: "Sony WH-1000XM4 noise cancelling headphones - like new",
    url: "https://denver.craigslist.org/ele/wh1000xm4",
    price: 180,
    location: "Capitol Hill",
    postedAt: new Date(Date.now() - 1000 * 60 * 60 * 6).toISOString(),
    description: "Barely used Sony WH-1000XM4 headphones with case and cable.",
    source: "craigslist",
  },
  {
    id: randomUUID(),
    title: "iPhone 13 Pro 256GB - excellent condition",
    url: "https://denver.craigslist.org/mob/iphone13pro",
    price: 650,
    location: "Lakewood",
    postedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2).toISOString(),
    description: "Unlocked iPhone 13 Pro, includes box and charger. Battery health 91%.",
    source: "craigslist",
  },
  {
    id: randomUUID(),
    title: "Specialized Rockhopper 29er mountain bike",
    url: "https://denver.craigslist.org/bik/rockhopper",
    price: 525,
    location: "Aurora",
    postedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 7).toISOString(),
    description: "2021 Specialized Rockhopper Comp, recently tuned, minor scratches.",
    source: "craigslist",
  },
  {
    id: randomUUID(),
    title: "LG C1 55\" OLED TV - works great",
    url: "https://denver.craigslist.org/ele/lgc1",
    price: 750,
    location: "Highlands Ranch",
    postedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 20).toISOString(),
    description: "LG C1 55 inch OLED, includes stand and remote. No burn-in.",
    source: "craigslist",
  },
  {
    id: randomUUID(),
    title: "MacBook Air M2 13\" 16GB RAM 512GB SSD",
    url: "https://denver.craigslist.org/sys/mba-m2",
    price: 950,
    location: "Downtown Denver",
    postedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3).toISOString(),
    description: "Apple MacBook Air M2, space gray, lightly used, includes box.",
    source: "craigslist",
  },
  {
    id: randomUUID(),
    title: "Nintendo Switch OLED - bundle with games",
    url: "https://denver.craigslist.org/vgm/switch-oled",
    price: 320,
    location: "Boulder",
    postedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 12).toISOString(),
    description: "Nintendo Switch OLED with 3 games and carrying case.",
    source: "craigslist",
  },
];

export async function searchDenver(params: SearchParams): Promise<RawListing[]> {
  const { minPrice, maxPrice, query } = params;
  const normalizedQuery = query.toLowerCase();

  return MOCK_LISTINGS.filter((listing) => {
    const matchesQuery = listing.title.toLowerCase().includes(normalizedQuery);
    if (!matchesQuery) {
      return false;
    }

    if (typeof minPrice === "number" && (listing.price ?? Number.MAX_SAFE_INTEGER) < minPrice) {
      return false;
    }

    if (typeof maxPrice === "number" && (listing.price ?? 0) > maxPrice) {
      return false;
    }

    return true;
  });
}
