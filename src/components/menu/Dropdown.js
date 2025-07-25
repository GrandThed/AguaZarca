import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import * as ROUTES from "../../routes";
import "./menu.css";

const Dropdown = () => {
  const [show, setShow] = useState(false);

  const handleClick = () => {
    setShow(false);
    window.scrollTo(0, 0);
  };

  const handleToggle = () => {
    setShow(!show);
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (show && !event.target.closest('#nav-icon') && !event.target.closest('.dropdown')) {
        setShow(false);
      }
    };

    if (show) {
      document.addEventListener('click', handleClickOutside);
      document.body.style.overflow = 'hidden'; // Prevent body scroll on mobile
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.removeEventListener('click', handleClickOutside);
      document.body.style.overflow = 'unset';
    };
  }, [show]);

  // Close dropdown on escape key
  useEffect(() => {
    const handleEscape = (event) => {
      if (event.key === 'Escape' && show) {
        setShow(false);
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [show]);

  return (
    <>
      <button
        id="nav-icon" 
        className={show ? "open" : ""} 
        onClick={handleToggle}
        aria-label="Alternar menú de navegación"
        aria-expanded={show}
        aria-controls="mobile-menu"
      >
        <span></span>
        <span></span>
        <span></span>
        <span></span>
      </button>
      {show && (
        <nav 
          id="mobile-menu"
          className="dropdown" 
          role="navigation" 
          aria-label="Menú principal móvil"
        >
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
          <Link className="dropdown-item menu-link" onClick={handleClick} to={ROUTES.BLOGS}>
            Blog
          </Link>
          <Link className="dropdown-item menu-link" onClick={handleClick} to={ROUTES.CONTACTO}>
            Contacto
          </Link>
        </nav>
      )}
    </>
  );
};

export default Dropdown;
