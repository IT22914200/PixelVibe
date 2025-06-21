import axiosInstance from "../utils/axiosConfig";

const groupPostApi = {
  // Get all group posts
  getAllGroupPosts: async () => {
    try {
      const response = await axiosInstance.get("/group-posts");
      return response.data;
    } catch (error) {
      console.error("Error fetching group posts:", error);
      throw error;
    }
  },

  // Get a specific group post by ID
  getGroupPostById: async (postId) => {
    try {
      const response = await axiosInstance.get(`/group-posts/${postId}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching group post with ID ${postId}:`, error);
      throw error;
    }
  },

  // Get posts by group ID
  getPostsByGroupId: async (groupId) => {
    try {
      const response = await axiosInstance.get(`/group-posts/group/${groupId}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching posts for group ${groupId}:`, error);
      throw error;
    }
  },

  // Get posts by user ID
  getPostsByUserId: async (userId) => {
    try {
      const response = await axiosInstance.get(`/group-posts/user/${userId}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching posts for user ${userId}:`, error);
      throw error;
    }
  },

  // Get posts for the current logged in user
  getMyGroupPosts: async () => {
    try {
      const userId = localStorage.getItem("userId");
      const response = await axiosInstance.get(`/group-posts/user/${userId}`);
      return response.data;
    } catch (error) {
      console.error("Error fetching my group posts:", error);
      throw error;
    }
  },

  // Create a new group post
  createGroupPost: async (postData) => {
    try {
      // Configure headers to include user ID
      const config = {
        headers: {
          "User-ID": localStorage.getItem("userId"),
        },
      };
      const response = await axiosInstance.post(
        "/group-posts",
        postData,
        config
      );
      return response.data;
    } catch (error) {
      console.error("Error creating group post:", error);
      throw error;
    }
  },

  // Update an existing group post
  updateGroupPost: async (postId, postData) => {
    try {
      // Configure headers to include user ID
      const config = {
        headers: {
          "User-ID": localStorage.getItem("userId"),
        },
      };
      const response = await axiosInstance.put(
        `/group-posts/${postId}`,
        postData,
        config
      );
      return response.data;
    } catch (error) {
      console.error(`Error updating group post ${postId}:`, error);
      throw error;
    }
  },

  // Delete a group post
  deleteGroupPost: async (postId) => {
    try {
      // Configure headers to include user ID
      const config = {
        headers: {
          "User-ID": localStorage.getItem("userId"),
        },
      };
      const response = await axiosInstance.delete(
        `/group-posts/${postId}`,
        config
      );
      return response.status === 204;
    } catch (error) {
      console.error(`Error deleting group post ${postId}:`, error);
      throw error;
    }
  },
};

export default groupPostApi;
