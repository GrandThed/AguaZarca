import "./menu.css";

import LogInForm from "../logInform/LogInForm";
import Dropdown from "./Dropdown";
import logo from "./logo-menu.png";

import React, { useState } from "react";
import * as ROUTES from "../../routes";
import { Link } from "react-router-dom";

import { IconContext } from "react-icons";
import { BiPhone } from "react-icons/bi";
import { CgProfile } from "react-icons/cg";
import { ScrollMenu } from "./ScrollMenu";

export const Menu = () => {
  const [showLog, setShowLog] = useState(false);
  return (
    <div className="menu-main">
      {/* Menu Logo */}
      <div className="menu-logo">
        <Link className="menu-link" to={ROUTES.HOME}>
          <img src={logo} alt="aguazarca-logo" className="menu-image" />
        </Link>
      </div>
      {/* Menu DropDown */}
      <div className="menu-dropdown">
        <Dropdown />
      </div>
      {/* Navigation links*/}
      <div className="menu-navbar">
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
        <Link className="menu-link" to={ROUTES.BLOGS}>
          <p className="menu-list menu-hover-efect">Blog</p>
        </Link>
        <Link className="menu-link" to={ROUTES.CONTACTO}>
          <p className="menu-list menu-hover-efect">Contacto</p>
        </Link>
      </div>
      {/* Phone number and icon */}
      <div className="menu-phone">
        <p className="menu-phone-p">
          <IconContext.Provider value={{ className: "menu-icon-phone" }}>
            <BiPhone />
          </IconContext.Provider>
          <a href="https://wa.me/5493517896825" target="_blank" rel="noopener noreferrer" className="menu-phone-a">
            <span>3541 7896-825</span>
          </a>
        </p>
      </div>
      {/* LogIn form & Dashboard */}
      <div className="menu-login">
        <button 
          className="menu-profile-button"
          onClick={() => setShowLog((e) => !e)}
          aria-label="Abrir menú de usuario"
          aria-expanded={showLog}
          aria-controls="login-form"
        >
          <IconContext.Provider value={{ className: "menu-icon-profile" }}>
            <CgProfile />
          </IconContext.Provider>
        </button>
        {showLog && <div id="login-form"><LogInForm /></div>}
      </div>
      {/* Publish button */}
      <div className="menu-publish">
        <Link className="menu-link" to={ROUTES.PUBLICAR}>
          <p className="menu-list menu-publish-p">Publicar</p>
        </Link>
      </div>
      <ScrollMenu />
    </div>
  );
};
