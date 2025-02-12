import React from "react";
import { Navigate } from "react-router-dom";

//Dashboard
import DashboardAnalytics from "../pages/DashboardAnalytics";

import LandingPage from "../pages/Job_Landing/LandingPage";
//AuthenticationInner pages

import AgencyPage from "../pages/Pages/Profile/SimplePage/AgencyPage";
import AgencyPageFA from "../pages/Pages/Profile/SimplePage/AgencyPageFA";

import Pricing from "../pages/Pages/Pricing/Pricing";


//login
import LoginAdmin from "../pages/Authentication/LoginAdmin";
import Login from "../pages/Authentication/Login";
import Logout from "../pages/Authentication/Logout";
import RegisterAgency from "../pages/Authentication/RegisterAgency";



// Base
import Articles from "../pages/Base/Articles.js";

import ChekReviews from "../pages/Base/ChekReviews.js";
import AgenceAdmin from "../pages/Base/Agence.js";
import EditAgency from "../pages/Pages/Profile/SimplePage/EditAgency.js";
import StudentPage from "../pages/SudentPage/StudentPage.js";
const authProtectedRoutes = [
  // Base
  { path: "/dashboard", component: <DashboardAnalytics /> },
  { path: "/ChekReviews", component: <ChekReviews /> },
  { path: "/agenceAdmin", component: <AgenceAdmin /> },
  { path: "/articles", component: <Articles /> },
  { path: "/agencyPage/:id", component: <AgencyPage /> },
  { path: "/agencyPageFA/:id", component: <AgencyPageFA /> },
  { path: "/edit-agency", component: <EditAgency /> },
  { path: "/student-page", component: <StudentPage /> },
  { path: "/pricing", component: <Pricing /> },

  {
    path: "/",
    exact: true,
    component: <Navigate to="/landingPage" />,
  },
  { path: "*", component: <Navigate to="/dashboard" /> },
];
import ArticlePage from "../pages/Job_Landing/ArticlePage"; // Import the ArticlePage component
import AgencyAD from "../pages/Job_Landing/AgencyAD"; // Import the AgencyAD component
const publicRoutes = [
  // Authentication Page
  { path: "/registerAgency", component: <RegisterAgency /> },
  { path: "/loginAdmin", component: <LoginAdmin /> },
  { path: "/login", component: <Login /> },
  { path: "/LandingPage", component: <LandingPage /> },
  { path: "/agencyAD", component: <AgencyAD /> },
  { path: "/article/:id", component: <ArticlePage /> },
];

export { authProtectedRoutes, publicRoutes };
