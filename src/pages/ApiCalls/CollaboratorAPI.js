import axiosWithToken from "./axiosWithToken";

export const addCollaboratorRequest = async (collaboratorData) => {
  try {
    const response = await axiosWithToken.post("/collaborators", collaboratorData);
    return response.data;
  } catch (error) {
    console.error("Error adding collaborator:", error);
    throw error;
  }
};

export const updateCollaboratorRequest = async (id, updateCollaborator) => {
  try {
    const response = await axiosWithToken.put(
      `/collaborators/${id}`,
      updateCollaborator
    );
    console.log("Updated collaborator:", response.data);
    return response.data;
  } catch (error) {
    console.error("Error updating collaborator:", error);
    throw error;
  }
};
