import { useCallback, useEffect, useState } from 'react';
import {
  getBookmarks,
  createBookmark,
  updateBookmark,
  deleteBookmark,
  toggleRead as apiToggleRead
} from '../api/bookmarks.js';

const initialFilters = {
  tag: null,
  search: '',
  isRead: 'all' // 'all' | 'read' | 'unread'
};

export const useBookmarks = () => {
  const [bookmarks, setBookmarks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState(initialFilters);

  const fetchBookmarks = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = {};
      if (filters.tag) {
        params.tag = filters.tag;
      }
      if (filters.search) {
        params.search = filters.search;
      }
      if (filters.isRead === 'read') {
        params.is_read = true;
      } else if (filters.isRead === 'unread') {
        params.is_read = false;
      }
      const data = await getBookmarks(params);
      setBookmarks(Array.isArray(data) ? data : []);
    } catch (err) {
      const message =
        typeof err === 'string' ? err : err?.message || 'Failed to load bookmarks.';
      setError(message);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    fetchBookmarks();
  }, [fetchBookmarks]);

  const setFilter = useCallback((key, value) => {
    setFilters((prev) => ({
      ...prev,
      [key]: value
    }));
  }, []);

  const addBookmark = async (payload) => {
    setLoading(true);
    setError(null);
    try {
      const created = await createBookmark(payload);
      await fetchBookmarks();
      return created;
    } catch (err) {
      const message =
        typeof err === 'string' ? err : err?.message || 'Failed to create bookmark.';
      setError(message);
      throw message;
    } finally {
      setLoading(false);
    }
  };

  const editBookmark = async (id, payload) => {
    setLoading(true);
    setError(null);
    try {
      const updated = await updateBookmark(id, payload);
      await fetchBookmarks();
      return updated;
    } catch (err) {
      const message =
        typeof err === 'string' ? err : err?.message || 'Failed to update bookmark.';
      setError(message);
      throw message;
    } finally {
      setLoading(false);
    }
  };

  const removeBookmark = async (id) => {
    setLoading(true);
    setError(null);
    try {
      await deleteBookmark(id);
      await fetchBookmarks();
    } catch (err) {
      const message =
        typeof err === 'string' ? err : err?.message || 'Failed to delete bookmark.';
      setError(message);
      throw message;
    } finally {
      setLoading(false);
    }
  };

  const toggleRead = async (id) => {
    setLoading(true);
    setError(null);
    try {
      const updated = await apiToggleRead(id);
      await fetchBookmarks();
      return updated;
    } catch (err) {
      const message =
        typeof err === 'string' ? err : err?.message || 'Failed to toggle read status.';
      setError(message);
      throw message;
    } finally {
      setLoading(false);
    }
  };

  return {
    bookmarks,
    loading,
    error,
    filters,
    fetchBookmarks,
    addBookmark,
    editBookmark,
    removeBookmark,
    toggleRead,
    setFilter
  };
};

