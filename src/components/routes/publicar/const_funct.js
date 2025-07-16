import axios from "axios";
import { storage } from "../../../firebase";
import { compressImage } from "../../../utils/imageOptim";
import { PROPERTY_TYPES } from "../../../constants/propertyTypes";

export const attributes = [
  "Heladera",
  "Microondas",
  "Servicio de limpieza",
  "Servicio de desayuno",
  "Apto para familias con niños",
  "Solo familias",
  "Se admiten mascotas",
  "Acceso a internet",
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
  "Jardín",
  "Living",
  "Gas natural",
  "Luz eléctrica",
  "Línea telefónica",
  "Patio",
  "Pileta",
  "Placards",
  "Playroom",
  "Parrilla",
  "Portón automático",
  "Seguridad 24 horas",
  "Terraza",
  "Toilette",
  "Vestidor",
  "Lavadero",
];

export const characteristics = [
  "Dormitorios",
  "Superficie cubierta",
  "Cantidad de pisos",
  "Baños",
  "Cocheras",
  "Superficie total",
  "Horario check out",
  "Horario check in",
  "Camas",
  "Huéspedes",
  "Estadía mínima (noches)",
];

export const ubicationFields = [
  { dispatchField: "addressLine", name: "Dirección" },
  { dispatchField: "neighborhood", name: "Barrio " },
  { dispatchField: "city", name: "Ciudad " },
  { dispatchField: "state", name: "Provincia" },
  { dispatchField: "country", name: "País" },
];

export const setInitialState = (array, value) => {
  return array.reduce((acc, e) => {
    acc = { ...acc, [e]: value };
    return acc;
  }, {});
};

export const initialState = {
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
  rentalFeatured: false,
  slider: false,
  revisorMesagge: "",
  location: {
    addressLine: "",
    neighborhood: "",
    city: "",
    state: "Córdoba",
    country: "Argentina",
  },
  video_id: "",
};

export const dropdownVariables = {
  type: PROPERTY_TYPES,
  status: ["Alquiler temporal", "Alquiler anual", "Venta"],
  correncyOptions: ["USD", "ARS", "EUR"],
};

export const convertObjToListInAttributes = (array) => {
  let arrayKeys = array.reduce((acc, e) => {
    acc = { ...acc, [e.name]: e.value_name === "Sí" };
    return acc;
  }, {});
  return arrayKeys;
};

export const convertObjToListInCharacteristics = (array) => {
  let arrayKeys = array.reduce((acc, e) => {
    acc = { ...acc, [e.name]: e.value_name };
    return acc;
  }, {});
  return arrayKeys;
};

export const fetchEffect = async (itemId, token) => {
  const headers = {
    Authorization: `Bearer ${token}`,
  };
  const axiosProvider = (url) => axios.get(url, { headers });

  const [infoRes, descRes] = await Promise.allSettled([
    axiosProvider(`https://aguazarca.com.ar/api/get_item.php?item=${itemId}`),
    axiosProvider(`https://aguazarca.com.ar/api/get_item_description.php?item=${itemId}`),
  ]);

  const result = {};
  if (infoRes.status === "fulfilled") result.info = infoRes.value;
  if (descRes.status === "fulfilled") result.description = descRes.value;
  return result;
};

export const mlFullfil = ({ info, description }, att = attributes) => {
  if (!info) {
    return { description: description ? description.data.plain_text : "" };
  }

  const { id, permalink, title, price, currency_id, location, attributes: mlAttributes, video_id } = info.data;
  const { address_line, neighborhood, city, state, country } = location;

  // MercadoLibre ya no provee attribute_group_id. Filtramos por nombre.
  let attListml = convertObjToListInAttributes(
    mlAttributes.filter((e) => att.includes(e.name))
  );
  let attList = att.reduce((acc, e) => {
    const value = attListml[e] || false;
    return { ...acc, [e]: value };
  }, {});

  let charListml = convertObjToListInCharacteristics(
    mlAttributes.filter((e) => characteristics.includes(e.name))
  );
  return {
    mercadolibre: {
      id,
      link: permalink,
    },
    title: title,
    type: attributes.filter((e) => e.id === "PROPERTY_TYPE")[0].value_name,
    comercialStatus: attributes.filter((e) => e.id === "OPERATION")[0].value_name,
    price: {
      value: price,
      currency: currency_id,
    },
    characteristics: charListml,
    attributes: attList,
    //this should be set on form.
    description: description ? description.data.plain_text : "",
    featured: false,
    slider: false,
    rentalFeatured: false,
    revisorMesagge: "",
    //this should be set on form. end
    location: {
      addressLine: address_line,
      neighborhood: neighborhood.name,
      city: city.name,
      state: state.name,
      country: country.name,
    },
    video_id,
  };
};

export const doImageListFromFiles = (files, remove) => {
  return files.map((file, index) => {
    if (!file) {
      return null;
    }
    const src = typeof file === "string" ? file : (window.URL || window.webkitURL).createObjectURL(file);
    const key = file.name || index;
    return (
      <li className="publish-form-images-container" key={key}>
        <button type="button" className="publish-form-delete-images" onClick={() => remove(index)}>
          ×
        </button>
        <img className="publish-form-images-images" src={src} alt="imagen no valida" />
      </li>
    );
  });
};

export const addImagesToFirebaseAndReturnUrl = (files, nameShorcut) => {
  const path = `images/${nameShorcut}/`;
  return files.map(async (file) => {
    const compressed = await compressImage(file);
    let ref = storage.ref(path + compressed.name);
    return ref.put(compressed).then(
      () => ref.getDownloadURL(),
      (error) => console.error(error.message)
    );
  });
};
