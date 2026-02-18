import { useEffect, useState } from 'react';
import { useBookmarks } from '../hooks/useBookmarks.js';
import { useTags } from '../hooks/useTags.js';
import Modal from '../components/Modal.jsx';
import BookmarkForm from '../components/BookmarkForm.jsx';
import BookmarkList from '../components/BookmarkList.jsx';
import TagFilter from '../components/TagFilter.jsx';
import SearchBar from '../components/SearchBar.jsx';
import EmptyState from '../components/EmptyState.jsx';
import ErrorMessage from '../components/ErrorMessage.jsx';
import LoadingSpinner from '../components/LoadingSpinner.jsx';

function HomePage() {
  const {
    bookmarks,
    loading: bookmarksLoading,
    error: bookmarksError,
    filters,
    addBookmark,
    editBookmark,
    removeBookmark,
    toggleRead,
    setFilter
  } = useBookmarks();

  const {
    tags,
    loading: tagsLoading,
    error: tagsError,
    fetchTags
  } = useTags();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingBookmark, setEditingBookmark] = useState(null);
  const [searchInput, setSearchInput] = useState(filters.search || '');

  useEffect(() => {
    setSearchInput(filters.search || '');
  }, [filters.search]);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      setFilter('search', searchInput);
    }, 300);

    return () => {
      clearTimeout(timeoutId);
    };
  }, [searchInput, setFilter]);

  const openCreateModal = () => {
    setEditingBookmark(null);
    setIsModalOpen(true);
  };

  const openEditModal = (bookmark) => {
    setEditingBookmark(bookmark);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingBookmark(null);
  };

  const handleSubmitBookmark = async (payload) => {
    if (editingBookmark) {
      await editBookmark(editingBookmark.id, payload);
    } else {
      await addBookmark(payload);
    }
    await fetchTags();
    closeModal();
  };

  const handleToggleRead = async (id) => {
    await toggleRead(id);
    await fetchTags();
  };

  const handleDeleteBookmark = async (id) => {
    await removeBookmark(id);
    await fetchTags();
  };

  const hasBookmarks = bookmarks.length > 0;
  const isLoading = bookmarksLoading || tagsLoading;

  return (
    <div className="mx-auto flex min-h-screen max-w-6xl flex-col px-4 py-6 md:px-6 lg:px-8">
      <header className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Bookmarks</h1>
          <p className="text-sm text-gray-500">
            Save, organize, and revisit your favorite links.
          </p>
        </div>
        <button
          type="button"
          onClick={openCreateModal}
          className="inline-flex items-center rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm transition-colors hover:bg-blue-700"
        >
          <span className="mr-2 text-lg leading-none">+</span>
          Add Bookmark
        </button>
      </header>

      <div className="flex flex-1 gap-6">
        <TagFilter
          tags={tags}
          activeTag={filters.tag}
          onSelectTag={(tag) => setFilter('tag', tag)}
        />

        <main className="flex-1 space-y-4">
          <SearchBar
            searchTerm={searchInput}
            onSearchChange={setSearchInput}
            isReadFilter={filters.isRead}
            onReadFilterChange={(value) => setFilter('isRead', value)}
          />

          <ErrorMessage message={bookmarksError || tagsError} />

          {isLoading && <LoadingSpinner />}

          {!isLoading && !hasBookmarks && <EmptyState />}

          {!isLoading && hasBookmarks && (
            <BookmarkList
              bookmarks={bookmarks}
              onToggleRead={handleToggleRead}
              onEdit={openEditModal}
              onDelete={handleDeleteBookmark}
            />
          )}
        </main>
      </div>

      <Modal
        isOpen={isModalOpen}
        onClose={closeModal}
        title={editingBookmark ? 'Edit bookmark' : 'Add bookmark'}
      >
        <BookmarkForm
          mode={editingBookmark ? 'edit' : 'create'}
          initialValues={editingBookmark}
          onSubmit={handleSubmitBookmark}
        />
      </Modal>
    </div>
  );
}

export default HomePage;

