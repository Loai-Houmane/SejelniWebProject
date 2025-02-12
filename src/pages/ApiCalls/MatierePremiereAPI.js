import axiosWithToken from "./axiosWithToken";

export const addMatierePremiereRequest = async (matierePremiereData) => {
  try {
    const response = await axiosWithToken.post(
      "/matiere-premiere",
      matierePremiereData
    );
    // console.log("Added matiere :", response.data);
    return response.data;
  } catch (error) {
    console.error("Error adding matiere :", error);
    throw error;
  }
};

export const updateMatierePremiereRequest = async (
  id,
  updateMatierePremiere
) => {
  try {
    const response = await axiosWithToken.put(
      `/matiere-premiere/${id}`,
      updateMatierePremiere
    );
    // console.log("Updated matiere :", response.data);
    return response.data;
  } catch (error) {
    console.error("Error updating matiere :", error);
    throw error;
  }
};
