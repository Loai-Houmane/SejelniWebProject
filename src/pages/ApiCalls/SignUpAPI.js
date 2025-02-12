import axiosInstance from "./axiosInstance";

export const Signup = async (userData, type) => {
  try {
    if (type === "student") {
      const response = await axiosInstance.post("/student/signup", userData);
      return response.data;
    }
    if (type === "agency") {
      const response = await axiosInstance.post("/agencies/register", userData);
      return response.data;
    }
  } catch (error) {
    console.error("Error creating account:", error);
    throw error;
  }
};