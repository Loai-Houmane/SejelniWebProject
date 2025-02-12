import axios from "axios";
import Cookies from "js-cookie";
import { useNavigate } from "react-router-dom";

const axiosWithToken = axios.create({
  baseURL: "http://localhost:3000/api",
  headers: { "Content-Type": "application/json" },
});

axiosWithToken.interceptors.request.use(
  (config) => {
    const token = Cookies.get("accessToken");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    } else {
      useNavigate().push("/login");
      return Promise.reject(new Error("No access token available"));
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export default axiosWithToken;
