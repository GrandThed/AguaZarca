import React from "react";
import { BrowserRouter as Router, Route, Switch } from "react-router-dom";

import { Menu } from "./components/menu/menu";
import Footer from "./components/footer/Footer";

import * as ROUTES from "./routes";
// routes
import AlquilerAnual from "./components/routes/alquiler-anual/AlquilerAnual";
import AlquilerTemporal from "./components/routes/alquiler-temporal/AlquilerTemporal";
import Contacto from "./components/routes/contacto/Contacto";
import Home from "./components/routes/home/Home";
import Noticias from "./components/routes/noticias/Noticias";
import Publicar from "./components/routes/publicar/Publicar";
import Propiedad from "./components/routes/propiedad/Propiedad";
import Registro from "./components/routes/registro/Registro";
import Venta from "./components/routes/venta/Venta";
import NoMatch from "./components/routes/noMatch/NoMatch";

const App = () => {
  return (
    <div className="App">
      <Router>
        <Menu />
        <Switch>
          <Route path={ROUTES.HOME} exact component={Home}></Route>
          <Route path={ROUTES.VENTA} component={Venta}></Route>
          <Route path={ROUTES.ALQUILER_TEMPORAL} component={AlquilerTemporal}></Route>
          <Route path={ROUTES.ALQUILER_ANUAL} component={AlquilerAnual}></Route>
          <Route path={ROUTES.NOTICIAS} component={Noticias}></Route>
          <Route path={ROUTES.CONTACTO} component={Contacto}></Route>
          <Route path={ROUTES.PUBLICAR} component={Publicar}></Route>
          <Route path={ROUTES.PRODUCTO} component={Propiedad}></Route>
          <Route path={ROUTES.REGISTRO} component={Registro}></Route>
          <Route path={"*"} component={NoMatch}></Route>
        </Switch>
        <Footer />
      </Router>
    </div>
  );
};

export default App;
