import React from "react";
import SliderProvider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import "./slider.css";

const settings = {
  dots: true,
  infinite: false,
  speed: 500,
  slidesToShow: 3,
  slidesToScroll: 1,
  className: "slides",
  centerPadding: "0px",
};

const AvailableDatesSlider = ({ dates = [] }) => {
  if (!dates.length) return null;
  return (
    <SliderProvider className="slider-main" {...settings}>
      {dates.map((d) => (
        <div key={d} className="dates-slide">
          {new Date(d).toLocaleDateString()}
        </div>
      ))}
    </SliderProvider>
  );
};

export default AvailableDatesSlider;
