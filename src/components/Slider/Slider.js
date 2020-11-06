import React from "react";
import "./slider.css";
import propiedad1 from "../../propiedadejem";
import SliderProvider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import { Component } from "react";
import { IconContext } from "react-icons";
import {
  BiBed,
  BiBath,
  BiBorderAll,
  BiCar,
  BiBorderNone,
} from "react-icons/bi";

class Slider extends Component {
  render() {
    const settings = {
      dots: false,
      infinite: true,
      speed: 500,
      slidesToShow: 1,
      arrows: true,
      slidesToScroll: 1,
      className: "slides",
      centerPadding: "0px",
    };
    return (
      <SliderProvider {...settings}>
        <div>
          <ImageSlider
            image={propiedad1[0].image[0]}
            propiedad={propiedad1[0]}
          ></ImageSlider>
        </div>
        <div>
          <ImageSlider
            image={propiedad1[0].image[1]}
            propiedad={propiedad1[0]}
          ></ImageSlider>
        </div>
      </SliderProvider>
    );
  }
}

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

const ImageSlider = (props) => {
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
    <div>
      <div className="image-div" style={style}>
        <div className="image-container-filler"></div>
        <div className="image-container">
          <IconContext.Provider value={{ className: "image-icons" }}>
            <h2 className="image-title">{propiedad.title}</h2>
            <h4 className="image-ubication">{propiedad.ubication}</h4>
            <div className="image-features">
              {sliderFeatureskeys.map((key) => {
                return (
                  <div className="image-feat-icons-div" key={key}>
                    <h5 className="image-feat-title">{title[key]}</h5>
                    <p className="image-feat-p">
                      {icon[key]}{" "}
                      <span className={`image-text-span${key === "covered" ? " m2" : ""}`}>
                        {sliderFeatures[key]}
                      </span>
                    </p>
                  </div>
                );
              })}
            </div>
            <h3 className="image-price-title">{propiedad.type}</h3>
            <p className="image-price">
              ${propiedad.value} {propiedad.currency}
            </p>
          </IconContext.Provider>
        </div>
      </div>
    </div>
  );
};

const objSlice = (obj, start, end) => {
  return Object.keys(obj)
    .slice(start, end)
    .map((key) => ({ [key]: obj[key] }));
};

export default Slider;
