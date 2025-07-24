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
    <nav className="scrollmenu-div" style={{ top: scrolled ? "0" : "-85px" }} role="navigation" aria-label="Navegación principal">
      <div className="scrollmenu-left">
        <Link className="scrollmenu-image" onClick={handleClick} to={ROUTES.HOME} aria-label="Ir al inicio - AguaZarca Inmobiliaria">
          <img
            src={logo}
            alt="Logo AguaZarca Inmobiliaria"
            className="scrollmenu-image"
          />
        </Link>
        <ul className="menu-nav-list">
          <li>
            <Link className="menu-link scrollmenu-link" onClick={handleClick} to={ROUTES.HOME}>
              Inicio
            </Link>
          </li>
          <li>
            <Link className="menu-link scrollmenu-link" onClick={handleClick} to={ROUTES.VENTA}>
              Venta
            </Link>
          </li>
          <li>
            <Link className="menu-link scrollmenu-link" onClick={handleClick} to={ROUTES.ALQUILER_TEMPORAL}>
              Alquiler temporario
            </Link>
          </li>
          <li>
            <Link className="menu-link scrollmenu-link" onClick={handleClick} to={ROUTES.ALQUILER_ANUAL}>
              Alquiler Anual
            </Link>
          </li>
          <li>
            <Link className="menu-link scrollmenu-link" onClick={handleClick} to={ROUTES.NOTICIAS}>
              Noticias
            </Link>
          </li>
          <li>
            <Link className="menu-link scrollmenu-link" onClick={handleClick} to={ROUTES.BLOGS}>
              Blog
            </Link>
          </li>
          <li>
            <Link className="menu-link scrollmenu-link" onClick={handleClick} to={ROUTES.CONTACTO}>
              Contacto
            </Link>
          </li>
        </ul>
      </div>
      <div className="scrollmenu-right">
        <Link className="scrollmenu-publish" onClick={handleClick} to={ROUTES.PUBLICAR} aria-label="Publicar nueva propiedad">
          Publicar
        </Link>
      </div>
    </nav>
  );
};
