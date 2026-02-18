import { useState } from 'react';
import {
  parseTagsInput,
  validateBookmarkInputs
} from '../utils/validators.js';
import ErrorMessage from './ErrorMessage.jsx';

function BookmarkForm({ initialValues, mode = 'create', onSubmit }) {
  const [url, setUrl] = useState(initialValues?.url || '');
  const [title, setTitle] = useState(initialValues?.title || '');
  const [notes, setNotes] = useState(initialValues?.notes || '');
  const [tagsInput, setTagsInput] = useState(
    initialValues?.tags?.map((t) => t.name).join(', ') || ''
  );
  const [errors, setErrors] = useState({});
  const [submitError, setSubmitError] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSubmitError(null);

    const trimmedValues = {
      url: url.trim(),
      title: title.trim()
    };
    const validationErrors = validateBookmarkInputs(trimmedValues);
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setErrors({});
    setSubmitting(true);

    const tags = parseTagsInput(tagsInput);
    const payload = {
      url: trimmedValues.url,
      title: trimmedValues.title,
      notes: notes.trim() || undefined,
      tags
    };

    try {
      await onSubmit(payload);
      if (mode === 'create') {
        setUrl('');
        setTitle('');
        setNotes('');
        setTagsInput('');
      }
    } catch (err) {
      const message =
        typeof err === 'string' ? err : err?.message || 'Failed to save bookmark.';
      setSubmitError(message);
    } finally {
      setSubmitting(false);
    }
  };

  const buttonLabel = mode === 'edit' ? 'Save changes' : 'Add bookmark';

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <ErrorMessage message={submitError} />

      <div className="space-y-1">
        <label
          htmlFor="url"
          className="block text-sm font-medium text-gray-700"
        >
          URL
        </label>
        <input
          id="url"
          type="url"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          className={`w-full rounded-lg border px-3 py-2 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-1 ${
            errors.url
              ? 'border-red-400 focus:border-red-500 focus:ring-red-500'
              : 'border-gray-200 focus:border-blue-500 focus:ring-blue-500'
          }`}
          placeholder="https://example.com"
        />
        {errors.url && (
          <p className="text-xs text-red-600">{errors.url}</p>
        )}
      </div>

      <div className="space-y-1">
        <label
          htmlFor="title"
          className="block text-sm font-medium text-gray-700"
        >
          Title
        </label>
        <input
          id="title"
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className={`w-full rounded-lg border px-3 py-2 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-1 ${
            errors.title
              ? 'border-red-400 focus:border-red-500 focus:ring-red-500'
              : 'border-gray-200 focus:border-blue-500 focus:ring-blue-500'
          }`}
          placeholder="Bookmark title"
        />
        {errors.title && (
          <p className="text-xs text-red-600">{errors.title}</p>
        )}
      </div>

      <div className="space-y-1">
        <label
          htmlFor="notes"
          className="block text-sm font-medium text-gray-700"
        >
          Notes
        </label>
        <textarea
          id="notes"
          rows={3}
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-900 placeholder:text-gray-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          placeholder="Optional notes about this bookmark"
        />
      </div>

      <div className="space-y-1">
        <label
          htmlFor="tags"
          className="block text-sm font-medium text-gray-700"
        >
          Tags
          <span className="ml-1 text-xs font-normal text-gray-400">
            (comma-separated)
          </span>
        </label>
        <input
          id="tags"
          type="text"
          value={tagsInput}
          onChange={(e) => setTagsInput(e.target.value)}
          className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-900 placeholder:text-gray-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          placeholder="react, design, tools"
        />
      </div>

      <div className="flex justify-end gap-2 pt-2">
        <button
          type="submit"
          disabled={submitting}
          className="inline-flex items-center rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-blue-400"
        >
          {submitting ? 'Saving...' : buttonLabel}
        </button>
      </div>
    </form>
  );
}

export default BookmarkForm;

