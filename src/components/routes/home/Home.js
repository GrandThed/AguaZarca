import React, { useState, useEffect } from "react";
import { Helmet } from "react-helmet-async";
import Slider from "../../slider/Slider";
import Card from "../../card/Card";
import logo from "./../../../images/vcp-panoramica.jpg";
import { CONTACTO, PUBLICAR } from "../../../routes";
import "./home.css";
import { Link } from "react-router-dom";
import { IconContext } from "react-icons";
import { BsChat, BsFillPeopleFill, BsHouseFill } from "react-icons/bs";
import { FaRegEye, FaFileContract, FaRegNewspaper } from "react-icons/fa";
import { BiSearch } from "react-icons/bi";
import { firestore } from "../../../firebase";
import "react-dropdown/style.css";
import Dropdown from "react-dropdown";
import { BUSQUEDA_GLOBAL } from "../../../routes";
import { PROPERTY_TYPES } from "../../../constants/propertyTypes";

const Home = () => {
  const [slider, setSlider] = useState([]);
  const [filterSearch, setFilterSearch] = useState({
    operation: "Cualquiera",
    type: "Cualquiera",
    locations: "Cualquiera",
  });
  const [locations, setLocations] = useState([]);
  const [featureds, setFeatureds] = useState([]);
  const [rentalFeatureds, setRentalFeatureds] = useState([]);
  const [resultsCount, setResultsCount] = useState(0);

  useEffect(() => {
    firestore
      .collection("estates")
      .where("slider", "==", true)
      .get()
      .then((e) =>
        e.docs.forEach((doc) => {
          setSlider((sl) => [...sl, doc]);
        })
      );
  }, []);

  useEffect(() => {
    firestore
      .collection("estates")
      .get()
      .then((e) => {
        e.docs.forEach((doc) => {
          let data = doc.data();
          if (data.featured) {
            setFeatureds((ps) => [...ps, doc]);
          }
          if (data.rentalFeatured) {
            setRentalFeatureds((ps) => [...ps, doc]);
          }
          setLocations((ps) => (ps.indexOf(data.location.city) === -1 ? [...ps, data.location.city] : ps));
        });
      });
  }, []);

  useEffect(() => {
    let query = firestore.collection("estates");
    if (filterSearch.operation !== "Cualquiera") {
      query = query.where("comercialStatus", "==", filterSearch.operation);
    }
    if (filterSearch.type !== "Cualquiera") {
      query = query.where("type", "==", filterSearch.type);
    }
    if (filterSearch.locations !== "Cualquiera") {
      query = query.where("location.city", "==", filterSearch.locations);
    }
    query.get().then((snap) => setResultsCount(snap.size));
  }, [filterSearch]);

  return (
    <main role="main">
      <Helmet>
        <title>AguaZarca Inmobiliaria - Propiedades en Villa Carlos Paz | Venta y Alquiler</title>
        <meta 
          name="description" 
          content="Inmobiliaria AguaZarca en Villa Carlos Paz. Compra, venta y alquiler de propiedades. Casas, departamentos y lotes desde 2005. Operaciones confiables y asesoramiento profesional." 
        />
        <meta property="og:title" content="AguaZarca Inmobiliaria - Propiedades en Villa Carlos Paz" />
        <meta property="og:description" content="Inmobiliaria líder en Villa Carlos Paz. Propiedades en venta y alquiler. Servicios inmobiliarios profesionales desde 2005." />
        <meta property="og:type" content="website" />
        <meta property="og:image" content="/images/vcp-panoramica.jpg" />
        <link rel="canonical" href="https://aguazarca.com.ar/" />
      </Helmet>
      {slider.length > 0 && <Slider estates={slider} />}
      <div className="temporal-search temporal-search-menu">
        <div className="temporal-dropdown-div">
          <p className="temporal-dropwdown-description">Operación</p>
          <Dropdown
            className="temporal-dropdown"
            options={["Cualquiera", "Alquiler", "Alquiler temporal", "Venta", "Local comercial"]}
            value={filterSearch.operation}
            onChange={(e) => setFilterSearch({ ...filterSearch, operation: e.value })}
          />
        </div>
        <div className="temporal-dropdown-div">
          <p className="temporal-dropwdown-description">Tipo de propiedad</p>
          <Dropdown
            className="temporal-dropdown"
            options={["Cualquiera", ...PROPERTY_TYPES]}
            value={filterSearch.type}
            onChange={(e) => setFilterSearch({ ...filterSearch, type: e.value })}
          />
        </div>
        <div className="temporal-dropdown-div temporal-dropdown-div-right">
          <p className="temporal-dropwdown-description">Ubicación</p>
          <Dropdown
            className="temporal-dropdown"
            options={["Cualquiera", ...locations.sort()]}
            value={filterSearch.locations}
            onChange={(e) => setFilterSearch({ ...filterSearch, locations: e.value })}
          />
        </div>
        <Link
          to={`${BUSQUEDA_GLOBAL}?operation=${filterSearch.operation}&type=${filterSearch.type}&location=${filterSearch.locations}`}
          className="temporal-search-link"
        >
          <div className="temporal-search-button">
            <IconContext.Provider value={{ className: "temporal-search-icons" }}>
              <BiSearch />
            </IconContext.Provider>
            <span className="temporal-search-count">{resultsCount} resultados</span>
          </div>
        </Link>
      </div>
      <TitleHome
        pretitle="Propiedades disponibles"
        title="Destacados"
        subtitle="Encontrá la propiedad ideal para tus proyectos en AguaZarca"
        hrWidth="60px"
      />
      <div className="home-card-container">
        {featureds.slice(0, 3).map((e, i) => (
          <Card propiedad={e} key={i} />
        ))}
      </div>
      <TitleInfoHome />
      <TitleHome
        pretitle="DESTACADOS"
        title="Alquileres temporarios"
        subtitle="Encontra la propiedad ideal para tus vacaciones en nuestros alquileres temporarios"
        hrWidth="0px"
      />
      <div className="home-card-container">
        {rentalFeatureds.slice(0, 3).map((e, i) => (
          <Card propiedad={e} key={i} />
        ))}
      </div>
      <ServicesHome />
    </main>
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
          Desde 2005 hacemos operaciones de compra/venta, alquileres, tasaciones y asesoramiento inmobiliario en la
          ciudad de Villa Carlos Paz y alrededores.
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
