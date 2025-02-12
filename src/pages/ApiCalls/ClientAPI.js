import axiosWithToken from "./axiosWithToken";

export const addClientRequest = async (clientData) => {
  try {
    const response = await axiosWithToken.post("/clients", clientData);
    return response.data;
  } catch (error) {
    console.error("Error adding client:", error);
    throw error;
  }
};

export const updateClientRequest = async (id, updateClient) => {
  try {
    const response = await axiosWithToken.put(
      `/clients/${id}`,
      updateClient
    );
    console.log("Updated client:", response.data);
    return response.data;
  } catch (error) {
    console.error("Error updating client:", error);
    throw error;
  }
};
