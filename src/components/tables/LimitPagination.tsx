type PaginationProps = {
  currentPage: number;
  totalPages: number;
  limit: number;
  onPaginationChange: (page: number, limit: number) => void;
};

const Pagination: React.FC<PaginationProps> = ({
  currentPage,
  totalPages,
  limit,
  onPaginationChange,
}) => {
  const maxVisible = 3;

  let startPage = currentPage - 1;
  let endPage = currentPage + 1;

  if (startPage < 1) {
    startPage = 1;
    endPage = Math.min(maxVisible, totalPages);
  } else if (endPage > totalPages) {
    endPage = totalPages;
    startPage = Math.max(totalPages - (maxVisible - 1), 1);
  }

  const pagesAroundCurrent = Array.from(
    { length: endPage - startPage + 1 },
    (_, i) => startPage + i
  );

  return (
    <div className="flex w-full justify-between flex-col md:flex-row md:items-center md:justify-between gap-4 mt-4">

      {/* Limit Selector */}
      <div className="flex items-center gap-2 text-sm">
        <span className="text-gray-600 dark:text-gray-400">
          Rows per page:
        </span>
        <select
          value={limit}
          onChange={(e) => {
            onPaginationChange(1, Number(e.target.value)); // reset ke page 1 saat limit berubah
          }}
          className="border border-gray-300 dark:border-gray-700 rounded-lg px-3 py-2 bg-white dark:bg-gray-800 text-sm"
        >
          <option value={10}>10</option>
          <option value={50}>50</option>
          <option value={100}>100</option>
        </select>
      </div>

      {/* Pagination Controls */}
      <div className="flex items-center">
        <button
          onClick={() => {
            if (currentPage > 1) onPaginationChange(currentPage - 1, limit);
          }}
          disabled={currentPage === 1}
          className="mr-2.5 flex items-center h-10 justify-center rounded-lg border border-gray-300 bg-white px-3.5 py-2.5 text-gray-700 shadow-theme-xs hover:bg-gray-50 disabled:opacity-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-white/[0.03] text-sm"
        >
          Previous
        </button>

        <div className="flex items-center gap-2">
          {currentPage > 3 && <span className="px-2">...</span>}

          {pagesAroundCurrent.map((page) => (
            <button
              key={page}
              onClick={() => onPaginationChange(page, limit)}
              className={`flex w-10 h-10 items-center justify-center rounded-lg text-sm font-medium ${
                currentPage === page
                  ? "bg-brand-500 text-white"
                  : "text-gray-700 dark:text-gray-400 hover:bg-blue-500/[0.08] hover:text-brand-500"
              }`}
            >
              {page}
            </button>
          ))}

          {currentPage < totalPages - 2 && <span className="px-2">...</span>}
        </div>

        <button
          onClick={() => {
            if (currentPage < totalPages) onPaginationChange(currentPage + 1, limit);
          }}
          disabled={currentPage === totalPages}
          className="ml-2.5 flex items-center justify-center rounded-lg border border-gray-300 bg-white px-3.5 py-2.5 text-gray-700 shadow-theme-xs text-sm hover:bg-gray-50 h-10 disabled:opacity-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-white/[0.03]"
        >
          Next
        </button>
      </div>
    </div>
  );
};

export default Pagination;
