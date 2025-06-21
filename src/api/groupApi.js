import axiosInstance from "../utils/axiosConfig";

const groupApi = {
  // Get all groups
  getAllGroups: async () => {
    try {
      const response = await axiosInstance.get("/groups");
      return response.data;
    } catch (error) {
      console.error("Error fetching groups:", error);
      throw error;
    }
  },

  // Get a specific group by ID
  getGroupById: async (groupId) => {
    try {
      const response = await axiosInstance.get(`/groups/${groupId}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching group with ID ${groupId}:`, error);
      throw error;
    }
  },

  // Get groups for a specific user
  getGroupsByUserId: async (userId) => {
    try {
      const response = await axiosInstance.get(`/groups/user/${userId}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching groups for user ${userId}:`, error);
      throw error;
    }
  },

  // Get groups for the current logged in user
  getMyGroups: async () => {
    try {
      const userId = localStorage.getItem("userId");
      const response = await axiosInstance.get(`/groups/user/${userId}`);
      return response.data;
    } catch (error) {
      console.error("Error fetching my groups:", error);
      throw error;
    }
  },

  // Create a new group
  createGroup: async (groupData) => {
    try {
      const response = await axiosInstance.post("/groups", groupData);
      return response.data;
    } catch (error) {
      console.error("Error creating group:", error);
      throw error;
    }
  },

  // Update an existing group
  updateGroup: async (groupId, groupData) => {
    try {
      const response = await axiosInstance.put(`/groups/${groupId}`, groupData);
      return response.data;
    } catch (error) {
      console.error(`Error updating group with ID ${groupId}:`, error);
      throw error;
    }
  },

  // Delete a group
  deleteGroup: async (groupId) => {
    try {
      const response = await axiosInstance.delete(`/groups/${groupId}`);
      return response.status === 204;
    } catch (error) {
      console.error(`Error deleting group with ID ${groupId}:`, error);
      throw error;
    }
  },

  // Add a single user to a group
  addUserToGroup: async (groupId, userId) => {
    try {
      const response = await axiosInstance.post(
        `/groups/${groupId}/members/${userId}`
      );
      return response.data;
    } catch (error) {
      console.error(`Error adding user ${userId} to group ${groupId}:`, error);
      throw error;
    }
  },

  // Add the current user to a group
  joinGroup: async (groupId) => {
    try {
      const userId = localStorage.getItem("userId");
      const response = await axiosInstance.post(
        `/groups/${groupId}/members/${userId}`
      );
      return response.data;
    } catch (error) {
      console.error(`Error joining group ${groupId}:`, error);
      throw error;
    }
  },

  // Add multiple users to a group
  addUsersToGroup: async (groupId, userIds) => {
    try {
      const response = await axiosInstance.post(`/groups/${groupId}/members`, {
        userIds: userIds,
      });
      return response.data;
    } catch (error) {
      console.error(`Error adding users to group ${groupId}:`, error);
      throw error;
    }
  },

  // Remove a user from a group
  removeUserFromGroup: async (groupId, userId) => {
    try {
      const response = await axiosInstance.delete(
        `/groups/${groupId}/members/${userId}`
      );
      return response.data;
    } catch (error) {
      console.error(
        `Error removing user ${userId} from group ${groupId}:`,
        error
      );
      throw error;
    }
  },

  // Remove the current user from a group (leave group)
  leaveGroup: async (groupId) => {
    try {
      const userId = localStorage.getItem("userId");
      const response = await axiosInstance.delete(
        `/groups/${groupId}/members/${userId}`
      );
      return response.data;
    } catch (error) {
      console.error(`Error leaving group ${groupId}:`, error);
      throw error;
    }
  },
};

export default groupApi;
