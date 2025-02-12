import axiosWithToken from "./axiosWithToken";

export const addMouvementStockRequest = async (mouvementStockData) => {
  try {
    const response = await axiosWithToken.post(
      "/mouvementstock/add-mouvementstock",
      mouvementStockData
    );
    // console.log('Body Request' , mouvementStockData) ;
    return response.data;
  } catch (error) {
    console.error("Error adding produit fini:", error);
    throw error;
  }
};

export const updateMouvementStockRequest = async (
  id,
  updateMatierePremiere
) => {
  try {
    const response = await axiosWithToken.put(
      `/mouvementstock/update-mouvementstock/${id}`,
      updateMouvementStock
    );
    // console.log("Updated produit fini:", response.data);
    return response.data;
  } catch (error) {
    console.error("Error updating produit fini:", error);
    throw error;
  }
};

export const deleteMouvementStockRequest = async (id) => {
  try {
    const response = await axiosWithToken.delete(
      `/mouvementstock/remove-mouvementstock/${id}`
    );
    return response.data;
  } catch (error) {
    console.error("Error deleting produit fini:", error);
    throw error;
  }
};
