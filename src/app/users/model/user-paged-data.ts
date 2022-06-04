import { Page } from './page';

/**
 * An array of data with an associated page object used for paging
 */
export class PagedData<T> {
  data = new Array<T>();
  page = new Page();
}

export class UserPagedData<T> {
  users = new Array<T>();
  totalElements = 0;
  totalPages = 0;
  lastPage = 0;
  size = 0;
  page = 0;
}
