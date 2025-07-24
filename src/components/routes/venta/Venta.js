import { PageTitle } from "./../../pageTitle/PageTitle";
import "./venta.css";

import React, { useState, useEffect } from "react";
import { Helmet } from "react-helmet-async";
import { firestore } from "../../../firebase";
import Card from "../../card/Card";
import EmptyState from "../../emptyState/EmptyState";
import "react-dropdown/style.css";
import Dropdown from "react-dropdown";
import { PROPERTY_TYPES } from "../../../constants/propertyTypes";

const Venta = () => {
  const [propieties, setPropieties] = useState([]);
  const [locations, setLocations] = useState([]);
  const [filterSearch, setFilterSearch] = useState({
    type: "Cualquiera",
    locations: "Cualquiera",
  });

  useEffect(() => {
    firestore
      .collection("estates")
      .where("comercialStatus", "==", "Venta")
      .get()
      .then((e) => {
        e.docs.forEach((doc) => {
          setPropieties((sl) => [...sl, doc]);
          setLocations((ps) => (ps.indexOf(doc.data().location.city) === -1 ? [...ps, doc.data().location.city] : ps));
        });
      });
  }, []);
  
  return (
    <div>
      <Helmet>
        <title>Propiedades en Venta - Villa Carlos Paz | AguaZarca Inmobiliaria</title>
        <meta 
          name="description" 
          content="Propiedades en venta en Villa Carlos Paz y alrededores. Casas, departamentos, lotes y locales comerciales. Inmobiliaria AguaZarca - Operaciones confiables desde 2005." 
        />
        
        {/* Open Graph / Facebook / WhatsApp */}
        <meta property="og:title" content="Propiedades en Venta - Villa Carlos Paz | AguaZarca" />
        <meta property="og:description" content="Descubre propiedades en venta en Villa Carlos Paz. Casas, departamentos y lotes con la confianza de AguaZarca Inmobiliaria desde 2005." />
        <meta property="og:type" content="website" />
        <meta property="og:image" content="https://aguazarca.com.ar/images/vcp-panoramica.jpg" />
        <meta property="og:image:width" content="1200" />
        <meta property="og:image:height" content="630" />
        <meta property="og:url" content="https://aguazarca.com.ar/venta" />
        <meta property="og:site_name" content="AguaZarca Inmobiliaria" />
        <meta property="og:locale" content="es_AR" />
        
        {/* Twitter Card */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Propiedades en Venta - Villa Carlos Paz" />
        <meta name="twitter:description" content="Descubre propiedades en venta en Villa Carlos Paz. Casas, departamentos y lotes con la confianza de AguaZarca Inmobiliaria." />
        <meta name="twitter:image" content="https://aguazarca.com.ar/images/vcp-panoramica.jpg" />
        
        <link rel="canonical" href="https://aguazarca.com.ar/venta" />
      </Helmet>
      <PageTitle title="Venta"></PageTitle>
      <div className="temporal-search">
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
      </div>
      <div className="venta-list">
        {propieties[0] ? (() => {
          const filtered = propieties
            .filter((d) => filterSearch.type === "Cualquiera" || d.data().type === filterSearch.type)
            .filter((d) => filterSearch.locations === "Cualquiera" || d.data().location.city === filterSearch.locations);
          return filtered.length ? (
            filtered.map((p, i) => <Card key={i} propiedad={p} />)
          ) : (
            <EmptyState />
          );
        })() : (
          <>
            <Card />
            <Card />
            <Card />
          </>
        )}
      </div>
    </div>
  );
};

export default Venta;
