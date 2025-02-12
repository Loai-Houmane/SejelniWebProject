import axiosInstance from "./axiosInstance";
import Cookies from "js-cookie";
import axiosWithToken from "./axiosWithToken";

export const login = async (AdminDataLogin, Role) => {
  try {
    let endpoint;
    switch (Role) {
      case 'admin':
        endpoint = '/admin/login';
        break;
      case 'student':
        endpoint = '/student/login';
        break;
      case 'agency':
        endpoint = '/agencies/login';
        break;
      default:
        throw new Error('Invalid role');
    }

    const { data } = await axiosInstance.post(
      endpoint,
      AdminDataLogin
    );

    Cookies.set("accessToken", data.token, { expires: 5 });
    Cookies.set("roles", data.role, { expires: 5 });
    sessionStorage.setItem("roles", data.role);
    if(data.role === "AGENCY") {
      Cookies.set("agencyId", data.id, { expires: 5 });
    }
    //print data
    // process.stdout.write(`Data: ${JSON.stringify(data.role)}\n`);
    return data;
  } catch (error) {
    console.error("Login error:", error);
    throw error;
  }
};

export const LogoutCollaborator = async () => {
  try {
    const response = await axiosWithToken.post("/logout");
    if (response.status === 200) {
      Cookies.remove("accessToken");
      Cookies.remove("roles");
      sessionStorage.removeItem("roles");
      window.location.href = "/login";
    }
  } catch (error) {
    console.error("Logout error:", error);
  }
};
