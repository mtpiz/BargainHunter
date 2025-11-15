export interface SearchParams {
  query: string;
  zipCode: string;
  radiusMiles: number;
  minPrice?: number;
  maxPrice?: number;
  category?: string;
}
