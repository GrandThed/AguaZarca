import React from "react";
import { PageTitle } from "./../../pageTitle/PageTitle";
import { IconContext } from "react-icons";
import "./contacto.css";
import {
  RiPhoneLine,
  RiMailLine,
  RiMapPinLine,
  RiWhatsappLine,
} from "react-icons/ri";

// probably a total mess u.u

const Contacto = () => {
  return (
    <div>
      <PageTitle title="Contacto"></PageTitle>
      <div className="contact-background">
        <div className="contact-div">
          <ContactForm></ContactForm>
          <ContactInfo></ContactInfo>
        </div>
      </div>
    </div>
  );
};
export default Contacto;

const ContactForm = () => {
  const handleInvalid = (invalid) => {
    invalid.preventDefault();
    invalid.target.classList.add("invalid");
  };

  const handleSubmit = (event) => {
    event.preventDefault();
  };
  const resetInvalid = (event) => {
    if (event.target.value !== "") {
      event.target.classList.remove("invalid");
    }
  };
  return (
    <div className="contact-form-div">
      <form
        onSubmit={(event) => handleSubmit(event)}
        className="contact-form-form"
      >
        <label>
          <h4 className="form-subtitles">Nombre</h4>
          <input
            name="name"
            onChange={(event) => resetInvalid(event)}
            onInvalid={(invalid) => handleInvalid(invalid)}
            className="contact-field contact-field-input"
            type="name"
            autoFocus
            required
          />
        </label>
        <br />
        <label>
          <h4 className="form-subtitles">Correo Electrónico</h4>
          <input
            name="email"
            onChange={resetInvalid}
            onInvalid={(invalid) => handleInvalid(invalid)}
            className="contact-field contact-field-input"
            type="email"
          />
        </label>
        <br />
        <label>
          <h4 className="form-subtitles">Número de teléfono</h4>
          <input
            name="phone"
            onChange={resetInvalid}
            onInvalid={(invalid) => handleInvalid(invalid)}
            className="contact-field contact-field-input"
            type="number"
          />
        </label>
        <br />
        <label>
          <h4 className="form-subtitles">Mensaje</h4>
          <textarea
            name="mesage"
            onChange={resetInvalid}
            onInvalid={(invalid) => handleInvalid(invalid)}
            className="contact-field contact-field-textarea"
            rows="10"
            required
          />
        </label>
        <br />

        <input className="contact-form-submit" type="submit" value="Enviar" />
      </form>
    </div>
  );
};

const ContactInfo = () => {
  return (
    <div className="contact-info-div">
      <IconContext.Provider value={{ className: "contact-icons" }}>
        <div className="contact-info-container">
          <div className="contact-info-subtitles">
            <RiPhoneLine></RiPhoneLine>
            <h4 className="contact-info-title">Móvil</h4>
          </div>
          <p className="contact-info-text">+54 35415659041</p>
        </div>
        <div className="contact-info-container">
          <div className="contact-info-subtitles">
            <RiWhatsappLine></RiWhatsappLine>
            <h4 className="contact-info-title">Whatsapp</h4>
          </div>
          <p className="contact-info-text">+54 9 351 789-6825</p>
        </div>
        <div className="contact-info-container">
          <div className="contact-info-subtitles">
            <RiMailLine></RiMailLine>
            <h4 className="contact-info-title">Correo Electrónico</h4>
          </div>
          <p className="contact-info-text">gillio.inmo@gmail.com</p>
        </div>
        <div className="contact-info-container">
          <div className="contact-info-subtitles">
            <RiMapPinLine></RiMapPinLine>
            <h4 className="contact-info-title">Dirección</h4>
          </div>
          <p className="contact-info-text">
            López y Planes, Villa Carlos Paz, Córdoba, Argentina
          </p>
        </div>
      </IconContext.Provider>
    </div>
  );
};


