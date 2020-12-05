import React, { useReducer, useEffect } from "react";
import "./registro.css";
import { auth, firestore } from "../../../firebase";
import { Redirect } from "react-router-dom";
import { HOME } from "../../../routes";

const Registro = () => {
  const [state, dispatch] = useReducer(reducer, initialState);

  const handleChange = (e) => {
    dispatch({ type: "field", field: e.target.name, value: e.target.value });
  };

  useEffect(() => {
    let { username, password, email } = state.form;
    if (username || password || email) {
      dispatch({ type: "disableState", value: false });
    } else {
      dispatch({ type: "disableState", value: true });
    }
  }, [state.form]);
  const handleSubmit = () => {
    let { email, password, username, phonenumber, wspnumber } = state.form;
    auth
      .createUserWithEmailAndPassword(email, password)
      .then(() => firestore.collection("usersInfo").add({ username, phonenumber, wspnumber, email }))
      .then(() => dispatch({ type: "redirect", value: true }))
      .catch((e) => console.log(e));
  };

  return (
    <div className="register-div">
      {state.redirect && <Redirect to={HOME} />}
      <form className="register-form">
        <h3 className="register-title">Registrarse</h3>
        <input
          onChange={handleChange}
          value={state.form.username}
          spellCheck={false}
          name="username"
          type="text"
          className="register-input"
          placeholder="Nombre del agente"
        />
        <input
          onChange={handleChange}
          value={state.form.password}
          spellCheck={false}
          name="password"
          type="text"
          className="register-input"
          placeholder="Contraseña"
        />
        <input
          onChange={handleChange}
          value={state.form.phonenumber}
          spellCheck={false}
          name="phonenumber"
          type="number"
          className="register-input"
          placeholder="Numbero de telefono"
        />
        <input
          onChange={handleChange}
          value={state.form.wspnumber}
          spellCheck={false}
          name="wspnumber"
          type="number"
          className="register-input"
          placeholder="Numero de whatsapp"
        />
        <input
          onChange={handleChange}
          value={state.form.email}
          spellCheck={false}
          name="email"
          type="email"
          className="register-input"
          placeholder="Email del agente"
        />
        <input
          onClick={handleSubmit}
          disabled={state.disableState}
          name="submit"
          type="button"
          className="register-submit"
          value="Registrarse"
        />
      </form>
    </div>
  );
};

const reducer = (state, action) => {
  switch (action.type) {
    case "field":
      return {
        ...state,
        form: {
          ...state.form,
          [action.field]: action.value,
        },
      };
    case "disableState":
      return {
        ...state,
        disableState: action.value,
      };
    case "redirect":
      return {
        ...state,
        redirect: action.value,
      };
    default:
      return state;
  }
};

const initialState = {
  form: {
    username: "",
    password: "",
    phonenumber: "",
    wspnumber: "",
    email: "",
  },
  disableState: true,
  redirect: false,
};

// const storeUserExtraInfoInFirebase = (userInfo = {}) => {
//   .then(e => e)
// };

export default Registro;
