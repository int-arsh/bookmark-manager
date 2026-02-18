function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-gray-200 bg-white px-6 py-12 text-center">
      <svg
        className="mb-3 h-10 w-10 text-gray-300"
        viewBox="0 0 24 24"
        fill="none"
        aria-hidden="true"
      >
        <rect
          x="4"
          y="5"
          width="16"
          height="14"
          rx="2"
          className="stroke-current"
          strokeWidth="1.5"
        />
        <path
          d="M8 9h8M8 13h5"
          className="stroke-current"
          strokeWidth="1.5"
          strokeLinecap="round"
        />
      </svg>
      <h2 className="mb-1 text-lg font-semibold text-gray-800">No bookmarks found</h2>
      <p className="text-sm text-gray-500">
        Add a new bookmark or adjust your filters to see results here.
      </p>
    </div>
  );
}

export default EmptyState;

