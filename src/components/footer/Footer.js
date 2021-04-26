import React from "react";
import logo from "./logo-menu.png";
import "./footer.css";
import * as ROUTES from "../../routes";
import { Link } from "react-router-dom";
import { IconContext } from "react-icons";
import { RiInstagramLine, RiFacebookBoxLine, RiPhoneLine, RiMailLine, RiMapPinLine } from "react-icons/ri";
const Footer = () => {
  return (
    <div className="footer-div">
      <div className="footer-top">
        <div className="footer-top-left">
          <img className="footer-logo" src={logo} alt="Logo" />
          <p className="footer-subtitle">/ Propiedades en Villa Carlos Paz, Córdoba y Punilla</p>
        </div>
        <div className="footer-top-right">
          <IconContext.Provider value={{ className: "footer-socialmedia footer-socialmedia-facebook" }}>
            <a
              href="https://www.facebook.com/aguazarca.alquila/"
              className="footer-social-link"
              target="_blank"
              rel="noreferrer"
            >
              <RiFacebookBoxLine />
            </a>
            <a
              href="https://www.instagram.com/aguazarcainmobiliaria/?hl=es-la"
              className="footer-social-link"
              target="_blank"
              rel="noreferrer"
            >
              <RiInstagramLine />
            </a>
          </IconContext.Provider>
        </div>
      </div>
      <div className="footer-mid">
        <FooterMenu />
        <FooterInfo />
        <FooterPropietiesTypes />
      </div>
      <div className="footer-bottom">
        <div>
          <p className="footer-margin-tb">© 2020. AguaZarca - Todos los derechos reservados.</p>
        </div>
        <div className="footer-credits">
          <p className="footer-mameluc footer-margin-tb">Diseñado por Mameluc.com.ar</p>
          <p className="footer-margin-tb">Programado por Benjamín Cañas</p>
        </div>
      </div>
    </div>
  );
};

const FooterInfo = () => {
  return (
    <div className="footer-info-div">
      <IconContext.Provider value={{ className: "medium-menu-icon-phone" }}>
        <p className="footer-margin-tb">
          <RiMapPinLine />
          <a
            href="https://www.google.com/maps/place/Villa+Carlos+Paz,+C%C3%B3rdoba/@-31.4121939,-64.5697769,12z/data=!3m1!4b1!4m5!3m4!1s0x942d6640d6777c71:0x75c24ab6cb121bed!8m2!3d-31.4207828!4d-64.4992141"
            className="footer-email"
            target="_blank"
            rel="noreferrer"
          >
            Villa Carlos Paz
          </a>
        </p>
        <a href="tel:+5435415659041" className="footer-margin-tb footer-tel">
          <RiPhoneLine /> +54 3541 659-047
        </a>
        <p className="footer-margin-tb">
          <RiMailLine />{" "}
          <a href="mailto:gillio.inmo@gmail.com" className="footer-email">
            gillio.inmo@gmail.com
          </a>
        </p>
      </IconContext.Provider>
    </div>
  );
};

export const FooterPropietiesTypes = () => {
  return (
    <div className="footer-types-div">
      <Link className="menu-link" to={ROUTES.TIPO_DE_PROPIEDAD_SIMPLE_URL + "Casa"}>
        <li className="footer-menu-li footer-margin-tb">Casa</li>
      </Link>
      <Link className="menu-link" to={ROUTES.TIPO_DE_PROPIEDAD_SIMPLE_URL + "Departamento"}>
        <li className="footer-menu-li footer-margin-tb">Departamento</li>
      </Link>
      <Link className="menu-link" to={ROUTES.TIPO_DE_PROPIEDAD_SIMPLE_URL + "Hotel"}>
        <li className="footer-menu-li footer-margin-tb">Hotel</li>
      </Link>
      <Link className="menu-link" to={ROUTES.TIPO_DE_PROPIEDAD_SIMPLE_URL + "Local"}>
        <li className="footer-menu-li footer-margin-tb">Local Comercial</li>
      </Link>
      <Link className="menu-link" to={ROUTES.TIPO_DE_PROPIEDAD_SIMPLE_URL + "Terreno y lote"}>
        <li className="footer-menu-li footer-margin-tb">Lote/Terreno/Campo</li>
      </Link>
    </div>
  );
};

const FooterMenu = () => {
  return (
    <div className="footer-menu-div">
      <div className="footer-menu-left">
        <Link className="menu-link" to={ROUTES.HOME}>
          <li className="footer-menu-li footer-margin-tb">Inicio</li>
        </Link>
        <Link className="menu-link" to={ROUTES.VENTA}>
          <li className="footer-menu-li footer-margin-tb">Venta</li>
        </Link>
        <Link className="menu-link" to={ROUTES.ALQUILER_TEMPORAL}>
          <li className="footer-menu-li footer-margin-tb">Alquiler temporario</li>
        </Link>
      </div>
      <div className="footer-menu-left footer-menu-right">
        <Link className="menu-link" to={ROUTES.ALQUILER_ANUAL}>
          <li className="footer-menu-li footer-margin-tb">Alquiler Anual</li>
        </Link>
        <Link className="menu-link" to={ROUTES.NOTICIAS}>
          {" "}
          <li className="footer-menu-li footer-margin-tb">Noticias</li>
        </Link>
        <Link className="menu-link" to={ROUTES.CONTACTO}>
          <li className="footer-menu-li footer-margin-tb">Contacto</li>
        </Link>
      </div>
    </div>
  );
};

export default Footer;
