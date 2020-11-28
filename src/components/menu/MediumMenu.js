import React, { useState } from "react";
import logo from "./logo-menu.png";
import "./menu.css";
import { Link } from "react-router-dom";

// Icons
import { IconContext } from "react-icons";
import { BiPhone } from "react-icons/bi";
import { CgProfile } from "react-icons/cg";

export const MediumMenu = () => {
  
  return (
    <div className="medium-menu">
      <div className="medium-menu-logo">
        <Link className="menu-link" to="/AguaZarca/">
          <img
            src={logo}
            alt="logo"
            className="menu-image medium-menu-image"
     
          />
        </Link>
      </div>
      <div className="medium-menu-container">
        <IconContext.Provider value={{ className: "medium-menu-icon-phone" }}>
          <p className="menu-list menu-list-icon">
            <BiPhone />
                        <a href="tel:35415659041" className="menu-phone"><span>35415659041</span></a>
          </p>
        </IconContext.Provider>
        <IconContext.Provider value={{ className: "menu-icon-profile" }}>
          <p className="menu-list">
            <CgProfile />
          </p>
        </IconContext.Provider>
        <Link className="menu-link" to="/AguaZarca/publicar-propiedad">
          <p className="menu-list menu-publish medium-menu-publish" >
            Publicar
          </p>
        </Link>
        <Dowpdown />
      </div>
    </div>
  );
};


const Dowpdown = () => {
  let handleClick = () => {
    window.scrollTo(0,0)
    setShow(false)
  }
  const [show, setShow] = useState();
  return (
    <div>
      <div id="nav-icon" className={show ? "open" : ""} onClick={() => setShow(!show)}>
              <span></span>
              <span></span>
              <span></span>
              <span></span>
        </div>
        {show ? (
          <ul className="medium-menu-ul dropdown">
            <Link className="medium-menu-link menu-link" to="/AguaZarca/">
              <li className="medium-menu-list medium-menu-list-first" onClick={handleClick}>Inicio</li>
            </Link>
            <Link className="medium-menu-link menu-link" to="/AguaZarca/venta">
              <li className="medium-menu-list" onClick={handleClick}>Venta</li>
            </Link>
            <Link
              className="medium-menu-link menu-link"
              to="/AguaZarca/alquiler-temporario"
            >
              <li className="medium-menu-list" onClick={handleClick}>Alquiler temporario</li>
            </Link>
            <Link
              className="medium-menu-link menu-link"
              to="/AguaZarca/alquiler-anual"
            >
              <li className="medium-menu-list" onClick={handleClick}>Alquiler Anual</li>
            </Link>
            <Link
              className="medium-menu-link menu-link"
              to="/AguaZarca/noticias"
            >
              <li className="medium-menu-list" onClick={handleClick}>Noticias</li>
            </Link>
            <Link
              className="medium-menu-link menu-link"
              to="/AguaZarca/contacto"
            >
              <li className="medium-menu-list" onClick={handleClick}>Contacto</li>
            </Link>
          </ul>
        ) : null}
    </div>
  )
}
