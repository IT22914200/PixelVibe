import axiosInstance from '../utils/axiosConfig';

const feedbackApi = {
  // Get all feedbacks
  getAllFeedbacks: async () => {
    try {
      const response = await axiosInstance.get('/feedback');
      return response.data;
    } catch (error) {
      console.error('Error fetching feedbacks:', error);
      throw error;
    }
  },

  // Get feedback by ID
  getFeedbackById: async (id) => {
    try {
      const response = await axiosInstance.get(`/feedback/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching feedback with ID ${id}:`, error);
      throw error;
    }
  },

  // Create new feedback
  createFeedback: async (comment) => {
    try {
      const response = await axiosInstance.post('/feedback', comment);
      return response.data;
    } catch (error) {
      console.error('Error creating feedback:', error);
      throw error;
    }
  },

  // Update existing feedback
  updateFeedback: async (id, updatedFeedback) => {
    try {
      const response = await axiosInstance.put(`/feedback/${id}`, updatedFeedback);
      return response.data;
    } catch (error) {
      console.error(`Error updating feedback with ID ${id}:`, error);
      throw error;
    }
  },

  // Delete feedback
  deleteFeedback: async (id) => {
    try {
      const response = await axiosInstance.delete(`/feedback/${id}`);
      return response.status === 204;
    } catch (error) {
      console.error(`Error deleting feedback with ID ${id}:`, error);
      throw error;
    }
  },
};

export default feedbackApi;