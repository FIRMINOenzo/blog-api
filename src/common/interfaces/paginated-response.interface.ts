export interface PaginatedResponse<T> {
  data: T[];
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
  };
}

export class PaginationMeta {
  constructor(
    public page: number,
    public limit: number,
    public total: number,
  ) {}

  get totalPages(): number {
    return Math.ceil(this.total / this.limit);
  }

  get hasNextPage(): boolean {
    return this.page < this.totalPages;
  }

  get hasPreviousPage(): boolean {
    return this.page > 1;
  }

  toJSON() {
    return {
      page: this.page,
      limit: this.limit,
      total: this.total,
      totalPages: this.totalPages,
      hasNextPage: this.hasNextPage,
      hasPreviousPage: this.hasPreviousPage,
    };
  }
}
