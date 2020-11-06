import React, { useState } from "react";
import logo from "./logo-menu.png";
import "./menu.css";
import { Link } from "react-router-dom";

// Icons
import { IconContext } from "react-icons";
import { BiPhone } from "react-icons/bi";
import { CgProfile } from "react-icons/cg";

export const MobileMenu = () => {
  const [show, setShow] = useState();
  return (
    <div className="mobile-menu">
      <div className="mobile-menu-top">
        <IconContext.Provider value={{ className: "menu-icon-profile" }}>
          <li className="menu-list">
            <CgProfile />
          </li>
        </IconContext.Provider>
        <Link className="menu-link" to="/AguaZarca/">
          <img
            src={logo}
            alt="logo"
            className="menu-image"
            width="200"
            height="50"
          />
        </Link>
        <div
          id="nav-icon"
          className={show ? "open" : ""}
          onClick={() => setShow(!show)}
        >
          <span></span>
          <span></span>
          <span></span>
          <span></span>
        </div>
        {show ? (
          <ul className=" medium-menu-ul dropdown-mobile">
            <Link className="medium-menu-link menu-link" to="/AguaZarca/">
              <li className="medium-menu-list medium-menu-list-first">Inicio</li>
            </Link>
            <Link className="medium-menu-link menu-link" to="/AguaZarca/venta">
              <li className="medium-menu-list">Venta</li>
            </Link>
            <Link
              className="medium-menu-link menu-link"
              to="/AguaZarca/alquiler-temporario"
            >
              <li className="medium-menu-list">Alquiler temporario</li>
            </Link>
            <Link
              className="medium-menu-link menu-link"
              to="/AguaZarca/alquiler-anual"
            >
              <li className="medium-menu-list">Alquiler Anual</li>
            </Link>
            <Link
              className="medium-menu-link menu-link"
              to="/AguaZarca/noticias"
            >
              <li className="medium-menu-list">Noticias</li>
            </Link>
            <Link
              className="medium-menu-link menu-link"
              to="/AguaZarca/contacto"
            >
              <li className="medium-menu-list">Contacto</li>
            </Link>
          </ul>
        ) : null}
      </div>
      <div className="mobile-menu-bottom">
      <IconContext.Provider value={{ className: "medium-menu-icon-phone" }}>
          <li className="menu-list menu-list-icon">
            <BiPhone />
            <a href="tel:35415659041" className="menu-phone"><span>35415659041</span></a>
          </li>
        </IconContext.Provider>
      
      <Link className="menu-link" to="/AguaZarca/publicar-propiedad">
          <li className="  mobile-menu-publish">
            Publicar
          </li>
        </Link>
        </div>
      {/* <div className="medium-menu-logo">
        
      </div>
      <div className="medium-menu-container">
        
        
        
        
      </div> */}
    </div>
  );
};
