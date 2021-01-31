import React, { useState } from "react";
import { Link } from "react-router-dom";
import * as ROUTES from "../../routes";
import "./menu.css";

const Dropdown = () => {
  let handleClick = () => {
    setShow(false);
    window.scrollTo(0, 0);
  };
  const [show, setShow] = useState(null);
  return (
    <>
      <div id="nav-icon" className={show ? "open" : ""} onClick={() => setShow(!show)}>
        <span></span>
        <span></span>
        <span></span>
        <span></span>
        {/* this one is the dropdown icon */}
      </div>
      {show ? (
        <div className="medium-menu-ul dropdown">
          <Link className="dropdown-item menu-link" onClick={handleClick} to={ROUTES.HOME}>
            Inicio
          </Link>
          <Link className="dropdown-item menu-link" onClick={handleClick} to={ROUTES.VENTA}>
            Venta
          </Link>
          <Link className="dropdown-item menu-link" onClick={handleClick} to={ROUTES.ALQUILER_TEMPORAL}>
            Alquiler temporario
          </Link>
          <Link className="dropdown-item menu-link" onClick={handleClick} to={ROUTES.ALQUILER_ANUAL}>
            Alquiler Anual
          </Link>
          <Link className="dropdown-item menu-link" onClick={handleClick} to={ROUTES.NOTICIAS}>
            Noticias
          </Link>
          <Link className="dropdown-item menu-link" onClick={handleClick} to={ROUTES.CONTACTO}>
            Contacto
          </Link>
        </div>
      ) : null}
    </>
  );
};

export default Dropdown;
