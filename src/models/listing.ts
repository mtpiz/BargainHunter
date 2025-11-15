export type ListingSource = "craigslist";

export interface RawListing {
  id: string;
  title: string;
  url: string;
  price: number | null;
  location?: string;
  postedAt?: string;
  description?: string;
  source: ListingSource;
}
