export const isValidUrl = (value) => {
  if (!value) return false;
  try {
    const url = new URL(value.trim());
    return url.protocol === 'http:' || url.protocol === 'https:';
  } catch {
    return false;
  }
};

export const parseTagsInput = (value) => {
  if (!value) return [];
  return value
    .split(',')
    .map((t) => t.trim())
    .filter((t) => t.length > 0);
};

export const validateBookmarkInputs = ({ url, title }) => {
  const errors = {};
  const trimmedTitle = (title || '').trim();

  if (!url || !isValidUrl(url)) {
    errors.url = 'Please enter a valid http or https URL.';
  }

  if (!trimmedTitle) {
    errors.title = 'Title is required.';
  } else if (trimmedTitle.length > 200) {
    errors.title = 'Title must be at most 200 characters.';
  }

  return errors;
};

