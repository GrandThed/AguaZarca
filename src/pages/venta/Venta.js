import { PageTitle } from "./../../pageTitle/PageTitle";
import "./venta.css";

import React, { useState, useEffect } from "react";
import { firestore } from "../../../firebase";
import Card from "../../card/Card";
import "react-dropdown/style.css";
import Dropdown from "react-dropdown";

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
      <PageTitle title="Venta"></PageTitle>
      <div className="temporal-search">
        <div className="temporal-dropdown-div">
          <p className="temporal-dropwdown-description">Tipo de propiedad</p>
          <Dropdown
            className="temporal-dropdown"
            options={["Cualquiera", "Casa", "Departamento", "Terreno y lote"]}
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
        {propieties[0] ? (
          propieties
            .filter((d) => filterSearch.type === "Cualquiera" || d.data().type === filterSearch.type)
            .filter((d) => filterSearch.locations === "Cualquiera" || d.data().location.city === filterSearch.locations)
            .map((p, i) => <Card key={i} propiedad={p} />)
        ) : (
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
