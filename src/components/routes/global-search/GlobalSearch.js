import { PageTitle } from "./../../pageTitle/PageTitle";
import "./globalSearch.css";

import React, { useState, useEffect } from "react";
import { firestore } from "../../../firebase";
import Card from "../../card/Card";
import { useLocation } from "react-router-dom";

const useQuery = () => new URLSearchParams(useLocation().search);

const GlobalSearch = () => {
  const [propieties, setPropieties] = useState([]);
  const query = useQuery();
  const filterSearch = {
    operation: query.get("operation"),
    type: query.get("type"),
    locations: query.get("location"),
  };

  useEffect(() => {
    firestore
      .collection("estates")
      .get()
      .then((e) => {
        e.docs.forEach((doc) => {
          setPropieties((sl) => [...sl, doc]);
        });
      });
  }, []);
  return (
    <div >
      <PageTitle title="Resultados de busqueda"></PageTitle>
      <div className="venta-list gs-div">
        {propieties[0] ? (
          propieties
            .filter((d) => filterSearch.type === "Cualquiera" || d.data().type === filterSearch.type)
            .filter((d) => filterSearch.locations === "Cualquiera" || d.data().location.city === filterSearch.locations)
            .filter(
              (d) => filterSearch.operation === "Cualquiera" || d.data().comercialStatus === filterSearch.operation
            )
            .map((p) => <Card propiedad={p} key={p.data().uid} />)
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

export default GlobalSearch;
