export interface GetFavoritesRequest {
  page?: number;
  pageSize?: number;
  search?: string;
}

export interface FavoriteFilters {
  search?: string;
}
