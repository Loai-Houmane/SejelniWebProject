import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Cookies from 'js-cookie';

const Navdata = () => {
  const history = useNavigate();

  //state data
  const [isDashboard, setIsDashboard] = useState(false);
  const [currentState, setCurrentState] = useState("Dashboard");
  const roles = Cookies.get("roles");

  useEffect(() => {
    document.body.classList.remove("twocolumn-panel");
    if (currentState !== "Dashboard") {
      setIsDashboard(false);
    }
  }, [currentState]);

  // useEffect(() => {console.log("Roles ", roles);},);

  const allMenuItems = [
    { label: "Menu", isHeader: true },
    {
      id: "analytics",
      label: "Dashboard",
      icon: "ri-dashboard-2-line",
      link: "/dashboard-analytics",
      click: (e) => {
        e.preventDefault();
        setCurrentState("Analytics");
        history("/dashboard-analytics");
      },
    },
    {
      id: "reviews",
      label: "Reviews",
      icon: "mdi mdi-star-outline",
      link: "/ChekReviews",
      click: (e) => {
        e.preventDefault();
        setCurrentState("Reviews");
        history("/ChekReviews");
      },
    },
    {
      id: "articles",
      label: "Articles",
      icon: "bx bx-file",
      link: "/articles",
      click: (e) => {
        e.preventDefault();
        setCurrentState("articles");
        history("/articles");
      },
    },
    {
      id: "agenceAdmin",
      label: "Agencies",
      icon: "bx bx-hive",
      link: "/agenceAdmin",
      click: (e) => {
        e.preventDefault();
        setCurrentState("Matiere Premiere");
        history("/matiere-premiere");
      },
    },
    // {
    //   id: "produitFini",
    //   label: "Produits Finis",
    //   icon: "ri-apps-2-line",
    //   link: "/produit",
    //   click: (e) => {
    //     e.preventDefault();
    //     setCurrentState("Produits Finis");
    //     history("/produit");
    //   },
    // },
    // {
    //   id: "commandes",
    //   label: "Commandes",
    //   icon: "mdi mdi-package-variant-closed",
    //   link: "/commande",
    //   click: (e) => {
    //     e.preventDefault();
    //     setCurrentState("Commande");
    //     history("/commande");
    //   },
    // },
    // {
    //   id: "mouvementStock",
    //   label: "Mouvement du stock",
    //   icon: "mdi mdi-truck-delivery-outline",
    //   link: "/mouvement",
    //   click: (e) => {
    //     e.preventDefault();
    //     setCurrentState("mouvement Stock");
    //     history("/mouvement");
    //   },
    // },
  ];
  // console.log("Roles ", roles);
  let menuItems = [];
  if (roles && roles.includes(".")) {
    menuItems = allMenuItems.filter(
      (item) =>
        item.id === "analytics" ||
        item.id === "matierePremiere" ||
        item.id === "produitFini" ||
        item.id === "commandes"
    );
  } else if (roles && roles.includes(".")) {
    menuItems = allMenuItems.filter(
      (item) =>
        item.id === "analytics" ||
        item.id === "clients" ||
        item.id === "commandes"
    );
  } else if (roles && roles.includes("ADMIN")) {
    menuItems = allMenuItems;
  }
  return <ul>{menuItems}</ul>;
};

export default Navdata;
