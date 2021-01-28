import React, { useState } from "react";
import logo from "./logo-menu.png";
import "./menu.css";
import { Link } from "react-router-dom";
import { Dropdown } from "./Dropdown";
import * as ROUTES from "../../routes";
import LogInForm from '../logInform/LogInForm'


// Icons
import { IconContext } from "react-icons";
import { BiPhone } from "react-icons/bi";
import { CgProfile } from "react-icons/cg";

export const MediumMenu = () => {
  const [showLog, setShowLog] = useState()
  
  return (
    <div className="medium-menu">
      <div className="medium-menu-logo">
        <Link className="menu-link" to={ROUTES.HOME}>
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
          <div className="menu-list">
            <CgProfile onClick={() => setShowLog((e) => !e)} />
            {showLog && <LogInForm/>}
          </div>
        </IconContext.Provider>
        <Link className="menu-link" to={ROUTES.PUBLICAR}>
          <p className="menu-list menu-publish medium-menu-publish" >
            Publicar
          </p>
        </Link>
        <Dropdown addClass="dropdown"/>
      </div>
    </div>
  );
};

