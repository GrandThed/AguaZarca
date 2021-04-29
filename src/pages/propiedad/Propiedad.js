import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { firestore } from "../../../firebase";
import mapboxgl from "mapbox-gl";
import ProductSlider from "../../slider/ProductSlider";
import "./propiedad.css";
import { icons } from "../../slider/Slider";
import { IconContext } from "react-icons";

import { GoCheck } from "react-icons/go";

mapboxgl.accessToken = process.env.REACT_APP_MAP_API_KEY;

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
    <div className="inm-div">
      <InmuebleBody document={doc} />
    </div>
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
  return (
    <>
      <div className="inm-spacer" />
      <div className="inm-title-div">
        <div className="inm-title-left">
          <h6 className="inm-pretitle">{`${type} en ${comercialStatus}`}</h6>
          <h1 className="inm-title">{title}</h1>
          <h3 className="inm-subtitle">{`${addressLine}, ${neighborhood}, ${city}, ${state}, ${country}`}</h3>
        </div>
        <div className="inm-title-right">
          <h5 className="inm-type">{comercialStatus}</h5>
          <p className="inm-price">{`$ ${formatter.format(price.value)} ${price.currency}`}</p>
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
