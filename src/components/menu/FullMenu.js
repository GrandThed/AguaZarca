import React from "react";

import logo from "./logo-menu.png";
import "./menu.css";
import { Link } from "react-router-dom";

// Icons
import { BiPhone,  } from "react-icons/bi";
import { IconContext } from "react-icons";
import { CgProfile } from "react-icons/cg";
import { ScrollMenu } from "./ScrollMenu";

export const FullMenu = () => {
  

  return (
    <div className="menu">
  
        <Link className="menu-link" to="/AguaZarca/">
          <img
            src={logo}
            alt="logo"
            className="menu-image"
            
          />
        </Link>

        <Link className="menu-link" to="/AguaZarca/">
          <p className="menu-list menu-hover-efect">Inicio</p>
        </Link>
        <Link className="menu-link" to="/AguaZarca/venta">
          <p className="menu-list menu-hover-efect">Venta</p>
        </Link>
        <Link className="menu-link" to="/AguaZarca/alquiler-temporario">
          <p className="menu-list menu-hover-efect">Alquiler temporario</p>
        </Link>
        <Link className="menu-link" to="/AguaZarca/alquiler-anual">
          <p className="menu-list menu-hover-efect">Alquiler Anual</p>
        </Link>
        <Link className="menu-link" to="/AguaZarca/noticias">
 
          <p className="menu-list menu-hover-efect">Noticias</p>
        </Link>
        <Link className="menu-link" to="/AguaZarca/contacto">
          <p className="menu-list menu-hover-efect">Contacto</p>
        </Link>

        <IconContext.Provider value={{ className: "menu-icon-phone" }}>
          <p className="menu-list menu-list-icon">
            <BiPhone />
            <a href="tel:35415659041" className="menu-phone">
              <span>35415659041</span>
            </a>
          </p>
        </IconContext.Provider>
        <IconContext.Provider value={{ className: "menu-icon-profile" }}>
          <p className="menu-list">
            <CgProfile />
          </p>
        </IconContext.Provider>
        <Link className="menu-link" to="/AguaZarca/publicar-propiedad">
          <p className="menu-list menu-publish">Publicar</p>
        </Link>
  
      <ScrollMenu />
    </div>
  );
};
