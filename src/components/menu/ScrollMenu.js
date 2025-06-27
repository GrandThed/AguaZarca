import React, { useState } from "react";
import { Link } from "react-router-dom";
import logo from "./logo-menu.png";
import { IconContext } from "react-icons";
import "./menu.css";

import * as ROUTES from "../../routes";

export const ScrollMenu = () => {
  const [scrolled, setScrolled] = useState(false);
  let handleClick = () => {
    window.scrollTo(0,0)
  }

  let handleScroll = () => {
    let isSubscribed = true;
    if (isSubscribed){
      setScrolled(
        document.body.scrollTop > 80 || document.documentElement.scrollTop > 80
      );
    }
    return () => (isSubscribed = false);

  };
  window.onscroll = () => handleScroll();
  return (
    <div className="scrollmenu-div" style={{ top: scrolled ? "0" : "-85px" }}>
      <div className="scrollmenu-left">
        <Link className="scrollmenu-image" onClick={handleClick} to={ROUTES.HOME}>
          <img
            src={logo}
            alt="logo"
            className="scrollmenu-image"
          />
        </Link>
        <Link className="menu-link scrollmenu-link" onClick={handleClick} to={ROUTES.HOME}>
          Inicio
        </Link>
        <Link className="menu-link scrollmenu-link" onClick={handleClick} to={ROUTES.VENTA}>
          Venta
        </Link>
        <Link className="menu-link scrollmenu-link" onClick={handleClick} to={ROUTES.ALQUILER_TEMPORAL}>
          Alquiler temporario
        </Link>
        <Link className="menu-link scrollmenu-link" onClick={handleClick} to={ROUTES.ALQUILER_ANUAL}>
          Alquiler Anual
        </Link>
        <Link className="menu-link scrollmenu-link" onClick={handleClick} to={ROUTES.NOTICIAS}>
          Noticias
        </Link>
        <Link className="menu-link scrollmenu-link" onClick={handleClick} to={ROUTES.BLOGS}>
          Blog
        </Link>
        <Link className="menu-link scrollmenu-link" onClick={handleClick} to={ROUTES.CONTACTO}>
          Contacto
        </Link>
      </div>
      <div className="scrollmenu-right">
        <IconContext.Provider value={{ className: "" }}></IconContext.Provider>
        <Link className="scrollmenu-publish" onClick={handleClick} to={ROUTES.PUBLICAR}>
          Publicar
        </Link>
      </div>
    </div>
  );
};
