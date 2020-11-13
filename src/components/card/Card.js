import React from "react";
import {IconContext} from 'react-icons'
import {BiCamera, BiBed, BiBath, BiBorderAll, BiCar, BiBorderNone} from "react-icons/bi";
import "./card.css"

const Card = (props) => {
  let propiedad = props.propiedad[0];
  return (
    <div className="card-div">
      <div
        className="card-image"
        style={{ backgroundImage: `url(${propiedad.image[0]})` }}
      >
        <p className="card-image-counter">
        <IconContext.Provider value={{ className: "card-image-icon" }}>
          <BiCamera />
          </IconContext.Provider>
          {propiedad.image.length}
        </p>
        <p className="card-image-type">{propiedad.type}</p>
      </div>
     <div className="card-content">

     </div>
      <CardContent propiedad={propiedad}></CardContent>
    </div>
  );
};

const icon = {
    rooms: <BiBed></BiBed>,
    bathrooms: <BiBath></BiBath>,
    covered: <BiBorderAll></BiBorderAll>,
    parkslot: <BiCar></BiCar>,
    totalTerrain: <BiBorderNone></BiBorderNone>,
  };
  
  const title = {
    rooms: "Habitaciones",
    bathrooms: "Cuartos de baño",
    covered: "Cubierto",
    parkslot: "Estacionamientos",
    totalTerrain: "Terreno total",
  };
  Object.freeze(icon);
  Object.freeze(title);

const CardContent = (props) => {
    let propiedad = props.propiedad;
    let sliderFeatures = objSlice(propiedad.features, 0, 3);
    sliderFeatures = sliderFeatures.reduce((acc, value) => {
      acc = { ...acc, ...value };
      return acc;
    });
    let style = {
      backgroundImage: `url("${props.image}")`,
    };
    
    let sliderFeatureskeys = Object.keys(sliderFeatures);
    return (
      <div className="card-content-div">
        <div className="card-cont-div" style={style}>
          <div className="card-cont-container-filler"></div>
          <div className="card-cont-container">
            <IconContext.Provider value={{ className: "card-cont-icons" }}>
              <h2 className="card-cont-title">{propiedad.title}</h2>
              <h4 className="card-cont-ubication">{propiedad.ubication}</h4>
              <div className="card-cont-features">
                {sliderFeatureskeys.map((key) => {
                  return (
                    <div className="card-cont-feat-icons-div" key={key}>
                      <h5 className="card-cont-feat-title">{title[key]}</h5>
                      <p className="card-cont-feat-p">
                        {icon[key]}{" "}
                        <span className={`image-text-span${key === "covered" ? " m2 m2card" : ""}`}>
                          {sliderFeatures[key]}
                        </span>
                      </p>
                    </div>
                  );
                })}
              </div>
              <h3 className="card-cont-price-title">{propiedad.type}</h3>
              <p className="card-cont-price">
                ${propiedad.value} <span className="card-currency">{propiedad.currency}</span>
              </p>
            </IconContext.Provider>
          </div>
        </div>
      </div>
    );
  };

export default Card;

const objSlice = (obj, start, end) => {
    return Object.keys(obj)
      .slice(start, end)
      .map((key) => ({ [key]: obj[key] }));
  };
  