type GeneratePaginationMetaParams = {
  currentPage: number;
  total: number;
  perPage?: number;
};

export function generatePaginationMeta({
  currentPage,
  total,
  perPage = 10,
}: GeneratePaginationMetaParams) {
  return {
    pagination: {
      current_page: currentPage,
      per_page: perPage,
      from: (currentPage - 1) * 10 + 1,
      to: total > currentPage * 10 ? currentPage * 10 : total,
      total,
      last_page: Math.ceil(total / 10),
    },
  };
}
