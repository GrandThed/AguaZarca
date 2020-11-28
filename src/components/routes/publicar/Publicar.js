import React, { useState, useEffect, useReducer } from "react";
import { PageTitle } from "./../../pageTitle/PageTitle";
import axios from "axios";
import Dropdown from "react-dropdown";
import "react-dropdown/style.css";
import "./publicar.css";

/* 
  ***************************         ******************************
  *************************** Reducer ******************************
  ***************************         ******************************
*/

const reducer = (state, action) => {
  switch (action.type) {
    case "field":
      return {
        ...state,
        [action.field]: action.value,
      };
    case "charact":
      return {
        ...state,
        characteristics: {
          ...state.characteristics,
          [action.field]: action.value,
        },
      };
    case "feature":
      return {
        ...state,
        attributes: {
          ...state.attributes,
          [action.field]: action.value,
        },
      };
    case "toggleField":
      return {
        ...state,
        [action.field]: !state[action.field],
      };
    case "changeField":
      return {
        ...state,
        [action.field]: action.value,
      };
    case "setLocation":
      return {
        ...state,
        location: {
          ...state.location,
          [action.field]: action.value,
        },
      };
    case "setPrice":
      return {
        ...state,
        price: {
          ...state.price,
          [action.field]: action.value,
        },
      };
    case "fullfilWithML":
      return {
        ...state,
        ...action.value,
      };
    default:
      return state;
  }
};

/* 
  ***************************                         ******************************
  *************************** Functions and variables ******************************
  ***************************                         ******************************
*/
const attributes = [
  "Acceso a internet",
  "Agua corriente",
  "Aire acondicionado",
  "Alarma",
  "Altillo",
  "Apto crédito",
  "Apto profesional",
  "Balcón",
  "Calefacción",
  "Chimenea",
  "Cocina",
  "Comedor",
  "Dependencia de servicio",
  "Dormitorio en suite",
  "Estudio",
  "Forestación",
  "Gimnasio",
  "Jacuzzi",
  "Living",
  "Gas natural",
  "Luz eléctrica",
  "Línea telefónica",
  "Patio",
  "Pileta",
  "Placards",
  "Playroom",
  "Portón automático",
  "Seguridad 24 horas",
  "Terraza",
  "Toilette",
  "Vestidor",
  "Parrilla",
  "Tour virtual",
  "Lavadero",
];

const characteristics = [
  "Dormitorios",
  "Superficie cubierta",
  "Cantidad de pisos",
  "Baños",
  "Cocheras",
  "Superficie total",
  "Bodegas",
];

const setInitialState = (array, value) => {
  return array.reduce((acc, e) => {
    acc = { ...acc, [camelizeText(e)]: value };
    return acc;
  }, {});
};
const camelizeText = (str) => {
  return str
    .toLowerCase()
    .replace(/[^a-zA-Z0-9]+(.)/g, (m, chr) => chr.toUpperCase());
};

const convertObjToListInAttributes = (array) => {
  let arrayKeys = array.reduce((acc, e) => {
    acc = { ...acc, [camelizeText(e.name)]: e.value_name === "Sí" };
    return acc;
  }, {});
  return arrayKeys;
};

const convertObjToListInCharacteristics = (array) => {
  let arrayKeys = array.reduce((acc, e) => {
    acc = { ...acc, [camelizeText(e.name)]: e.value_name };
    return acc;
  }, {});
  return arrayKeys;
};

const initialState = {
  mercadolibre: {
    id: "",
    link: "",
  },
  title: "",
  description: "",
  type: "",
  comercialStatus: "",
  locationShorcut: "",
  price: {
    value: 0,
    currency: "",
  },
  images: [],
  characteristics: setInitialState(characteristics, ""),
  attributes: setInitialState(attributes, false),
  featured: false,
  revisorMesagge: "",
  location: {
    addressLine: "",
    neighborhood: "",
    city: "",
    state: "Córdoba",
    country: "Argentina",
  },
};

const dropdownVariables = {
  type: ["Departamento", "Hotel", "Local comercial"],
  status: ["Alquiler temporal", "Alquiler anual", "vendido"],
  correncyOptions: ["USD", "ARS", "EUR"],
};

const fetchEffect = async (itemId) => {
  let response;
  try {
    response = await axios(`https://api.mercadolibre.com/items/${itemId}`);
  } catch (e) {
    response = e;
  }
  return response;
};

const mlFullfil = (data, att, chr) => {
  let location = data.location;
  let attributes = data.attributes;
  let attListml = convertObjToListInAttributes([...attributes.slice(0, 30), attributes[41]]);
  console.log(attListml)
  console.log(setInitialState(att, false))
  let charListml = convertObjToListInCharacteristics(attributes.slice(30, 37));

  let filled = {
    mercadolibre: {
      id: data.id,
      link: data.permalink,
    },
    title: data.title,
    description: "",
    type: attributes[39].value_name,
    comercialStatus: attributes[37].value_name,
    price: {
      value: data.price,
      currency: data.currency_id,
    },
    images: [],
    characteristics: charListml,
    attributes: attListml,
    featured: false,
    revisorMesagge: "",
    location: {
      addressLine: location.address_line,
      neighborhood: location.neighborhood.name,
      city: location.city.name,
      state: location.state.name,
      country: location.country.name,
    },
  };
  return filled;
};

/* 
  ***************************           ******************************
  *************************** Component ******************************
  ***************************           ******************************
*/

export const Publicar = () => {
  let [input, setInput] = useState("");
  let [autofill, setAutofill] = useState(false);
  const [state, dispatch] = useReducer(reducer, initialState);
  useEffect(() => {
    let isSubscribed = true;
    const regexMLurl = /([A-Z]{3})-(\d+)/;
    let [itemIdurl] = input.match(regexMLurl) || [""];
    itemIdurl = itemIdurl.replace("-", "");
    if (itemIdurl) {
      fetchEffect(itemIdurl).then((estate) => {
        if (isSubscribed) {
          dispatch({
            type: "fullfilWithML",
            value: mlFullfil(estate.data, attributes, characteristics),
          });
          // console.log(mlFullfil(estate.data));
        }
      });
    }
    return () => (isSubscribed = false);
  }, [input]);

  return (
    <div className="publish-div">
      <PageTitle title="Publicar"></PageTitle>
      {console.log(state)}
      <div className="publish-form">
        <label htmlFor="autofill">AutoFill con Mercado libre</label>
        <input
          type="checkbox"
          value={autofill}
          onChange={(e) => setAutofill(e.target.checked)}
          name="autofill"
        />
        {autofill ? (
          <div>
            <label htmlFor="mlurl">URL de MercadoLibre</label>
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              name="mlurl"
            />
          </div>
        ) : null}

        <form>
          <div className="publish-form-title-price-div">
            <div>
              <label htmlFor="title">Título de la propiedad</label>
              <input name="title" type="text" value={state.title} onChange={(e) => dispatch({type: "changeField", value: e.target.value})}/>
            </div>
            <div className="publish-form-title-price">
              <label htmlFor="price">Precio</label>
              <input type="number" name="price" />
              <Dropdown
                options={dropdownVariables.correncyOptions}
                value={dropdownVariables.correncyOptions[0]}
                onChange={(e) =>
                  dispatch({
                    type: "setPrice",
                    field: "currency",
                    value: e.value,
                  })
                }
              ></Dropdown>
            </div>
          </div>

          <label htmlFor="description">descripcion</label>
          <textarea name="description" type="text" />
          <Dropdown
            options={dropdownVariables.type}
            value={dropdownVariables.type[0]}
            onChange={(e) =>
              dispatch({ type: "changeField", field: "type", value: e.value })
            }
          ></Dropdown>
          <Dropdown
            options={dropdownVariables.status}
            value={dropdownVariables.status[0]}
            onChange={(e) =>
              dispatch({
                type: "changeField",
                field: "comercialStatus",
                value: e.value,
              })
            }
          ></Dropdown>
          <div className="publish-form-location">
            <div className="publish-form-location-div">
              <label
                htmlFor="address_line"
                className="publish-form-location-label publish-form-label"
              >
                Direccion
              </label>
              <input
                type="text"
                name="address_line"
                value={state.location.addressLine}
                onChange={(e) =>
                  dispatch({
                    type: "setLocation",
                    field: "addressLine",
                    value: e.target.value,
                  })
                }
              />
            </div>
            <div className="publish-form-location-div">
              <label
                htmlFor="neighborhood"
                className="publish-form-location-label publish-form-label"
              >
                Barrio
              </label>
              <input
                type="text"
                name="neighborhood"
                value={state.location.neighborhood}
                onChange={(e) =>
                  dispatch({
                    type: "setLocation",
                    field: "neighborhood",
                    value: e.target.value,
                  })
                }
              />
            </div>
            <div className="publish-form-location-div">
              <label
                htmlFor="city"
                className="publish-form-location-label publish-form-label"
              >
                Ciudad
              </label>
              <input
                type="text"
                name="city"
                value={state.location.city}
                onChange={(e) =>
                  dispatch({
                    type: "setLocation",
                    field: "city",
                    value: e.target.value,
                  })
                }
              />
            </div>
            <div className="publish-form-location-div">
              <label
                htmlFor="state"
                className="publish-form-location-label publish-form-label"
              >
                Provincia
              </label>
              <input
                type="text"
                name="state"
                value={state.location.state}
                onChange={(e) =>
                  dispatch({
                    type: "setLocation",
                    field: "state",
                    value: e.target.value,
                  })
                }
              />
            </div>
            <div className="publish-form-location-div">
              <label
                htmlFor="country"
                className="publish-form-location-label publish-form-label"
              >
                País
              </label>
              <input
                type="text"
                name="country"
                value={state.location.country}
                onChange={(e) =>
                  dispatch({
                    type: "setLocation",
                    field: "country",
                    value: e.target.value,
                  })
                }
              />
            </div>
          </div>
          <div>
            {characteristics.map((title) => {
              let formatTitle = camelizeText(title);
              return (
                <div key={formatTitle}>
                  <label htmlFor={formatTitle}>{title}</label>
                  <input
                    value={state.characteristics[formatTitle]}
                    onChange={(e) =>
                      dispatch({
                        type: "charact",
                        value: e.target.value,
                        field: formatTitle,
                      })
                    }
                    name={formatTitle}
                    type="text"
                  />
                </div>
              );
            })}
          </div>
          <div>
            {attributes.map((title) => {
              let formatRef = camelizeText(title);
              return (
                <div key={formatRef}>
                  <label htmlFor={formatRef}>{title}</label>
                  <input
                    onChange={(e) =>{
                      // console.log(state.attributes[formatRef])
                      dispatch({
                        type: "feature",
                        value: e.target.checked,
                        field: formatRef,
                      })}
                    }
                    name={formatRef}
                    type="checkbox"
                    value={state.attributes[formatRef]}
                  />
                </div>
              );
            })}
          </div>
          <div>
            <label htmlFor="featured">
              Marcar esta propiedad como propiedad destacada
            </label>
            <input
              name="featured"
              type="checkbox"
              onChange={(e) =>
                dispatch({ type: "toggleField", field: "featured" })
              }
            />
          </div>
          <div>
            <label htmlFor="terms">
              Acepte los términos y condiciones antes de enviar la propiedad.
            </label>
            <input name="terms" type="checkbox" />
          </div>
          <button type="submit">Enviar Propiedad</button>
        </form>
      </div>
    </div>
  );
};

export default Publicar;


