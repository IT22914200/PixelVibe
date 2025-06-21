import axiosInstance from '../utils/axiosConfig';

const progressUpdateApi = {
  // Get all progress updates
  getAllProgressUpdates: async () => {
    try {
      const response = await axiosInstance.get('/progress');
      return response.data;
    } catch (error) {
      console.error('Error fetching progress updates:', error);
      throw error;
    }
  },

  // Get progress update by ID
  getProgressUpdateById: async (id) => {
    try {
      const response = await axiosInstance.get(`/progress/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching progress update with ID ${id}:`, error);
      throw error;
    }
  },

  // Create a new progress update
  createProgressUpdate: async (data) => {
    try {
      const response = await axiosInstance.post('/progress', {
        ...data,
        user: { id: localStorage.getItem("userId") },
      });
      return response.data;
    } catch (error) {
      console.error('Error creating progress update:', error);
      throw error;
    }
  },

  // Update a progress update
  updateProgressUpdate: async (id, updatedProgress) => {
    try {
      const response = await axiosInstance.put(`/progress/${id}`, updatedProgress);
      return response.data;
    } catch (error) {
      console.error(`Error updating progress update with ID ${id}:`, error);
      throw error;
    }
  },

  // Delete a progress update
  deleteProgressUpdate: async (id) => {
    try {
      const response = await axiosInstance.delete(`/progress/${id}`);
      return response.status === 204;
    } catch (error) {
      console.error(`Error deleting progress update with ID ${id}:`, error);
      throw error;
    }
  },

  // Get all progress updates for a user
  getProgressUpdatesByUserId: async (userId) => {
    try {
      const response = await axiosInstance.get(`/progress/user/${userId}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching progress updates for user ${userId}:`, error);
      throw error;
    }
  },
};

export default progressUpdateApi;