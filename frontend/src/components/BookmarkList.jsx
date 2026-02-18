import BookmarkCard from './BookmarkCard.jsx';

function BookmarkList({ bookmarks, onToggleRead, onEdit, onDelete }) {
  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
      {bookmarks.map((bookmark) => (
        <BookmarkCard
          key={bookmark.id}
          bookmark={bookmark}
          onToggleRead={onToggleRead}
          onEdit={onEdit}
          onDelete={onDelete}
        />
      ))}
    </div>
  );
}

export default BookmarkList;

