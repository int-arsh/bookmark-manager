function SearchBar({ searchTerm, onSearchChange, isReadFilter, onReadFilterChange }) {
  const makeStatusButtonClass = (status) => {
    const isActive = isReadFilter === status;
    const base =
      'rounded-full px-3 py-1 text-xs font-medium border transition-colors';
    if (isActive) {
      return `${base} border-blue-600 bg-blue-600 text-white`;
    }
    return `${base} border-gray-200 bg-white text-gray-600 hover:bg-gray-50`;
  };

  return (
    <div className="flex flex-col gap-3 rounded-xl bg-white p-4 shadow-sm md:flex-row md:items-center md:justify-between">
      <div className="flex-1">
        <label className="sr-only" htmlFor="search">
          Search bookmarks
        </label>
        <div className="relative">
          <span className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-gray-400">
            <svg
              className="h-4 w-4"
              viewBox="0 0 20 20"
              fill="none"
              aria-hidden="true"
            >
              <path
                d="M9 4a5 5 0 100 10A5 5 0 009 4z"
                stroke="currentColor"
                strokeWidth="1.5"
              />
              <path
                d="M13.5 13.5L16 16"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
              />
            </svg>
          </span>
          <input
            id="search"
            type="text"
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search bookmarks by title..."
            className="w-full rounded-lg border border-gray-200 bg-gray-50 py-2 pl-9 pr-3 text-sm text-gray-900 placeholder:text-gray-400 focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
        </div>
      </div>

      <div className="flex items-center gap-2">
        <span className="text-xs font-medium text-gray-500">Filter:</span>
        <button
          type="button"
          className={makeStatusButtonClass('all')}
          onClick={() => onReadFilterChange('all')}
        >
          All
        </button>
        <button
          type="button"
          className={makeStatusButtonClass('unread')}
          onClick={() => onReadFilterChange('unread')}
        >
          Unread
        </button>
        <button
          type="button"
          className={makeStatusButtonClass('read')}
          onClick={() => onReadFilterChange('read')}
        >
          Read
        </button>
      </div>
    </div>
  );
}

export default SearchBar;

