import axiosWithToken from "./axiosWithToken";

export const addCommandeRequest = async (commandeData) => {
  try {
    // console.log("commande data to backend: ", commandeData);
    const response = await axiosWithToken.post("/orders", commandeData);

    return response.data;
  } catch (error) {
    console.error("Error adding produit fini:", error);
    throw error;
  }
};

export const updateCommandeRequest = async (id, updateCommande) => {
  // console.log("object update commande in backend: ", updateCommande);
  try {
    const response = await axiosWithToken.put(`/orders/${id}`, updateCommande);
    // console.log("Updated produit fini:", response.data);
    return response.data;
  } catch (error) {
    console.error("Error updating produit fini:", error);
    throw error;
  }
};
