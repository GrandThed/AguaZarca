import React from "react";
import "slick-carousel/slick/slick.css";
import SliderProvider from "react-slick";
import "./slider.css";

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

const ProductSlider = ({ images }) => {
  return (
    <SliderProvider className="slider-main" {...settings}>
      {images.map((url) => (
        <div key={url.slice(0, 20)} className="ps-container">
          <img  alt="imagen del slider" className="ps-img" src={url}></img>
        </div>
      ))}
    </SliderProvider>
  );
};

export default ProductSlider;
