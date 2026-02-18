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

export const getTags = async () => {
  try {
    const response = await apiClient.get('/api/tags');
    return handleResponse(response, 'Failed to load tags.');
  } catch (error) {
    throw extractErrorMessage(error);
  }
};

export const deleteTag = async (id) => {
  try {
    const response = await apiClient.delete(`/api/tags/${id}`);
    return handleResponse(response, 'Failed to delete tag.');
  } catch (error) {
    throw extractErrorMessage(error);
  }
};

