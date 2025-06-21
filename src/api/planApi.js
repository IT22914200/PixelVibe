import axiosInstance from '../utils/axiosConfig';

const learningPlanApi = {
  // Get all learning plans
  getAllLearningPlans: async () => {
    try {
      const response = await axiosInstance.get('/learning-plan');
      return response.data;
    } catch (error) {
      console.error('Error fetching learning plans:', error);
      throw error;
    }
  },

  // Get plan by ID
  getLearningPlanById: async (planId) => {
    try {
      const response = await axiosInstance.get(`/learning-plan/${planId}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching learning plan with ID ${planId}:`, error);
      throw error;
    }
  },

  // Create a new learning plan
  createLearningPlan: async (title, description, timeRequired, type) => {
    try {
      const response = await axiosInstance.post('/learning-plan', {
        title,
        description,
        timeRequired,
        type,
        user: { id: localStorage.getItem("userId") },
      });
      return response.data;
    } catch (error) {
      console.error('Error creating learning plan:', error);
      throw error;
    }
  },

  // Update an existing learning plan
  updateLearningPlan: async (planId, updatedPlan) => {
    try {
      const response = await axiosInstance.put(`/learning-plan/${planId}`, updatedPlan);
      return response.data;
    } catch (error) {
      console.error(`Error updating learning plan with ID ${planId}:`, error);
      throw error;
    }
  },

  // Delete a learning plan
  deleteLearningPlan: async (planId) => {
    try {
      const response = await axiosInstance.delete(`/learning-plan/${planId}`);
      return response.status === 204;
    } catch (error) {
      console.error(`Error deleting learning plan with ID ${planId}:`, error);
      throw error;
    }
  },

  // Get all plans for a user
  getPlansByUserId: async (userId) => {
    try {
      const response = await axiosInstance.get(`/learning-plan/user/${userId}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching learning plans for user ${userId}:`, error);
      throw error;
    }
  },
};

export default learningPlanApi;