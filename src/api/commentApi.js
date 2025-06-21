import axiosInstance from '../utils/axiosConfig';

const commentApi = {
  // Get all comments
  getAllComments: async () => {
    try {
      const response = await axiosInstance.get('/comments');
      return response.data;
    } catch (error) {
      console.error('Error fetching comments:', error);
      throw error;
    }
  },

  // Get comments by post ID
  getCommentsByPost: async (postId) => {
    try {
      const response = await axiosInstance.get(`/comments/post/${postId}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching comments for post ${postId}:`, error);
      throw error;
    }
  },

  // Get comment by ID
  getCommentById: async (id) => {
    try {
      const response = await axiosInstance.get(`/comments/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching comment with ID ${id}:`, error);
      throw error;
    }
  },

  // Create comment
  createComment: async (postId, commentText) => {
    try {
      const response = await axiosInstance.post(`/comments/post/${postId}`, { 
        comment: commentText,
        commentedBy:localStorage.getItem("userId"), 
        deleteStatus:false,
        commentedOn: postId,
        commentedAt : new Date(),
      });
      return response.data;
    } catch (error) {
      console.error(`Error creating comment for post ${postId}:`, error);
      throw error;
    }
  },

  // Update comment
  updateComment: async (id, newCommentText) => {
    try {
      const response = await axiosInstance.put(`/comments/${id}`, newCommentText, {
        headers: {
          'Content-Type': 'text/plain',
        },
      });
      return response.data;
    } catch (error) {
      console.error(`Error updating comment with ID ${id}:`, error);
      throw error;
    }
  },
  

  // Delete comment
  deleteComment: async (id) => {
    try {
      const response = await axiosInstance.delete(`/comments/${id}`);
      return response.status === 204;
    } catch (error) {
      console.error(`Error deleting comment with ID ${id}:`, error);
      throw error;
    }
  }
};

export default commentApi;