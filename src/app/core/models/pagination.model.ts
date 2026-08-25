export interface PagedResult<T> {
  Page: number;
  PageSize: number;
  Total: number;
  Items: T[];
}
