import React from "react";
import logo from "./logo-menu.png";
import "./menu.css";
import {Link} from 'react-router-dom'

// Icons
import { BiPhone } from "react-icons/bi";
import { IconContext } from "react-icons";
import { CgProfile } from "react-icons/cg";

export const FullMenu = () => {
  return (
    <div className="menu">
      <ul className="menu-ul">
        <img
          src={logo}
          alt="logo"
          className="menu-image"
          width="200"
          height="50"
        />
        <Link className="menu-link" to="/"><li className="menu-list menu-hover-efect">Inicio</li></Link>
        <Link className="menu-link" to="/venta"><li className="menu-list menu-hover-efect">Venta</li></Link>
        <Link className="menu-link" to="/alquiler-temporario"><li className="menu-list menu-hover-efect">Alquiler temporario</li></Link>
        <Link className="menu-link" to="/alquiler-anual"><li className="menu-list menu-hover-efect">Alquiler Anual</li></Link>
        <Link className="menu-link" to="/noticias"> <li className="menu-list menu-hover-efect">Noticias</li></Link>
        <Link className="menu-link" to="/contacto"><li className="menu-list menu-hover-efect">Contacto</li></Link>
        
        
          <IconContext.Provider value={{ className: "menu-icon-phone" }}>
          <li className="menu-list menu-list-icon">
            <BiPhone />
            <span>35415659041</span>
          </li>
            </IconContext.Provider>
          <IconContext.Provider value={{ className: "menu-icon-profile" }}>

          <li className="menu-list">
            <CgProfile />
          </li>
          </IconContext.Provider>
        
        <Link className="menu-link"  to="/publicar-propiedad"><li className="menu-list menu-publish">Publicar</li></Link>
      </ul>
    </div>
  );
};