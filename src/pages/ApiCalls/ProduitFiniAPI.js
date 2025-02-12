import axiosWithToken from "./axiosWithToken";

export const addFinalProductRequest = async (produitFiniData) => {
  try {
    const response = await axiosWithToken.post(
      "/produit-fini",
      produitFiniData
    );
    // console.log('Body Request' , produitFiniData) ;
    return response.data;
  } catch (error) {
    console.error("Error adding produit fini:", error);
    throw error;
  }
};

export const updateFinalProductRequest = async (id, updateProduitFini) => {
  try {
    const response = await axiosWithToken.put(
      `/produit-fini/${id}`,
      updateProduitFini
    );
    // console.log("Updated produit fini:", response.data);
    return response.data;
  } catch (error) {
    console.error("Error updating produit fini:", error);
    throw error;
  }
};
