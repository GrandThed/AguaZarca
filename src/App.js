import React from 'react'
import {BrowserRouter  as Router, Route} from 'react-router-dom'


import {Menu} from './components/menu/menu'
import AlquilerAnual from './components/routes/alquiler-anual/AlquilerAnual'
import AlquilerTemporal from './components/routes/alquiler-temporal/AlquilerTemporal'
import Contacto from './components/routes/contacto/Contacto'
import Home from './components/routes/home/Home'
import Noticias from './components/routes/noticias/Noticias'
import Publicar from './components/routes/publicar/Publicar'
import Venta from './components/routes/venta/Venta'

const App = () =>{
  return (
    <div className="App">
      <Router>
        <Menu></Menu>
        <Route path="/" exact component={Home}></Route>
        <Route path="/venta" component={Venta}></Route>
        <Route path="/alquiler-temporario" component={AlquilerTemporal}></Route>
        <Route path="/alquiler-anual" component={AlquilerAnual}></Route>
        <Route path="/noticias" component={Noticias}></Route>
        <Route path="/contacto" component={Contacto}></Route>
        <Route path="/publicar-propiedad" component={Publicar}></Route>
      </Router>
    </div>
  );
}

export default App;
