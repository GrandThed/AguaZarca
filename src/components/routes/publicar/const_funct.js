import axios from "axios";

export const attributes = [
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
  "Lavadero",
  "Tour virtual",
];

export const characteristics = [
  "Dormitorios",
  "Superficie cubierta",
  "Cantidad de pisos",
  "Baños",
  "Cocheras",
  "Superficie total",
  "Bodegas",
];

export const setInitialState = (array, value) => {
  return array.reduce((acc, e) => {
    acc = { ...acc, [camelizeText(e)]: value };
    return acc;
  }, {});
};
export const camelizeText = (str) => {
  return str
    .toLowerCase()
    .replace(/[^a-zA-Z0-9]+(.)/g, (m, chr) => chr.toUpperCase());
};

export const convertObjToListInAttributes = (array) => {
  let arrayKeys = array.reduce((acc, e) => {
    acc = { ...acc, [camelizeText(e.name)]: e.value_name === "Sí" };
    return acc;
  }, {});
  return arrayKeys;
};

export const convertObjToListInCharacteristics = (array) => {
  let arrayKeys = array.reduce((acc, e) => {
    acc = { ...acc, [camelizeText(e.name)]: e.value_name };
    return acc;
  }, {});
  return arrayKeys;
};

export const initialState = {
  mercadolibre: {
    id: "",
    link: "",
  },
  title: "",
  description: "",
  type: "Departamento",
  comercialStatus: "Alquiler temporal",
  price: {
    value: "",
    currency: "USD",
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

export const dropdownVariables = {
  type: ["Departamento", "Hotel", "Local comercial"],
  status: ["Alquiler temporal", "Alquiler anual", "vendido"],
  correncyOptions: ["USD", "ARS", "EUR"],
};

export const fetchEffect = async (itemId) => {
  return await axios(`https://api.mercadolibre.com/items/${itemId}`);
};

export const mlFullfil = (data, att) => {
  let location = data.location;
  let attributes = data.attributes;
  let attListml = convertObjToListInAttributes([...attributes.slice(0, 29), attributes[41], attributes[29]]);
  let attList = att.reduce((acc, e) => {
    let camele = camelizeText(e);
    let value = attListml[camele] || false;
    return { ...acc, [camele]: value };
  }, {});
  let charListml = convertObjToListInCharacteristics(attributes.slice(30, 37));

  let filled = {
    mercadolibre: {
      id: data.id,
      link: data.permalink,
    },
    title: data.title,
    type: attributes[39].value_name,
    comercialStatus: attributes[37].value_name,
    price: {
      value: data.price,
      currency: data.currency_id,
    },
    images: [],
    characteristics: charListml,
    attributes: attList,
    //this should be set on form.
    description: "",
    featured: false,
    revisorMesagge: "",
    //this should be set on form. end
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

export const doImageListFromFiles = (files) => {
  return files.map((file) => {
    if (!file){
      return null
    }
    return (
      <li className="publish-form-images-container" key={file.name}>
        <img className="publish-form-images-images" src={(window.URL || window.webkitURL).createObjectURL(file)} alt="imagen no valida" />
      </li>
    );
  });
};

