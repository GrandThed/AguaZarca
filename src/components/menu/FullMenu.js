import React, { useState } from "react";

import logo from "./logo-menu.png";
import "./menu.css";
import { Link } from "react-router-dom";
import LogInForm from '../logInform/LogInForm'
import * as ROUTES from "../../routes";

// Icons
import { BiPhone,  } from "react-icons/bi";
import { IconContext } from "react-icons";
import { CgProfile } from "react-icons/cg";
// import { ScrollMenu } from "./ScrollMenu";

export const FullMenu = () => {
  const [showLog, setShowLog] = useState()

  return (
    <div className="menu">
  
        <Link className="menu-link" to={ROUTES.HOME}>
          <img
            src={logo}
            alt="logo"
            className="menu-image"
            
          />
        </Link>

        <Link className="menu-link" to={ROUTES.HOME}>
          <p className="menu-list menu-hover-efect">Inicio</p>
        </Link>
        <Link className="menu-link" to={ROUTES.VENTA}>
          <p className="menu-list menu-hover-efect">Venta</p>
        </Link>
        <Link className="menu-link" to={ROUTES.ALQUILER_TEMPORAL}>
          <p className="menu-list menu-hover-efect">Alquiler temporario</p>
        </Link>
        <Link className="menu-link" to={ROUTES.ALQUILER_ANUAL}>
          <p className="menu-list menu-hover-efect">Alquiler Anual</p>
        </Link>
        <Link className="menu-link" to={ROUTES.NOTICIAS}>
 
          <p className="menu-list menu-hover-efect">Noticias</p>
        </Link>
        <Link className="menu-link" to={ROUTES.CONTACTO}>
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
            <CgProfile onClick={() => setShowLog((e) => !e)} />
            {showLog && <LogInForm/>}
          </p>
        </IconContext.Provider>
        <Link className="menu-link" to={ROUTES.PUBLICAR}>
          <p className="menu-list menu-publish">Publicar</p>
        </Link>
  
      {/* <ScrollMenu /> */}
    </div>
  );
};
