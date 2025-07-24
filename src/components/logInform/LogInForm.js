import React, { useState } from "react";
import { useAuthState } from "react-firebase-hooks/auth";
import { auth } from "../../firebase";
import "./loginform.css";
import { Link } from "react-router-dom";
import { DASHBOARD } from "../../routes";
const LogInForm = () => {
  const [user] = useAuthState(auth);
  return <div className="log-div">{user ? <LogOut /> : <LogInFormOn />}</div>;
};

const LogOut = () => {
  return (
    <div className="log-form">
      <p className="log-email">{auth.currentUser.email}</p>
      <Link to={DASHBOARD} className="log-dashboard">
        Dashboard
      </Link>
      <button className="log-button" onClick={(e) => auth.signOut()}>
        Cerrar sesión
      </button>
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
      <form className="log-form" role="form" aria-labelledby="login-title">
        <h2 id="login-title" className="log-title">Iniciar sesión</h2>
        <div className="form-field">
          <label htmlFor="email" className="log-label">Correo Electrónico</label>
          <input
            id="email"
            required={true}
            type="email"
            className="log-input contact-field"
            placeholder="ejemplo@correo.com"
            value={user}
            onChange={(e) => setUser(e.target.value)}
            aria-describedby="email-help"
          />
          <span id="email-help" className="sr-only">Ingresa tu dirección de correo electrónico</span>
        </div>
        <div className="form-field">
          <label htmlFor="password" className="log-label">Contraseña</label>
          <input
            id="password"
            required={true}
            type="password"
            className="log-input contact-field"
            placeholder="Tu contraseña"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            aria-describedby="password-help"
          />
          <span id="password-help" className="sr-only">Ingresa tu contraseña</span>
        </div>
        <button type="button" className="log-button" onClick={handleLogIn} aria-describedby="login-action">
          Entrar
        </button>
        <span id="login-action" className="sr-only">Iniciar sesión con tus credenciales</span>
      </form>
    </div>
  );
};

export default LogInForm;
