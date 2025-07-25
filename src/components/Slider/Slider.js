import React from "react";
import "./slider.css";
import "./loading.css";
import SliderProvider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import { IconContext } from "react-icons";
import {
  BiBed,
  BiBath,
  BiBorderAll,
  BiCar,
  BiBorderNone,
  BiDice4,
  BiCoinStack,
  BiCabinet,
  BiAlarmOff,
  BiAlarm,
  BiMoon,
} from "react-icons/bi";
import { Link } from "react-router-dom";
import { PROPIEDAD } from "../../routes";

const settings = {
  dots: true,
  infinite: true,
  speed: 500,
  slidesToShow: 1,
  arrows: true,
  slidesToScroll: 1,
  className: "slides",
  centerPadding: "0px",
};

export const icons = {
  Dormitorios: <BiBed></BiBed>,
  Baños: <BiBath></BiBath>,
  "Superficie cubierta": <BiBorderAll></BiBorderAll>,
  Cocheras: <BiCar></BiCar>,
  "Superficie total": <BiBorderNone></BiBorderNone>,
  "Cantidad de pisos": <BiCoinStack></BiCoinStack>,
  Bodegas: <BiCabinet></BiCabinet>,
  Huéspedes: <BiCabinet></BiCabinet>,
  "Horario check out": <BiAlarmOff></BiAlarmOff>,
  "Horario check in": <BiAlarm></BiAlarm>,
  Camas: <BiBed></BiBed>,
  "Estadía mínima (noches)": <BiMoon></BiMoon>,
  Ambientes: <BiDice4></BiDice4>,
};

const selectedChars = ["Dormitorios", "Baños", "Superficie total"];

const Slider = ({ estates }) => {
  return (
    <SliderProvider className="slider-main" {...settings}>
      {estates[0]
        ? estates.map((estate) => {
            return <ImageSlider key={estate.data().title} uid={estate.id} propiedad={estate.data()} />;
          })
        : [<Loader key="1" />, <Loader key="2" />]}
    </SliderProvider>
  );
};

const ImageSlider = ({ propiedad, uid }) => {
  const currencyFormat = new Intl.NumberFormat("es-ES", { style: "decimal" });

  let { title, location, price, comercialStatus, characteristics } = propiedad;
  
  // selects the first image of the estate as the background image with fallback
  let style = {
    backgroundImage: propiedad.images && propiedad.images[0] 
      ? `linear-gradient(rgba(0, 0, 0, 0.3), rgba(0, 0, 0, 0.3)), url("${propiedad.images[0]}")`
      : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
  };
  
  return (
    <div>
      <div className="image-div" style={style}>
        <div className="image-container-filler"></div>
        <Link to={PROPIEDAD + uid} className="image-link image-container">
            <IconContext.Provider value={{ className: "image-icons" }}>
              <h2 className="image-title">{title}</h2>
              <h4 className="image-ubication">{`${location.city}, ${location.state}`}</h4>
              <div className="image-features">
                {selectedChars.map((key) => {
                  return (
                    <div className="image-feat-icons-div" key={key}>
                      <h5 className="image-feat-title">{key}</h5>
                      <p className="image-feat-p">
                        {icons[key]}
                        <span className={`image-text-span`}>{characteristics[key]}</span>
                      </p>
                    </div>
                  );
                })}
              </div>
              <h3 className="image-price-title">{comercialStatus}</h3>
              <p className="image-price">
                {Number(price.value) > 0
                  ? `${currencyFormat.format(price.value)} ${price.currency}`
                  : "--"}
              </p>
            </IconContext.Provider>
        </Link>
      </div>
    </div>
  );
};

export const Loader = () => (
  <div className="slider-loading">
    <div className="loading-modern">
      <div className="dot"></div>
      <div className="dot"></div>
      <div className="dot"></div>
    </div>
  </div>
);

export default Slider;
