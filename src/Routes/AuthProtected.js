import React, { useEffect } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { setAuthorization } from "../helpers/api_helper";
import { useDispatch } from "react-redux";
import { useProfile } from "../Components/Hooks/UserHooks";
import { logoutUser } from "../slices/thunks";
import Cookies from "js-cookie";

const AuthProtected = (props) => {
  const dispatch = useDispatch();
  const token = Cookies.get("accessToken");
  const { userProfile, loading } = useProfile();
  const location = useLocation(); // Get the current location

  useEffect(() => {
    if (userProfile && !loading && token) {
      setAuthorization(token);
    } else if (!userProfile && loading && !token) {
      dispatch(logoutUser());
    }
  }, [token, userProfile, loading, dispatch]);

  const roles = Cookies.get("roles");

  /*
    Redirect to login if the user is not authenticated
    */
  if (!token || token === "undefined") {
    return <Navigate to={{ pathname: "/landingPage", state: { from: location } }} />;
  }

  // // Check if the role is "Magasinier" and restrict routes
  // if (roles && roles.includes("Magasinier")) {
  //   const allowedRoutes = [
  //     "/dashboard",
  //     "/commande",
  //     "/matiere-premiere",
  //     "/produit",
  //   ];
  //   const currentPath = location.pathname;

  //   if (!allowedRoutes.includes(currentPath)) {
  //     return <Navigate to="/dashboard" />;
  //   }
  // }

  return <>{props.children}</>;
};

export { AuthProtected };
