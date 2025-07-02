const LoginMeli = () => {
  const CLIENT_ID = process.env.REACT_APP_CLIENT_ID_MERCADOLIBRE; 
  const REDIRECT_URI = "https://aguazarca.com.ar/api/auth_callback.php";

  const loginUrl = `https://auth.mercadolibre.com.ar/authorization?response_type=code&client_id=${CLIENT_ID}&redirect_uri=${encodeURIComponent(
    REDIRECT_URI
  )}`;

  return (
    <a href={loginUrl} className="meli-login-link">
      <button className="meli-login-button">Iniciar sesión con Mercado Libre</button>
    </a>
  );
};

export default LoginMeli;