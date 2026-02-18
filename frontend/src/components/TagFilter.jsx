function TagFilter({ tags, activeTag, onSelectTag }) {
  return (
    <aside className="hidden w-56 shrink-0 md:block">
      <div className="sticky top-6 rounded-xl bg-white p-4 shadow-sm">
        <h2 className="mb-3 text-sm font-semibold text-gray-700">Tags</h2>
        <ul className="space-y-1 text-sm">
          <li>
            <button
              type="button"
              onClick={() => onSelectTag(null)}
              className={`flex w-full items-center justify-between rounded-lg px-3 py-1.5 text-left ${
                !activeTag
                  ? 'bg-blue-50 font-medium text-blue-700'
                  : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              <span>All</span>
            </button>
          </li>
          {tags.map((tag) => (
            <li key={tag.id}>
              <button
                type="button"
                onClick={() => onSelectTag(tag.name)}
                className={`flex w-full items-center justify-between rounded-lg px-3 py-1.5 text-left ${
                  activeTag === tag.name
                    ? 'bg-blue-50 font-medium text-blue-700'
                    : 'text-gray-600 hover:bg-gray-50'
                }`}
              >
                <span>{tag.name}</span>
                <span className="text-xs text-gray-400">{tag.bookmark_count}</span>
              </button>
            </li>
          ))}
        </ul>
      </div>
    </aside>
  );
}

export default TagFilter;

