import axios from 'axios';

const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL
});

const extractErrorMessage = (error) => {
  if (error.response?.data?.error) {
    return error.response.data.error;
  }
  if (typeof error === 'string') {
    return error;
  }
  if (error.message) {
    return error.message;
  }
  return 'Something went wrong. Please try again.';
};

const handleResponse = (response, fallbackMessage) => {
  const { data } = response;
  if (!data.success) {
    throw data.error || fallbackMessage;
  }
  return data.data;
};

export const getBookmarks = async (params = {}) => {
  try {
    const response = await apiClient.get('/api/bookmarks', { params });
    return handleResponse(response, 'Failed to load bookmarks.');
  } catch (error) {
    throw extractErrorMessage(error);
  }
};

export const getBookmark = async (id) => {
  try {
    const response = await apiClient.get(`/api/bookmarks/${id}`);
    return handleResponse(response, 'Failed to load bookmark.');
  } catch (error) {
    throw extractErrorMessage(error);
  }
};

export const createBookmark = async (data) => {
  try {
    const response = await apiClient.post('/api/bookmarks', data);
    return handleResponse(response, 'Failed to create bookmark.');
  } catch (error) {
    throw extractErrorMessage(error);
  }
};

export const updateBookmark = async (id, data) => {
  try {
    const response = await apiClient.put(`/api/bookmarks/${id}`, data);
    return handleResponse(response, 'Failed to update bookmark.');
  } catch (error) {
    throw extractErrorMessage(error);
  }
};

export const deleteBookmark = async (id) => {
  try {
    const response = await apiClient.delete(`/api/bookmarks/${id}`);
    return handleResponse(response, 'Failed to delete bookmark.');
  } catch (error) {
    throw extractErrorMessage(error);
  }
};

export const toggleRead = async (id) => {
  try {
    const response = await apiClient.patch(`/api/bookmarks/${id}/read`);
    return handleResponse(response, 'Failed to toggle read status.');
  } catch (error) {
    throw extractErrorMessage(error);
  }
};

