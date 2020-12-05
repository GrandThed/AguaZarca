import React, { useState } from "react";
import { Link } from "react-router-dom";
import * as ROUTES from "../../routes";

export const Dropdown = (props) => {
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
        {/* this is the dropdown icon */}
      </div>
      {show ? (
        <ul className={`medium-menu-ul ${props.addClass}`}>
          <Link className="medium-menu-link menu-link" to="/AguaZarca/">
            <li className="medium-menu-list medium-menu-list-first" onClick={handleClick}>
              Inicio
            </li>
          </Link>
          <Link className="medium-menu-link menu-link" to={ROUTES.VENTA}>
            <li className="medium-menu-list" onClick={handleClick}>
              Venta
            </li>
          </Link>
          <Link className="medium-menu-link menu-link" to={ROUTES.ALQUILER_TEMPORAL}>
            <li className="medium-menu-list" onClick={handleClick}>
              Alquiler temporario
            </li>
          </Link>
          <Link className="medium-menu-link menu-link" to={ROUTES.ALQUILER_ANUAL}>
            <li className="medium-menu-list" onClick={handleClick}>
              Alquiler Anual
            </li>
          </Link>
          <Link className="medium-menu-link menu-link" to={ROUTES.NOTICIAS}>
            <li className="medium-menu-list" onClick={handleClick}>
              Noticias
            </li>
          </Link>
          <Link className="medium-menu-link menu-link" to={ROUTES.CONTACTO}>
            <li className="medium-menu-list" onClick={handleClick}>
              Contacto
            </li>
          </Link>
        </ul>
      ) : null}
    </>
  );
};
