import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { firestore } from "../../../firebase";
import mapboxgl from "mapbox-gl";
import ProductSlider from "../../slider/ProductSlider";
import "./propiedad.css";
import { icons } from "../../slider/Slider";
import { IconContext } from "react-icons";
import Breadcrumb from "../../breadcrumb/Breadcrumb";
import { HOME } from "../../../routes";

import { GoCheck } from "react-icons/go";

mapboxgl.accessToken = process.env.REACT_APP_MAP_API_KEY;

// Generate structured data for real estate
const generatePropertyStructuredData = (property) => {
  if (!property || !property.location) return null;

  const baseUrl = "https://aguazarca.com.ar";
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "RealEstateListing",
    "name": property.title,
    "description": property.description,
    "url": `${baseUrl}/propiedad/${property.id}`,
    "image": property.images?.map(img => `${baseUrl}${img}`) || [],
    "offers": {
      "@type": "Offer",
      "price": property.price?.value || 0,
      "priceCurrency": property.price?.currency || "ARS",
      "availability": "https://schema.org/InStock",
      "seller": {
        "@type": "RealEstateAgent",
        "name": property.agent?.name || "AguaZarca Inmobiliaria",
        "telephone": property.agent?.phone || "3541 7896-825"
      }
    },
    "address": {
      "@type": "PostalAddress",
      "streetAddress": property.location?.address || "",
      "addressLocality": property.location?.city || "",
      "addressRegion": property.location?.state || "",
      "addressCountry": property.location?.country || "AR"
    },
    "geo": property.location?.coordinates ? {
      "@type": "GeoCoordinates",
      "latitude": property.location.coordinates.lat,
      "longitude": property.location.coordinates.lng
    } : undefined,
    "numberOfRooms": property.characteristics?.bedrooms || undefined,
    "numberOfBathroomsTotal": property.characteristics?.bathrooms || undefined,
    "floorSize": property.characteristics?.covered_area ? {
      "@type": "QuantitativeValue",
      "value": property.characteristics.covered_area,
      "unitCode": "MTK"
    } : undefined,
    "category": property.type || "Propiedad"
  };

  return JSON.stringify(structuredData, null, 2);
};

const Propiedad = (props) => {
  const [doc, setDoc] = useState({});
  const { id } = useParams();
  useEffect(() => {
    firestore
      .collection("estates")
      .doc(id)
      .get()
      .then((e) => setDoc(e.data()));
  }, [id]);

  return doc.location ? (
    <main className="inm-div" role="main">
      <Helmet>
        <title>{doc.title} - {doc.location?.city} | AguaZarca Inmobiliaria</title>
        <meta 
          name="description" 
          content={`${doc.title} en ${doc.location?.city}. ${doc.description?.substring(0, 150)}... Inmobiliaria AguaZarca.`} 
        />
        <meta property="og:title" content={`${doc.title} - ${doc.location?.city}`} />
        <meta property="og:description" content={doc.description?.substring(0, 200)} />
        <meta property="og:type" content="website" />
        <meta property="og:image" content={doc.images?.[0]} />
        <link rel="canonical" href={`https://aguazarca.com.ar/propiedad/${id}`} />
        {generatePropertyStructuredData({...doc, id}) && (
          <script type="application/ld+json">
            {generatePropertyStructuredData({...doc, id})}
          </script>
        )}
      </Helmet>
      <InmuebleBody document={doc} />
    </main>
  ) : (
    <div className="c-loader" />
  );
};

const InmuebleBody = (props) => {
  const {
    agent,
    attributes,
    characteristics,
    comercialStatus,
    description,
    images,
    location,
    price,
    title,
    type,
  } = props.document;
  const { addressLine, city, country, neighborhood, state } = location;
  // Generate breadcrumb items
  const breadcrumbItems = [
    { name: 'Inicio', url: HOME },
    { name: comercialStatus === 'Venta' ? 'Propiedades en Venta' : 'Alquileres', url: comercialStatus === 'Venta' ? '/venta' : '/alquiler-anual' },
    { name: title, url: null } // Current page, no URL
  ];

  return (
    <>
      <Breadcrumb items={breadcrumbItems} />
      <div className="inm-spacer" />
      <div className="inm-title-div">
        <div className="inm-title-left">
          <h6 className="inm-pretitle">{`${type} en ${comercialStatus}`}</h6>
          <h1 className="inm-title">{title}</h1>
          <h3 className="inm-subtitle">{`${addressLine}, ${neighborhood}, ${city}, ${state}, ${country}`}</h3>
        </div>
        <div className="inm-title-right">
          <h5 className="inm-type">{comercialStatus}</h5>
          <p className="inm-price">
            {Number(price.value) > 0
              ? `$ ${formatter.format(price.value)} ${price.currency}`
              : "--"}
          </p>
        </div>
      </div>
      <div className="inm-slider">
        <ProductSlider images={images} />
      </div>
      <div className="inm-placement">
        <div className="inm-body">
          <div className="inm-body-char">
            <DoCharList charList={characteristics} />
          </div>
          <div className="inm-description">
            <h2 className="inm-desc-title">Descripción</h2>
            <p className="inm-desc-text">{description}</p>
          </div>
          <div className="inm-att">
            <h2 className="inm-att-title">Prestaciones</h2>
            <div className="inm-body-att">
              <DoAttList attList={attributes} />
            </div>
          </div>
        </div>
        <div className="inm-sidebar">
          <div className="inm-agent-info">
            <div>
              <img className="inm-agent-img" src={agent.imageURL} alt="" />
            </div>
            <div className="inm-agent-contact">
              <div>
                <h3 className="inm-agent-name">Agente {agent.username}</h3>
              </div>
              <div className="inm-agent-contact-container">
                <div className="inm-agent-contact-info">
                  <p className="inm-agent-text">movil :</p>
                  <p>{agent.phonenumber}</p>
                </div>
                <div className="inm-agent-contact-info">
                  <p className="inm-agent-text">WhatsApp : </p>
                  <p>{agent.wspnumber}</p>
                </div>
                <div className="inm-agent-contact-info">
                  <p className="inm-agent-text">Correo electronico : </p>
                  <p className="inm-agent-email">{agent.email}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Propiedad;

const DoCharList = ({ charList }) => {

  return (
    <IconContext.Provider value={{ className: "inm-char-icons" }}>
      {Object.keys(charList).map(
        (key) =>
        charList[key] && (
            <div key={key} className="inm-body-char-div">
              <p className="inm-char-p">{key}</p>
              <div className="inm-char-info">
                <p className="inm-char-number">
                  {icons[key]}
                  {charList[key]}
                </p>
              </div>
            </div>
          )
      )}
    </IconContext.Provider>
  );
};

const DoAttList = ({ attList }) => {
  return (
    <IconContext.Provider value={{ className: "inm-feat-icons inm-feat-true" }}>
      {Object.keys(attList).map(
        (key) =>
          attList[key] && (
            <div key={key} className="inm-body-att-div">
              <GoCheck /> {key}
            </div>
          )
      )}
    </IconContext.Provider>
  );
};

var formatter = new Intl.NumberFormat("en-US", {});
