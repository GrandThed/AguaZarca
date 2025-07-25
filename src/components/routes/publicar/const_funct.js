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
  "Agua corriente",
];

export const characteristics = [
  "Dormitorios",
  "Superficie cubierta",
  "Cantidad de pisos",
  "Baños",
  "Cocheras",
  "Superficie total",
  "Ambientes",
  "Horario check out",
  "Horario check in",
  "Camas",
  "Huéspedes",
  "Estadía mínima (noches)",
  "Antigüedad",
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

const mapPropertyType = (mlType) => {
  const typeMapping = {
    'Apartamento': 'Departamento',
    'Casa': 'Casa',
    'PH': 'Ph',
    'Quinta': 'Quintas',
    'Terreno': 'Terrenos y Lotes',
    'Oficina': 'Oficinas',
    'Local': 'Locales',
    'Depósito': 'Depósitos y Galpones',
    'Galpón': 'Depósitos y Galpones',
    'Campo': 'Campos',
    'Chacra': 'Campos',
    'Fondo de comercio': 'Fondo de Comercio',
    'Hotel': 'Otros Inmuebles',
    'Cochera': 'Cocheras',
    'Consultorio': 'Consultorios',
    'Edificio': 'Otros Inmuebles'
  };
  return typeMapping[mlType] || 'Departamento';
};

const mapCommercialStatus = (mlOperation) => {
  const statusMapping = {
    'Venta': 'Venta',
    'Alquiler': 'Alquiler anual',
    'Alquiler temporal': 'Alquiler temporal',
    'Alquiler por día': 'Alquiler temporal'
  };
  return statusMapping[mlOperation] || 'Alquiler temporal';
};

const extractAdvancedAttributes = (mlAttributes, localAttributes) => {
  const extractedAttributes = {};
  
  // Create a mapping of ML attribute names to local attribute names
  const mlToLocalMapping = {
    // Direct ML API attribute name mappings based on real API response
    'Jardín': 'Jardín',
    'Cocina': 'Cocina', 
    'Patio': 'Patio',
    'Acceso a internet': 'Acceso a internet',
    'Gas natural': 'Gas natural',
    'Pileta': 'Pileta',
    'Placards': 'Placards',
    'Agua corriente': 'Agua corriente',
    
    // Additional pattern mappings for variations
    'Pool': 'Pileta',
    'Swimming pool': 'Pileta',
    'Piscina': 'Pileta',
    'A/C': 'Aire acondicionado',
    'Air conditioning': 'Aire acondicionado',
    'AC': 'Aire acondicionado',
    'Heating': 'Calefacción',
    'Caldera': 'Calefacción',
    'Radiador': 'Calefacción',
    'Balcony': 'Balcón',
    'Terraza': 'Terraza',
    'Terrace': 'Terraza',
    'Garden': 'Jardín',
    'Yard': 'Jardín',
    'Garage': 'Cocheras',
    'Parking': 'Cocheras', 
    'Estacionamiento': 'Cocheras',
    'Security': 'Seguridad 24 horas',
    '24hs': 'Seguridad 24 horas',
    'Portero': 'Seguridad 24 horas',
    'Gym': 'Gimnasio',
    'Fitness': 'Gimnasio',
    'Elevator': 'Ascensor',
    'Lift': 'Ascensor',
    'Furnished': 'Amoblado',
    'Mobiliario': 'Amoblado'
  };
  
  mlAttributes.forEach(attr => {
    const mlAttrName = attr.name;
    const mlAttrValue = attr.value_name;
    
    // Only process boolean attributes (value_type: "boolean")
    if (attr.value_type === 'boolean') {
      // First: Try direct name matching
      if (localAttributes.includes(mlAttrName)) {
        extractedAttributes[mlAttrName] = mlAttrValue === 'Sí';
      }
      // Second: Try mapping table
      else if (mlToLocalMapping[mlAttrName] && localAttributes.includes(mlToLocalMapping[mlAttrName])) {
        extractedAttributes[mlToLocalMapping[mlAttrName]] = mlAttrValue === 'Sí';
      }
      // Third: Try pattern matching for any unmapped attributes
      else {
        localAttributes.forEach(localAttr => {
          const variations = Object.keys(mlToLocalMapping).filter(key => 
            mlToLocalMapping[key] === localAttr
          );
          
          if (variations.some(variation => 
            mlAttrName.toLowerCase().includes(variation.toLowerCase())
          )) {
            extractedAttributes[localAttr] = mlAttrValue === 'Sí';
          }
        });
      }
    }
  });

  return extractedAttributes;
};

export const mlFullfil = ({ info, description }, att = attributes) => {
  if (!info) {
    return { description: description ? description.data.plain_text : "" };
  }

  const { id, permalink, title, price, currency_id, location, attributes: mlAttributes, video_id } = info.data;
  const { address_line, neighborhood, city, state, country } = location;

  // Find property type and operation from attributes
  const propertyTypeAttr = mlAttributes.find(attr => attr.id === "PROPERTY_TYPE");
  const operationAttr = mlAttributes.find(attr => attr.id === "OPERATION");

  // Standard attribute mapping
  let attListml = convertObjToListInAttributes(
    mlAttributes.filter((e) => att.includes(e.name))
  );
  
  // Advanced attribute extraction with local attributes array
  const advancedAttrs = extractAdvancedAttributes(mlAttributes, att);
  
  // Combine both attribute lists
  let attList = att.reduce((acc, e) => {
    const value = attListml[e] || advancedAttrs[e] || false;
    return { ...acc, [e]: value };
  }, {});

  // Enhanced characteristics mapping
  let charListml = convertObjToListInCharacteristics(
    mlAttributes.filter((e) => characteristics.includes(e.name))
  );

  // Enhanced characteristics extraction with comprehensive mapping
  const additionalChars = {};
  
  // Create comprehensive characteristics mapping
  const characteristicsMappings = {
    "Superficie total": ["Superficie total", "Total area"],
    "Superficie cubierta": ["Superficie cubierta", "Covered area"], 
    "Ambientes": ["Ambientes", "Rooms"],
    "Dormitorios": ["Dormitorios", "Bedrooms"],
    "Baños": ["Baños", "Bathrooms", "Full bathrooms"],
    "Cocheras": ["Cocheras", "Parking spaces", "Parking lots"],
    "Cantidad de pisos": ["Cantidad de pisos", "Floors"],
    "Antigüedad": ["Antigüedad", "Property age", "Age"]
  };
  
  mlAttributes.forEach(attr => {
    const mlAttrName = attr.name;
    const mlAttrValue = attr.value_name;
    
    // Only process number and number_unit attributes for characteristics
    if (attr.value_type === 'number' || attr.value_type === 'number_unit') {
      // First: Direct name matching
      if (characteristics.includes(mlAttrName)) {
        additionalChars[mlAttrName] = mlAttrValue;
      }
      // Second: Try mapping variations
      else {
        Object.keys(characteristicsMappings).forEach(localChar => {
          const variations = characteristicsMappings[localChar];
          if (variations.some(variation => 
            mlAttrName.toLowerCase() === variation.toLowerCase()
          )) {
            additionalChars[localChar] = mlAttrValue;
          }
        });
      }
    }
  });

  // Merge characteristics
  const finalCharacteristics = { ...charListml, ...additionalChars };

  return {
    mercadolibre: {
      id,
      link: permalink,
    },
    title: title,
    type: propertyTypeAttr ? mapPropertyType(propertyTypeAttr.value_name) : 'Departamento',
    comercialStatus: operationAttr ? mapCommercialStatus(operationAttr.value_name) : 'Alquiler temporal',
    price: {
      value: price,
      currency: currency_id,
    },
    characteristics: finalCharacteristics,
    attributes: attList,
    description: description ? description.data.plain_text : "",
    featured: false,
    slider: false,
    rentalFeatured: false,
    revisorMesagge: "",
    location: {
      addressLine: address_line || "",
      neighborhood: neighborhood?.name || "",
      city: city?.name || "",
      state: state?.name || "Córdoba",
      country: country?.name || "Argentina",
    },
    video_id: video_id || "",
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
