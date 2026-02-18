import { useCallback, useEffect, useState } from 'react';
import { getTags, deleteTag } from '../api/tags.js';

export const useTags = () => {
  const [tags, setTags] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchTags = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getTags();
      setTags(Array.isArray(data) ? data : []);
    } catch (err) {
      const message =
        typeof err === 'string' ? err : err?.message || 'Failed to load tags.';
      setError(message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTags();
  }, [fetchTags]);

  const removeTag = async (id) => {
    setLoading(true);
    setError(null);
    try {
      await deleteTag(id);
      await fetchTags();
    } catch (err) {
      const message =
        typeof err === 'string' ? err : err?.message || 'Failed to delete tag.';
      setError(message);
      throw message;
    } finally {
      setLoading(false);
    }
  };

  return {
    tags,
    loading,
    error,
    fetchTags,
    removeTag
  };
};

