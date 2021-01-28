import React from "react";
import { IconContext } from "react-icons";
import { BiCamera } from "react-icons/bi";
import "./card.css";
import { icons } from "../slider/Slider";

const Card = ({ propiedad }) => {

  return (
    <div className="card-div">
      {propiedad ? (
        <div>
          <div className="card-image" style={{ backgroundImage: `url(${propiedad.images[0]})` }}>
            <p className="card-image-counter">
              <IconContext.Provider value={{ className: "card-image-icon" }}>
                <BiCamera />
              </IconContext.Provider>
              {propiedad.images.length}
            </p>
            <p className="card-image-type">{propiedad.type}</p>
          </div>
          <div className="card-content"></div>
          <CardContent propiedad={propiedad}></CardContent>
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
    </div>
  );
};

const CardContent = ({ propiedad }) => {
  let { title, location, characteristics, comercialStatus, price } = propiedad;

  return (
    <div className="card-content-div">
      <div className="card-cont-div">
        <div className="card-cont-container-filler"></div>
        <div className="card-cont-container">
          <IconContext.Provider value={{ className: "card-cont-icons" }}>
            <h2 className="card-cont-title">{title}</h2>
            <h4 className="card-cont-ubication">{`${location.city}, ${location.estate}`}</h4>
            <div className="card-cont-features">
              {Object.keys(characteristics)
                .slice(0, 3)
                .map((key) => {
                  return (
                    <div className="card-cont-feat-icons-div" key={key}>
                      <h5 className="card-cont-feat-title">{key}</h5>
                      <p className="card-cont-feat-p">
                        {icons[key]}{" "}
                        <span className={`image-text-span${key === "Superficie cubierta" ? " m2 m2card" : ""}`}>
                          {characteristics[key]}
                        </span>
                      </p>
                    </div>
                  );
                })}
            </div>
            <h3 className="card-cont-price-title">{comercialStatus}</h3>
            <p className="card-cont-price">
              ${price.value} <span className="card-currency">{price.currency}</span>
            </p>
          </IconContext.Provider>
        </div>
      </div>
    </div>
  );
};

export default Card;
