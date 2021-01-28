import React, {useState} from "react";
import logo from "./logo-menu.png";
import "./menu.css";
import { Link } from "react-router-dom";
import LogInForm from '../logInform/LogInForm'



import * as ROUTES from "../../routes";

// Icons
import { IconContext } from "react-icons";
import { BiPhone } from "react-icons/bi";
import { CgProfile } from "react-icons/cg";
import { Dropdown } from "./Dropdown";

export const MobileMenu = () => {
  const [showLog, setShowLog] = useState()

  return (
    <div className="mobile-menu">
      <div className="mobile-menu-top">
        <IconContext.Provider value={{ className: "menu-icon-profile" }}>
          <li className="menu-list">
          <CgProfile onClick={() => setShowLog((e) => !e)} />
            {showLog && <LogInForm/>}
          </li>
        </IconContext.Provider>
        <Link className="menu-link" to={ROUTES.HOME}>
          <img src={logo} alt="logo" className="menu-image" width="200" height="50" />
        </Link>
        <Dropdown addClass="dropdown-mobile" />
      </div>
      <div className="mobile-menu-bottom">
        <IconContext.Provider value={{ className: "medium-menu-icon-phone" }}>
          <li className="menu-list menu-list-icon">
            <BiPhone />
            <a href="tel:35415659041" className="menu-phone">
              <span>35415659041</span>
            </a>
          </li>
        </IconContext.Provider>

        <Link className="menu-link" to={ROUTES.PUBLICAR}>
          <li className="  mobile-menu-publish">Publicar</li>
        </Link>
      </div>
    </div>
  );
};


