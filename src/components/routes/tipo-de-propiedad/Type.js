import React, { useState, useEffect } from "react";
import { firestore } from "../../../firebase";
import { PageTitle } from "./../../pageTitle/PageTitle";
import { useParams } from "react-router-dom";
import Card from "../../card/Card";
import "react-dropdown/style.css";
import Dropdown from "react-dropdown";

import "./type.css";

const Type = () => {
  const { type } = useParams();
  //   properties
  const [propieties, setPropieties] = useState([]);
  const [filterSearch, setFilterSearch] = useState({
    operation: "Cualquiera",
    locations: "Cualquiera",
  });
  const [locations, setLocations] = useState([]);
  useEffect(() => {
    setPropieties([]);
    firestore
      .collection("estates")
      .where("type", "==", type)
      .get()
      .then((e) => {
        e.docs.forEach((doc) => {
          setPropieties((sl) => [...sl, doc]);
          setLocations((ps) => (ps.indexOf(doc.data().location.city) === -1 ? [...ps, doc.data().location.city] : ps));
        });
      });
  }, [type]);
  return (
    <div>
      <div>
        <PageTitle title={type}></PageTitle>
        <div className="temporal-search">
          <div className="temporal-dropdown-div">
            <p className="temporal-dropwdown-description">Operación</p>
            <Dropdown
              className="temporal-dropdown"
              options={["Cualquiera","Alquiler", "Alquiler temporal",  "Venta"]}
              value={filterSearch.operation}
              onChange={(e) => setFilterSearch({ ...filterSearch, operation: e.value })}
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
          {propieties[0] &&
            propieties
              .filter((d) => filterSearch.operation === "Cualquiera" || d.data().comercialStatus === filterSearch.operation)
              .filter(
                (d) => filterSearch.locations === "Cualquiera" || d.data().location.city === filterSearch.locations
              )
              .map((p) => <Card propiedad={p} />)}
        </div>
      </div>
    </div>
  );
};

export default Type;
