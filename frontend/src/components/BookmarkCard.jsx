import { useState } from 'react';

const formatDate = (value) => {
  if (!value) return '';
  try {
    const date = new Date(value);
    return date.toLocaleDateString(undefined, {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  } catch {
    return '';
  }
};

function BookmarkCard({ bookmark, onToggleRead, onEdit, onDelete }) {
  const [confirmDelete, setConfirmDelete] = useState(false);

  const handleDeleteClick = () => {
    setConfirmDelete(true);
  };

  const handleConfirmDelete = () => {
    onDelete(bookmark.id);
    setConfirmDelete(false);
  };

  const handleCancelDelete = () => {
    setConfirmDelete(false);
  };

  const readBadgeClasses = bookmark.is_read
    ? 'bg-green-100 text-green-700'
    : 'bg-gray-100 text-gray-500';

  return (
    <div className="flex h-full flex-col rounded-xl bg-white p-4 shadow-sm transition-shadow hover:shadow-md">
      <div className="mb-2 flex items-start justify-between gap-2">
        <div className="min-w-0 flex-1">
          <h3 className="truncate text-sm font-semibold text-gray-900">
            {bookmark.title}
          </h3>
          <a
            href={bookmark.url}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-1 block truncate text-xs text-blue-600 hover:underline"
          >
            {bookmark.url}
          </a>
        </div>
        <span
          className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-medium ${readBadgeClasses}`}
        >
          {bookmark.is_read ? 'Read' : 'Unread'}
        </span>
      </div>

      {bookmark.tags?.length > 0 && (
        <div className="mb-2 flex flex-wrap gap-1">
          {bookmark.tags.map((tag) => (
            <span
              key={tag.id}
              className="rounded-full bg-blue-100 px-2 py-0.5 text-[10px] font-medium text-blue-700"
            >
              {tag.name}
            </span>
          ))}
        </div>
      )}

      {bookmark.notes && (
        <p className="mb-3 line-clamp-3 text-xs text-gray-600">{bookmark.notes}</p>
      )}

      <div className="mt-auto flex items-center justify-between pt-2 text-xs text-gray-400">
        <span>{formatDate(bookmark.created_at)}</span>
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => onToggleRead(bookmark.id)}
            className="rounded-lg bg-gray-100 px-2 py-1 text-[11px] font-medium text-gray-700 hover:bg-gray-200"
          >
            {bookmark.is_read ? 'Mark Unread' : 'Mark Read'}
          </button>
          <button
            type="button"
            onClick={() => onEdit(bookmark)}
            className="rounded-lg bg-white px-2 py-1 text-[11px] font-medium text-gray-700 ring-1 ring-gray-200 hover:bg-gray-50"
          >
            Edit
          </button>
          {!confirmDelete && (
            <button
              type="button"
              onClick={handleDeleteClick}
              className="rounded-lg bg-white px-2 py-1 text-[11px] font-medium text-red-600 ring-1 ring-red-200 hover:bg-red-50"
            >
              Delete
            </button>
          )}
        </div>
      </div>

      {confirmDelete && (
        <div className="mt-3 rounded-lg bg-red-50 p-2 text-[11px] text-red-700">
          <p className="mb-2">Are you sure you want to delete this bookmark?</p>
          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={handleConfirmDelete}
              className="rounded-lg bg-red-500 px-2 py-1 text-xs font-medium text-white hover:bg-red-600"
            >
              Yes, delete
            </button>
            <button
              type="button"
              onClick={handleCancelDelete}
              className="rounded-lg bg-white px-2 py-1 text-xs font-medium text-gray-700 ring-1 ring-gray-200 hover:bg-gray-50"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default BookmarkCard;

