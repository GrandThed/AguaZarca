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
import Dashboard from "./components/routes/dashboard/Dashboard";
import Venta from "./components/routes/venta/Venta";
import Type from "./components/routes/tipo-de-propiedad/Type";
import NoMatch from "./components/routes/noMatch/NoMatch";
import GlobalSearch from "./components/routes/global-search/GlobalSearch";
import ScrollToTop from "./components/scrollToTop/ScrollToTop";


const App = () => {
  return (
    <div className="App">
      <Router>
        {/* menu spacer for the responsive menu */}
        <div className="menu-spacer" />
        <Menu />
        <ScrollToTop></ScrollToTop>
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
          <Route path={ROUTES.DASHBOARD} component={Dashboard}></Route>
          <Route path={ROUTES.TIPO_DE_PROPIEDAD} component={Type}></Route>
          <Route path={ROUTES.BUSQUEDA_GLOBAL} component={GlobalSearch}></Route>
          <Route path={"*"} component={NoMatch}></Route>
        </Switch>
        <Footer />
      </Router>
    </div>
  );
};

export default App;
