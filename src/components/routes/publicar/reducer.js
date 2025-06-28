export const reducer = (state, action) => {
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
      return {...state, ...action.value};
    case "setAll":
      return { ...state, ...action.value };

    default:
      return state;
  }
};
