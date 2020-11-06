import React from "react";
import logo from "./logo-menu.png";
import "./footer.css";
import { Link } from "react-router-dom";
import { IconContext } from "react-icons";
import {
  RiInstagramLine,
  RiFacebookBoxLine,
  RiPhoneLine,
  RiMailLine,
  RiMapPinLine,
} from "react-icons/ri";
const Footer = () => {
  return (
    <div className="footer-div">
      <div className="footer-top">
        <div className="footer-top-left">
          <img className="footer-logo" src={logo} alt="Logo" />
          <p className="footer-subtitle">
            / Propiedades en Villa Carlos Paz, Córdoba y Punilla
          </p>
        </div>
        <div className="footer-top-right">
          <IconContext.Provider value={{ className: "footer-socialmedia" }}>
            <a
              href="https://www.facebook.com/aguazarca.alquila/"
              className="footer-social-link"
              target="_blank"
              rel="noreferrer"
            >
              <RiFacebookBoxLine />
            </a>
            <a
              href="https://www.facebook.com/aguazarca.alquila/"
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
          <p>© 2020. AguaZarca - Todos los derechos reservados.</p>
        </div>
        <div className="footer-credits">
          <p>Diseñado por Mameluc.com.ar</p>
          <p>Programado por Mameluc.com.ar</p>
        </div>
      </div>
    </div>
  );
};


const FooterInfo = () => {
  return (
    <div className="footer-info-div">
      <IconContext.Provider value={{ className: "medium-menu-icon-phone" }}>
        <p>
          <RiMapPinLine />{" "}
          <a
            href="https://www.google.com/maps/place/Villa+Carlos+Paz,+C%C3%B3rdoba/@-31.4121939,-64.5697769,12z/data=!3m1!4b1!4m5!3m4!1s0x942d6640d6777c71:0x75c24ab6cb121bed!8m2!3d-31.4207828!4d-64.4992141"
            className="footer-email"
            target="_blank"
            rel="noreferrer"
          >
            Villa Carlos Paz
          </a>
        </p>
        <p>
          <RiPhoneLine /> +543541659047
        </p>
        <p>
          <RiMailLine />{" "}
          <a href="mailto:hola@aguazarca.com.ar" className="footer-email">
            hola@aguazarca.com.ar
          </a>
        </p>
      </IconContext.Provider>
    </div>
  );
};

export const FooterPropietiesTypes = () => {
  return (
    <div className="footer-types-div">
      <Link className="menu-link" to="/AguaZarca/">
        <li className="footer-menu-li">Casa</li>
      </Link>
      <Link className="menu-link" to="/AguaZarca/">
        <li className="footer-menu-li">Departamento</li>
      </Link>
      <Link className="menu-link" to="/AguaZarca/">
        <li className="footer-menu-li">Hotel</li>
      </Link>
      <Link className="menu-link" to="/AguaZarca/l">
        <li className="footer-menu-li">Local Comercial</li>
      </Link>
      <Link className="menu-link" to="/AguaZarca/">
        {" "}
        <li className="footer-menu-li">Lote/Terremp/Campo</li>
      </Link>
    </div>
  );
};

const FooterMenu = () => {
  return (
    <div className="footer-menu-div">
      <div className="footer-menu-left">
        <Link className="menu-link" to="/AguaZarca/">
          <li className="footer-menu-li">Inicio</li>
        </Link>
        <Link className="menu-link" to="/AguaZarca/venta">
          <li className="footer-menu-li">Venta</li>
        </Link>
        <Link className="menu-link" to="/AguaZarca/alquiler-temporario">
          <li className="footer-menu-li">Alquiler temporario</li>
        </Link>
      </div>
      <div className="footer-menu-left footer-menu-right">
        <Link className="menu-link" to="/AguaZarca/alquiler-anual">
          <li className="footer-menu-li">Alquiler Anual</li>
        </Link>
        <Link className="menu-link" to="/AguaZarca/noticias">
          {" "}
          <li className="footer-menu-li">Noticias</li>
        </Link>
        <Link className="menu-link" to="/AguaZarca/contacto">
          <li className="footer-menu-li">Contacto</li>
        </Link>
      </div>
    </div>
  );
};



export default Footer;