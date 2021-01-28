import React, { useState, useEffect } from "react";
import Slider from "../../slider/Slider";
import Card from "../../card/Card";
import logo from "./../../../images/vcp-panoramica.jpg";
import { CONTACTO, PUBLICAR } from "../../../routes";
import "./home.css";
import { Link } from "react-router-dom";
import { IconContext } from "react-icons";
import { BsChat, BsFillPeopleFill, BsHouseFill } from "react-icons/bs";
import { FaRegEye, FaFileContract, FaRegNewspaper } from "react-icons/fa";
import { firestore } from "../../../firebase";

const Home = () => {
  const [slider, setSlider] = useState([]);

  useEffect(() => {
    firestore
      .collection("estates")
      .where("slider", "==", true)
      .get()
      .then((e) =>
        e.docs.forEach((doc) => {
          console.log(doc)
          setSlider((sl) => [...sl, doc]);
        })
      );
  }, []);

  return (
    <div>
      <Slider estates={slider} />
      <TitleHome
        pretitle="Propiedades disponibles"
        title="Destacados"
        subtitle="Encontrá la propiedad ideal para tus proyectos en AguaZarca"
        hrWidth="60px"
      />
      <div className="home-card-container">
        <Card></Card>
        <Card></Card>
        <Card></Card>
      </div>
      <TitleInfoHome />
      <TitleHome
        pretitle="DESTACADOS"
        title="Alquileres temporarios"
        subtitle="Encontra la propiedad ideal para tus vacaciones en nuestros alquileres temporarios"
        hrWidth="0px"
      />
      <div className="home-card-container">
        <Card></Card>
        <Card></Card>
        <Card></Card>
      </div>

      <ServicesHome />
    </div>
  );
};

const TitleHome = (props) => {
  let { pretitle, title, subtitle, hrWidth } = props;
  return (
    <div className="titlehome-div">
      <h3 className="titlehome-postitle">{pretitle}</h3>
      <h1 className="titlehome-title">{title}</h1>
      <hr className="titlehome-separator" style={{ width: hrWidth }} />
      <h4 className="titlehome-subtitle">{subtitle}</h4>
    </div>
  );
};

const TitleInfoHome = () => {
  let infBackgroundColor = "rgba(107,27,27,.85)";
  let backgroundStyle = {
    backgroundImage: `linear-gradient(${infBackgroundColor},${infBackgroundColor}), url(${logo})`,
  };

  return (
    <div className="titleinfohome-div" style={backgroundStyle}>
      <h6 className="titleinfohome-subtitle">¿Queres publicar en nuestra inmobiliaria?</h6>
      <h1 className="titleinfohome-title">Compra-Venta / Temporarios / Alquileres anuales</h1>
      <div className="titleinfohome-buttons">
        <Link className="menu-link" to={PUBLICAR}>
          <button className="titleinfohome-button titleinfohome-button-black">Publicar</button>
        </Link>
        <Link className="menu-link" to={CONTACTO}>
          <button className="titleinfohome-button">Contacto</button>
        </Link>
      </div>
    </div>
  );
};

const ServicesHome = () => {
  return (
    <div className="serviceshome-div">
      <div className="titlehome-div">
        <h3 className="serviceshome-postitle">Inmobiliaria</h3>
        <h1 className="titlehome-title">Servicios</h1>
        <hr className="titlehome-separator" />
        <h4 className="titlehome-subtitle">
          Desde 2005 hacemos operaciones de compra/venta, alquileres, tasaciones y asesoramiento inmobiliario en la ciudad de Villa Carlos
          Paz y alrededores.
        </h4>
      </div>
      <div className="serviceshome-feat">
        <IconContext.Provider value={{ className: "serviceshome-icons" }}>
          <div className="serviceshome-feat-item">
            <BsChat />
            <p className="serviceshome-feat-text">Consultas</p>
          </div>
          <div className="serviceshome-feat-item">
            <FaRegEye />
            <p className="serviceshome-feat-text">Tasación</p>
          </div>
          <div className="serviceshome-feat-item">
            <BsFillPeopleFill />
            <p className="serviceshome-feat-text">Intermediación</p>
          </div>
          <div className="serviceshome-feat-item">
            <BsHouseFill />
            <p className="serviceshome-feat-text">Administración de propiedades</p>
          </div>
          <div className="serviceshome-feat-item">
            <FaFileContract />
            <p className="serviceshome-feat-text">Contratos de Corretaje</p>
          </div>
          <div className="serviceshome-feat-item">
            <FaRegNewspaper />
            <p className="serviceshome-feat-text serviceshome-feat-extrainfo">Informes de estados de Dominio</p>
          </div>
        </IconContext.Provider>
      </div>
    </div>
  );
};

export default Home;
