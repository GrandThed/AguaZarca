import React, { useState } from "react";
import { IconContext } from "react-icons";
import { BiCamera } from "react-icons/bi";
import "./card.css";
import { icons } from "../slider/Slider";
import { Link } from "react-router-dom";
import { PROPIEDAD } from "../../routes";
import { firestore } from "../../firebase";

const Card = ({ propiedad }) => {
  const data = propiedad ? propiedad.data() : false;
  return (
    <article className="card-div">
      {data ? (
        <div>
          <Link className="card-link" to={PROPIEDAD + propiedad.id}>
            <div className="card-image" style={{ backgroundImage: `url(${data.images[0]})` }}>
              <p className="card-image-counter">
                <IconContext.Provider value={{ className: "card-image-icon" }}>
                  <BiCamera />
                </IconContext.Provider>
                {data.images.length}
              </p>
              <p className="card-image-type">{data.type}</p>
            </div>
            <div className="card-content"></div>
            <CardContent propiedad={data}></CardContent>
          </Link>
        </div>
      ) : (
        <div className="card-null">
          <div className="loading">
            <div className="dot dot-1"></div>
            <div className="dot dot-2"></div>
            <div className="dot dot-3"></div>
            <div className="dot dot-4"></div>
          </div>
        </div>
      )}
    </article>
  );
};

const selectCharacteristics = {
  Casa: ["Dormitorios", "Baños", "Superficie cubierta"],
  Departamento: ["Dormitorios", "Baños", "Superficie cubierta"],
  "Terreno y lote": ["Superficie total"],
  Local: ["Superficie cubierta", "Baños"],
  "Otro inmueble": ["Superficie cubierta"],
};

const CardContent = ({ propiedad }) => {
  let { title, location, characteristics, comercialStatus, price, type } = propiedad;
  const currencyFormat = new Intl.NumberFormat("es-ES", { style: "decimal" });

  return (
    <div className="card-content-div">
      <div className="card-cont-div">
        <div className="card-cont-container-filler"></div>
        <div className="card-cont-container">
          <IconContext.Provider value={{ className: "card-cont-icons" }}>
            <h2 className="card-cont-title">{title}</h2>
            <h4 className="card-cont-ubication">{`${location.city}, ${location.state}`}</h4>
            <div className="card-cont-features">
              {(selectCharacteristics[type] || []).map((key) => {
                return (
                  <div className="card-cont-feat-icons-div" key={key}>
                    <h5 className="card-cont-feat-title">{key}</h5>
                    <p className="card-cont-feat-p">
                      {icons[key]}{" "}
                      <span
                        className={`image-text-span${
                          key === "Superficie cubierta" || key === "Superficie total" ? " m2 m2card" : ""
                        }`}
                      >
                        {parseInt(characteristics[key])}
                      </span>
                    </p>
                  </div>
                );
              })}
            </div>
            <h3 className="card-cont-price-title">{comercialStatus}</h3>
            <p className="card-cont-price">
              ${currencyFormat.format(price.value)} <span className="card-currency">{price.currency}</span>
            </p>
          </IconContext.Provider>
        </div>
      </div>
    </div>
  );
};

export const HorizontalCard = ({ propiedad }) => {
  const {
    images,
    comercialStatus,
    created,
    location,
    price,
    featured,
    mercadoLibre,
    rentalFeatured,
    slider,
    title,
    type,
  } = propiedad.data() || {};

  const [whereFreat, setWhereFreat] = useState({
    featured,
    rentalFeatured,
    slider,
  });

  const date = new Date(created.seconds * 1000);

  const handleFirebaseUpdate = (updateTerm) => {
    firestore
      .collection("estates")
      .doc(propiedad.uid)
      .get()
      .then((e) => console.log(e));
  };

  return (
    <div className="hc-main">
      <div className="hc-image" style={{ backgroundImage: `url(${images[0]})` }}></div>
      <div className="hc-body">
        <div className="hc-info">
          <div className="hc-title-div">
            <h2 className="hc-title">{title}</h2>
          </div>
          <div className="hc-status">
            <p className="hc-status-p">
              <span className="hc-status-span">{comercialStatus}</span>
              <span className="hc-status-span">{type}</span>
            </p>
          </div>
          <div className="hc-price">
            <p className="hc-price-p">
              <span className="hc-price-span">{price.value}</span>
              <span className="hc-price-span">{price.currency}</span>
              <span className="hc-date">{date.toLocaleDateString()}</span>
            </p>
          </div>
          <div className="hc-price">
            <p className="hc-price-p">
              {`${location.addressLine}, ${location.neighborhood}, ${location.city}, ${location.state}, ${location.country}`}
            </p>
          </div>
        </div>
        <div className="hc-tracks">
          <div className="hc-track-item">
            <label>SL</label>
            <input
              type="checkbox"
              checked={whereFreat.slider}
              onChange={(e) => handleFirebaseUpdate("slider", e.target.checked)}
            />
          </div>
          <div className="hc-track-item">
            <label>RF</label>
            <input
              type="checkbox"
              checked={whereFreat.rentalFeatured}
              onChange={(e) => handleFirebaseUpdate("rentalFeatured", e.target.checked)}
            />
          </div>
          <div className="hc-track-item">
            <label>FR</label>
            <input
              type="checkbox"
              checked={whereFreat.featured}
              onChange={(e) => handleFirebaseUpdate("featured", e.target.checked)}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Card;

// featured rentalFeatured slider
