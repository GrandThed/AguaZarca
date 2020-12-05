import React, { useState } from "react";
import {useAuthState} from 'react-firebase-hooks/auth'
import { auth } from "../../firebase";
import "./loginform.css";

const LogInForm = () => {
   const [user] =  useAuthState(auth)
  return <div className="log-div">{user ? <LogOut /> : <LogInFormOn />}</div>;
};

const LogOut = () => {
  return (
    <div >
      <button className="log-button" onClick={(e) => auth.signOut()}>Cerrar sesión</button>
    </div>
  );
};

const LogInFormOn = () => {
  const [password, setPassword] = useState("");
  const [user, setUser] = useState("");
  const handleLogIn = () => {
    auth
      .signInWithEmailAndPassword(user, password)
      .then((e) => console.log(e))
      .catch((e) => console.log(e));
  };

  return (
    <div>
      <form className="log-form">
        <h2 className="log-title">Iniciar sesion</h2>
        <input
          required={true}
          type="email"
          className="log-input contact-field"
          placeholder="Correo Electronico"
          value={user}
          onChange={(e) => setUser(e.target.value)}
        />
        <input
          required={true}
          type="password"
          className="log-input contact-field"
          placeholder="Contraseña"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <input type="button" className="log-button" onClick={handleLogIn} value="Entrar" />
      </form>
    </div>
  );
};

export default LogInForm;
