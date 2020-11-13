import React from "react";
import { FullMenu } from "./FullMenu";
import "./menu.css";
import Media from "react-media";
import { MediumMenu } from "./MediumMenu";
import { MobileMenu } from "./MobileMenu";
// min : 768px
// min : 768px max : 1139px
// max : 1139
const queries = {
  small: "(max-width : 768px)",
  medium: "(min-width : 769px) and (max-width : 1139px)",
  large: "(min-width : 1140px)"
};
// setInterval(() => console.log(window.location), 8000)
export const Menu = () => {
  return (
    <div id="menu">
    <Media queries={queries}>
      {matches => (
        <>
          {matches.small && <MobileMenu></MobileMenu>}
          {matches.medium && <MediumMenu></MediumMenu>}
          {matches.large && <FullMenu></FullMenu>}
        </>
      )}
    </Media>
  </div>
  );
};
